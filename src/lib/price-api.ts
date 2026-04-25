import type { PriceProvider } from "./providers/types";
import type { SearchQuery, SearchResult, CompetitorItem } from "@/types/price-monitor";
import { mockProvider } from "./providers/mock-provider";
import { rakutenProvider } from "./providers/rakuten-provider";
import { yahooProvider } from "./providers/yahoo-provider";

function loadProviders(): Record<string, PriceProvider> {
  // 楽天新API は applicationId と accessKey の両方が必須。どちらか欠ける場合は mock にフォールバック。
  const rakutenReady = Boolean(process.env.RAKUTEN_APP_ID && process.env.RAKUTEN_ACCESS_KEY);
  return {
    rakuten: rakutenReady ? rakutenProvider : mockProvider,
    yahoo: process.env.YAHOO_CLIENT_ID ? yahooProvider : mockProvider,
  };
}

export async function searchAllMalls(query: SearchQuery): Promise<SearchResult> {
  const providers = loadProviders();
  const malls = Object.keys(providers);

  const settled = await Promise.allSettled(
    malls.map((mall) => providers[mall].fetchPrices(query, { mall }))
  );

  const items: CompetitorItem[] = [];
  const errors: SearchResult["errors"] = [];

  settled.forEach((res, i) => {
    if (res.status === "fulfilled") {
      items.push(...res.value);
    } else {
      errors.push({
        mall: malls[i],
        message: res.reason?.message ?? String(res.reason),
      });
    }
  });

  items.sort((a, b) => a.effective_price - b.effective_price);
  return { items, errors };
}

export function findLowest(items: CompetitorItem[]) {
  if (items.length === 0) return null;
  const top = items[0];
  return {
    price: top.effective_price,
    mall: top.mall,
    shop: top.shop_name,
    item: top.item_name,
    url: top.url,
  };
}
