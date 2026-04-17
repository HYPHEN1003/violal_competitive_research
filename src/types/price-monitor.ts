export interface SearchQuery {
  name?: string;
  jan?: string;
  model?: string;
}

export interface CompetitorItem {
  mall: string;
  item_name: string;
  shop_name: string;
  price: number;
  shipping_fee: number;
  effective_price: number;
  url: string;
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
