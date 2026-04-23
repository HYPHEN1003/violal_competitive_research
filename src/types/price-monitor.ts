export interface SearchQuery {
  name?: string;
  jan?: string;
  model?: string;
  brand?: string;
}

export interface CompetitorItem {
  mall: string;
  item_name: string;
  shop_name: string;
  price: number;
  shipping_fee: number | null;   // 0=送料無料, 正値=既知の送料, null=不明/条件付
  shipping_name: string | null;  // Yahoo/楽天の公式ラベル（"送料無料"/"条件付"/"送料別" 等）
  effective_price: number;
  url: string;
  seller_id?: string;            // Yahoo: "galleria-onlineshop" 等のセラーID（benchmark判定用）
  jan_code?: string;             // Yahoo APIから取れた JAN（自動収集用）
}

export interface SearchResult {
  items: CompetitorItem[];
  errors: MallError[];
}

export interface MallError {
  mall: string;
  message: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  brand: string | null;
  jan: string | null;
  model: string | null;
  category: string | null;
  my_price: number;
  cost_price: number;
  stock: number;
  is_monitored: boolean;
}

export type SuggestionLevel =
  | "urgent"
  | "recommend"
  | "monitor"
  | "good"
  | "no_data";

export interface SuggestionAction {
  type: "coupon" | "price_change" | "point" | "hold";
  label: string;
  detail: string;
  warning?: string;
}

export interface Suggestion {
  myProduct: Product;
  minViablePrice: number;
  competitorCount: number;
  lowestCompetitor: CompetitorItem | null;
  level: SuggestionLevel;
  title: string;
  summary: string;
  diffAmount: number | null;
  diffRatio: number | null;
  actions: SuggestionAction[];
}

export interface BenchmarkShop {
  id: string;
  name: string;
  yahoo_seller_id: string;
  base_url: string;
  priority: number;
}

export interface BenchmarkResult {
  shop: BenchmarkShop;
  found: boolean;
  item_name?: string;
  price?: number;
  shipping_fee?: number | null;
  shipping_name?: string | null;
  effective_price?: number;
  url?: string;
  jan_code?: string;
  diff_amount?: number;
  diff_ratio?: number;
}

export interface SearchHistoryEntry {
  id: string;
  query_name: string | null;
  query_jan: string | null;
  result_count: number;
  lowest_price: number | null;
  lowest_mall: string | null;
  lowest_shop: string | null;
  matched_product_id: string | null;
  suggestion_level: string | null;
  searched_at: string;
}
