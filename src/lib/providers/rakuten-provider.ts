import type { PriceProvider } from "./types";
import type { CompetitorItem, SearchQuery } from "@/types/price-monitor";

export const rakutenProvider: PriceProvider = {
  async fetchPrices(query: SearchQuery): Promise<CompetitorItem[]> {
    const appId = process.env.RAKUTEN_APP_ID;
    if (!appId) throw new Error("RAKUTEN_APP_ID が設定されていません");

    const params = new URLSearchParams({
      applicationId: appId,
      format: "json",
      hits: "30",
      sort: "+itemPrice",
    });

    if (query.jan) {
      params.set("keyword", query.jan);
    } else if (query.name) {
      params.set("keyword", query.name);
    } else {
      return [];
    }

    const res = await fetch(
      `https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601?${params}`
    );

    if (!res.ok) {
      throw new Error(`楽天API エラー: ${res.status} ${res.statusText}`);
    }

    const json = await res.json();
    const rawItems: Array<Record<string, unknown>> = json.Items ?? [];

    return rawItems.map((wrapper) => {
      const it = (wrapper as { Item: Record<string, unknown> }).Item;
      const price = Number(it.itemPrice) || 0;
      const freeShipping = it.postageFlag === 1;
      const shippingFee = freeShipping ? 0 : 500;

      return {
        mall: "楽天",
        item_name: String(it.itemName ?? ""),
        shop_name: String(it.shopName ?? ""),
        price,
        shipping_fee: shippingFee,
        effective_price: price + shippingFee,
        url: String(it.itemUrl ?? ""),
      };
    });
  },
};
