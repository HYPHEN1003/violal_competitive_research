import type { CompetitorItem, SearchQuery } from "@/types/price-monitor";

export interface PriceProvider {
  fetchPrices(
    query: SearchQuery,
    options: { mall: string }
  ): Promise<CompetitorItem[]>;
}
