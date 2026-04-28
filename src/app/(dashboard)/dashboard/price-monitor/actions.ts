"use server";

import { createClient } from "@/lib/supabase/server";
import { searchAllMalls, findLowest } from "@/lib/price-api";
import { yahooProvider } from "@/lib/providers/yahoo-provider";
import { rakutenProvider } from "@/lib/providers/rakuten-provider";
import { analyze } from "@/lib/suggestion-engine";
import type {
  Product,
  CompetitorItem,
  Suggestion,
  SearchHistoryEntry,
  SearchQuery,
  BenchmarkShop,
  BenchmarkResult,
  SelfMallPrice,
} from "@/types/price-monitor";

export interface SearchResponse {
  items: CompetitorItem[];
  errors: { mall: string; message: string }[];
  lowest: ReturnType<typeof findLowest>;
  myProduct: Product | null;
  suggestion: Suggestion | null;
  count: number;
  benchmarks: BenchmarkResult[];
  selfMallPrices: { yahoo: SelfMallPrice; rakuten: SelfMallPrice };
}

// violal 自身の Yahoo / 楽天 出品から、現在の query に該当する商品を取得して価格を返す
async function fetchSelfMallPrices(query: SearchQuery): Promise<{
  yahoo: SelfMallPrice;
  rakuten: SelfMallPrice;
}> {
  const yahooSellerId = process.env.VIOLAL_YAHOO_SELLER_ID;
  const rakutenShopCode = process.env.VIOLAL_RAKUTEN_SHOP_CODE;

  function pickTop(mall: "Yahoo" | "楽天", items: CompetitorItem[]): SelfMallPrice {
    if (items.length === 0) return { mall, found: false };
    const top = items[0];
    return {
      mall,
      found: true,
      item_name: top.item_name,
      price: top.price,
      shipping_fee: top.shipping_fee,
      shipping_name: top.shipping_name,
      effective_price: top.effective_price,
      url: top.url,
    };
  }

  const [yahoo, rakuten] = await Promise.all([
    yahooSellerId
      ? yahooProvider
          .fetchFromSeller(query, yahooSellerId)
          .then((items) => pickTop("Yahoo", items))
          .catch(() => ({ mall: "Yahoo", found: false } as SelfMallPrice))
      : Promise.resolve({ mall: "Yahoo", found: false } as SelfMallPrice),
    rakutenShopCode
      ? rakutenProvider
          .fetchFromShop(query, rakutenShopCode)
          .then((items) => pickTop("楽天", items))
          .catch(() => ({ mall: "楽天", found: false } as SelfMallPrice))
      : Promise.resolve({ mall: "楽天", found: false } as SelfMallPrice),
  ]);

  return { yahoo, rakuten };
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

  // 1社につき (Yahoo, 楽天) の組み合わせでフェッチタスクを並列実行
  async function fetchOne(
    shop: BenchmarkShop,
    mall: "Yahoo" | "楽天",
    fetcher: () => Promise<typeof query extends never ? never : Awaited<ReturnType<typeof yahooProvider.fetchFromSeller>>>
  ): Promise<BenchmarkResult> {
    try {
      const items = await fetcher();
      if (items.length === 0) return { shop, mall, found: false };
      const top = items[0]; // price ASC でソート済み
      const effective = top.effective_price ?? top.price;
      const diff = myProduct.my_price - effective;
      const ratio = effective > 0 ? diff / effective : 0;
      return {
        shop,
        mall,
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
      return { shop, mall, found: false };
    }
  }

  const tasks: Promise<BenchmarkResult>[] = [];
  for (const shop of shops) {
    if (shop.yahoo_seller_id) {
      tasks.push(fetchOne(shop, "Yahoo", () => yahooProvider.fetchFromSeller(query, shop.yahoo_seller_id)));
    }
    if (shop.rakuten_shop_code) {
      tasks.push(fetchOne(shop, "楽天", () => rakutenProvider.fetchFromShop(query, shop.rakuten_shop_code!)));
    }
  }
  const results = await Promise.all(tasks);

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

  // myProduct が見つかったら、JAN（DB登録 or 自動収集済み）・brand・model を query に追加。
  // JAN は検索精度最優先パスなので、フォーム入力 > DB登録値 の順で採用。
  // name は DB の正式名称（キッズ/撥水 等のカテゴリ語を含む）を優先することで、provider 側の
  // NOISE/KIDS フィルタ緩和判定を正しく効かせる。
  const baseQuery = { name, jan, model };
  const enrichedQuery = myProduct
    ? {
        ...baseQuery,
        name: myProduct.name ?? baseQuery.name,
        jan: baseQuery.jan ?? myProduct.jan ?? undefined,
        brand: myProduct.brand ?? undefined,
        model: myProduct.model ?? undefined,
      }
    : baseQuery;

  // 通常の全モール検索 / ベンチマーク3社 / 自社モール価格 を並列実行
  const emptySelfPrices: { yahoo: SelfMallPrice; rakuten: SelfMallPrice } = {
    yahoo: { mall: "Yahoo", found: false },
    rakuten: { mall: "楽天", found: false },
  };
  const [result, benchmarks, selfMallPrices] = await Promise.all([
    searchAllMalls(enrichedQuery),
    myProduct ? searchBenchmarks(enrichedQuery, myProduct) : Promise.resolve([] as BenchmarkResult[]),
    myProduct ? fetchSelfMallPrices(enrichedQuery) : Promise.resolve(emptySelfPrices),
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
    selfMallPrices,
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
  countsByMall: {
    urgent: { yahoo: number; rakuten: number };
    watch:  { yahoo: number; rakuten: number };
    good:   { yahoo: number; rakuten: number };
  };
  lastCheckedAt: string | null;
}

export async function loadProductsByLevel(
  level: "urgent" | "watch" | "good",
  mall?: "yahoo" | "rakuten"
): Promise<Product[]> {
  const supabase = await createClient();
  const levelValues =
    level === "watch" ? ["watch", "recommend", "monitor"] : [level];

  // 主モール方式: mall指定時は対応する SKU プレフィックス + そのモールの level カラムでフィルタ
  if (mall === "yahoo") {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("is_monitored", true)
      .like("sku", "SKU-Y%")
      .in("last_suggestion_level_yahoo", levelValues)
      .order("sales_rank");
    return (data ?? []) as Product[];
  }
  if (mall === "rakuten") {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("is_monitored", true)
      .like("sku", "SKU-R%")
      .in("last_suggestion_level_rakuten", levelValues)
      .order("sales_rank");
    return (data ?? []) as Product[];
  }

  // mall 未指定時: 旧ロジック（combined level）
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
    .select("sku, last_suggestion_level_yahoo, last_suggestion_level_rakuten, last_checked_at_yahoo, last_checked_at_rakuten")
    .eq("is_monitored", true);

  // 主モール方式: SKU-Y* は Yahoo戦線の level だけ、SKU-R* は楽天戦線の level だけを集計
  // → 1 SKU = 1 カウント（合計が SKU 数と一致）
  const counts = { urgent: 0, watch: 0, good: 0 };
  const countsByMall = {
    urgent: { yahoo: 0, rakuten: 0 },
    watch:  { yahoo: 0, rakuten: 0 },
    good:   { yahoo: 0, rakuten: 0 },
  };
  let latestIso: string | null = null;

  function normalize(rawLevel: string | null): "urgent" | "watch" | "good" | null {
    const level = rawLevel === "recommend" || rawLevel === "monitor" ? "watch" : rawLevel;
    return level === "urgent" || level === "watch" || level === "good" ? level : null;
  }

  (data ?? []).forEach((p) => {
    const sku = String(p.sku ?? "");
    let level: "urgent" | "watch" | "good" | null = null;
    let mall: "yahoo" | "rakuten" | null = null;
    let ts: string | null = null;

    if (sku.startsWith("SKU-Y")) {
      level = normalize(p.last_suggestion_level_yahoo as string | null);
      mall = "yahoo";
      ts = p.last_checked_at_yahoo as string | null;
    } else if (sku.startsWith("SKU-R")) {
      level = normalize(p.last_suggestion_level_rakuten as string | null);
      mall = "rakuten";
      ts = p.last_checked_at_rakuten as string | null;
    }

    if (level && mall) {
      counts[level]++;
      countsByMall[level][mall]++;
    }
    if (ts && (!latestIso || ts > latestIso)) latestIso = ts;
  });

  return {
    totalMonitored: data?.length ?? 0,
    counts,
    countsByMall,
    lastCheckedAt: latestIso,
  };
}
