import type { PriceProvider } from "./types";
import type { CompetitorItem, SearchQuery } from "@/types/price-monitor";

export const yahooProvider: PriceProvider = {
  async fetchPrices(query: SearchQuery): Promise<CompetitorItem[]> {
    const clientId = process.env.YAHOO_CLIENT_ID;
    if (!clientId) throw new Error("YAHOO_CLIENT_ID が設定されていません");

    const params = new URLSearchParams({
      appid: clientId,
      results: "30",
      sort: "+price",
      output: "json",
    });

    if (query.jan) {
      params.set("jan_code", query.jan);
    } else if (query.name) {
      params.set("query", query.name);
    } else {
      return [];
    }

    const res = await fetch(
      `https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch?${params}`
    );

    if (!res.ok) {
      throw new Error(`Yahoo API エラー: ${res.status} ${res.statusText}`);
    }

    const json = await res.json();
    const hits: Array<Record<string, unknown>> = json.hits ?? [];

    return hits.map((it) => {
      const price = Number(it.price) || 0;
      const shippingRaw = it.shipping as Record<string, unknown> | undefined;
      const freeShipping = shippingRaw?.code === "1";
      const shippingFee = freeShipping ? 0 : 600;

      return {
        mall: "Yahoo",
        item_name: String(it.name ?? ""),
        shop_name: String((it.seller as Record<string, unknown>)?.name ?? ""),
        price,
        shipping_fee: shippingFee,
        effective_price: price + shippingFee,
        url: String(it.url ?? ""),
      };
    });
  },
};
