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

    // JAN > ブランド+品番 > 商品名 の優先順位。
    if (query.jan) {
      params.set("keyword", query.jan);
    } else if (query.brand && query.model) {
      params.set("keyword", `${query.brand} ${query.model}`);
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

    // violal 自身の楽天出品は自社なので除外
    const SELF_SHOP_PATTERN = /violal/i;

    return rawItems
      .filter((wrapper) => {
        const it = (wrapper as { Item: Record<string, unknown> }).Item;
        const shop = String(it.shopName ?? "");
        const name = String(it.itemName ?? "");
        return !SELF_SHOP_PATTERN.test(shop) && !SELF_SHOP_PATTERN.test(name);
      })
      .map((wrapper) => {
        const it = (wrapper as { Item: Record<string, unknown> }).Item;
        const price = Number(it.itemPrice) || 0;
        // postageFlag === 1 は「価格に送料込み」= 送料無料扱い
        const freeShipping = it.postageFlag === 1;
        const shippingFee: number | null = freeShipping ? 0 : null;
        const shippingName = freeShipping ? "送料無料" : "送料別";
        const effectivePrice = freeShipping ? price + 0 : price;

        return {
          mall: "楽天",
          item_name: String(it.itemName ?? ""),
          shop_name: String(it.shopName ?? ""),
          price,
          shipping_fee: shippingFee,
          shipping_name: shippingName,
          effective_price: effectivePrice,
          url: String(it.itemUrl ?? ""),
        };
      });
  },
};
