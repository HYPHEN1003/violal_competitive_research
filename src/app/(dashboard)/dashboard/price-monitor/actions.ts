"use server";

import { createClient } from "@/lib/supabase/server";
import { searchAllMalls, findLowest } from "@/lib/price-api";
import { yahooProvider } from "@/lib/providers/yahoo-provider";
import { analyze } from "@/lib/suggestion-engine";
import type {
  Product,
  CompetitorItem,
  Suggestion,
  SearchHistoryEntry,
  SearchQuery,
  BenchmarkShop,
  BenchmarkResult,
} from "@/types/price-monitor";

export interface SearchResponse {
  items: CompetitorItem[];
  errors: { mall: string; message: string }[];
  lowest: ReturnType<typeof findLowest>;
  myProduct: Product | null;
  suggestion: Suggestion | null;
  count: number;
  benchmarks: BenchmarkResult[];
}

async function searchBenchmarks(
  query: SearchQuery,
  myProduct: Product
): Promise<BenchmarkResult[]> {
  const supabase = await createClient();

  const { data: shopsData, error } = await supabase
    .from("benchmark_shops")
    .select("*")
    .eq("is_active", true)
    .order("priority");

  if (error || !shopsData) return [];
  const shops = shopsData as BenchmarkShop[];

  const results = await Promise.all(
    shops.map(async (shop): Promise<BenchmarkResult> => {
      try {
        const items = await yahooProvider.fetchFromSeller(query, shop.yahoo_seller_id);
        if (items.length === 0) {
          return { shop, found: false };
        }
        const top = items[0]; // price ASC でソート済みの最安
        const effective = top.effective_price ?? top.price;
        const diff = myProduct.my_price - effective;
        const ratio = effective > 0 ? diff / effective : 0;

        return {
          shop,
          found: true,
          item_name: top.item_name,
          price: top.price,
          shipping_fee: top.shipping_fee,
          shipping_name: top.shipping_name,
          effective_price: effective,
          url: top.url,
          jan_code: top.jan_code,
          diff_amount: diff,
          diff_ratio: ratio,
        };
      } catch {
        return { shop, found: false };
      }
    })
  );

  // JAN 自動収集: 自社 products.jan が未設定で、どれかで取れていたら保存
  if (!myProduct.jan) {
    const anyJan = results.find((r) => r.found && r.jan_code)?.jan_code;
    if (anyJan) {
      await supabase
        .from("products")
        .update({ jan: anyJan })
        .eq("id", myProduct.id);
    }
  }

  return results;
}

export async function searchCompetitors(
  formData: FormData
): Promise<SearchResponse> {
  const name = (formData.get("name") as string)?.trim() || undefined;
  const jan = (formData.get("jan") as string)?.trim() || undefined;
  const model = (formData.get("model") as string)?.trim() || undefined;

  if (!name && !jan && !model) {
    throw new Error("商品名、品番、またはJANコードのいずれかを入力してください");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 自社商品マスタからマッチング（品番 → JAN → 商品名 の順）
  let myProduct: Product | null = null;
  if (model) {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("model", model)
      .limit(1)
      .single();
    if (data) myProduct = data as Product;
  }
  if (!myProduct && jan) {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("jan", jan)
      .limit(1)
      .single();
    if (data) myProduct = data as Product;
  }
  if (!myProduct && name) {
    const { data } = await supabase
      .from("products")
      .select("*")
      .ilike("name", `%${name}%`)
      .limit(1)
      .single();
    if (data) myProduct = data as Product;
  }

  // myProduct が見つかったら、brand と model を query に追加して検索
  const baseQuery = { name, jan, model };
  const enrichedQuery = myProduct
    ? {
        ...baseQuery,
        brand: myProduct.brand ?? undefined,
        model: myProduct.model ?? undefined,
      }
    : baseQuery;

  // 通常の全モール検索とベンチマーク3社検索を並列実行
  const [result, benchmarks] = await Promise.all([
    searchAllMalls(enrichedQuery),
    myProduct ? searchBenchmarks(enrichedQuery, myProduct) : Promise.resolve([] as BenchmarkResult[]),
  ]);
  const lowest = findLowest(result.items);

  let suggestion: Suggestion | null = null;
  if (myProduct && result.items.length > 0) {
    suggestion = analyze({ myProduct, competitors: result.items });
  }

  // 検索履歴を保存
  if (user) {
    await supabase.from("search_history").insert({
      user_id: user.id,
      query_name: name ?? null,
      query_jan: jan ?? null,
      result_count: result.items.length,
      lowest_price: lowest?.price ?? null,
      lowest_mall: lowest?.mall ?? null,
      lowest_shop: lowest?.shop ?? null,
      matched_product_id: myProduct?.id ?? null,
      suggestion_level: suggestion?.level ?? null,
    });
  }

  return {
    items: result.items,
    errors: result.errors,
    lowest,
    myProduct,
    suggestion,
    count: result.items.length,
    benchmarks,
  };
}

export async function loadSearchHistory(): Promise<SearchHistoryEntry[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("search_history")
    .select("*")
    .eq("user_id", user.id)
    .order("searched_at", { ascending: false })
    .limit(10);

  return (data ?? []) as SearchHistoryEntry[];
}

export async function loadProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("is_monitored", true)
    .order("sku");

  return (data ?? []) as Product[];
}

export interface MonitorSummary {
  totalMonitored: number;
  counts: {
    urgent: number;
    watch: number;
    good: number;
  };
  lastCheckedAt: string | null;
}

export async function loadProductsByLevel(
  level: "urgent" | "watch" | "good"
): Promise<Product[]> {
  const supabase = await createClient();
  // watch は旧レベル（recommend / monitor）も含めて取得（マイグレーション前でも動くように）
  const levelValues =
    level === "watch" ? ["watch", "recommend", "monitor"] : [level];
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("is_monitored", true)
    .in("last_suggestion_level", levelValues)
    .order("sales_rank");
  return (data ?? []) as Product[];
}

export async function loadMonitorSummary(): Promise<MonitorSummary> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("last_suggestion_level, last_checked_at")
    .eq("is_monitored", true);

  const counts = { urgent: 0, watch: 0, good: 0 };
  let latestIso: string | null = null;

  (data ?? []).forEach((p) => {
    const raw = p.last_suggestion_level as string | null;
    // 旧レベル（recommend/monitor）は watch にマージしてカウント
    const level = raw === "recommend" || raw === "monitor" ? "watch" : raw;
    if (level && level in counts) counts[level as keyof typeof counts]++;
    if (p.last_checked_at && (!latestIso || p.last_checked_at > latestIso)) {
      latestIso = p.last_checked_at;
    }
  });

  return {
    totalMonitored: data?.length ?? 0,
    counts,
    lastCheckedAt: latestIso,
  };
}
