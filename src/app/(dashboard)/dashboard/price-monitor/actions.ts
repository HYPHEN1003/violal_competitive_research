"use server";

import { createClient } from "@/lib/supabase/server";
import { searchAllMalls, findLowest } from "@/lib/price-api";
import { analyze } from "@/lib/suggestion-engine";
import type {
  Product,
  CompetitorItem,
  Suggestion,
  SearchHistoryEntry,
} from "@/types/price-monitor";

export interface SearchResponse {
  items: CompetitorItem[];
  errors: { mall: string; message: string }[];
  lowest: ReturnType<typeof findLowest>;
  myProduct: Product | null;
  suggestion: Suggestion | null;
  count: number;
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

  const result = await searchAllMalls(enrichedQuery);
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
    recommend: number;
    monitor: number;
    good: number;
  };
  lastCheckedAt: string | null;
}

export async function loadProductsByLevel(
  level: "urgent" | "recommend" | "monitor" | "good"
): Promise<Product[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("is_monitored", true)
    .eq("last_suggestion_level", level)
    .order("sales_rank");
  return (data ?? []) as Product[];
}

export async function loadMonitorSummary(): Promise<MonitorSummary> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("last_suggestion_level, last_checked_at")
    .eq("is_monitored", true);

  const counts = { urgent: 0, recommend: 0, monitor: 0, good: 0 };
  let latestIso: string | null = null;

  (data ?? []).forEach((p) => {
    const level = p.last_suggestion_level as keyof typeof counts | null;
    if (level && level in counts) counts[level]++;
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
