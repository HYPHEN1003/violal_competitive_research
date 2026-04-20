import type { PriceProvider } from "./types";
import type { CompetitorItem, SearchQuery } from "@/types/price-monitor";

// violal 自身の楽天出品は自社なので除外
const SELF_SHOP_PATTERN = /violal/i;

// name フォールバック時の誤マッチ（版違い等）対策。先頭5語を必須トークンとして全含み検査。
function strictTokenMatchFilter<T extends { item_name: string }>(items: T[], queryName: string): T[] {
  const tokens = queryName
    .trim()
    .split(/\s+/)
    .slice(0, 5)
    .map((t) => t.toLowerCase())
    .filter((t) => t.length > 0);
  if (tokens.length === 0) return items;
  return items.filter((item) => {
    const lower = item.item_name.toLowerCase();
    return tokens.every((tok) => lower.includes(tok));
  });
}

function toCompetitorItems(rawItems: Array<Record<string, unknown>>): CompetitorItem[] {
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
}

export const rakutenProvider: PriceProvider = {
  async fetchPrices(query: SearchQuery): Promise<CompetitorItem[]> {
    const appId = process.env.RAKUTEN_APP_ID;
    if (!appId) throw new Error("RAKUTEN_APP_ID が設定されていません");

    async function runSearch(keyword: string): Promise<CompetitorItem[]> {
      const params = new URLSearchParams({
        applicationId: appId!,
        format: "json",
        hits: "30",
        sort: "+itemPrice",
        keyword,
      });
      const res = await fetch(
        `https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601?${params}`
      );
      if (!res.ok) {
        throw new Error(`楽天API エラー: ${res.status} ${res.statusText}`);
      }
      const json = await res.json();
      const rawItems: Array<Record<string, unknown>> = json.Items ?? [];
      return toCompetitorItems(rawItems);
    }

    // 優先順位: JAN > ブランド+型番 > 商品名
    // 型番検索で他店0件の場合は商品名にフォールバック（ブランド独自の型番体系で他店タイトルに載らない場合の救済）
    if (query.jan) {
      return runSearch(query.jan);
    }

    if (query.brand && query.model) {
      const byModel = await runSearch(`${query.brand} ${query.model}`);
      if (byModel.length > 0) return byModel;
      if (query.name) {
        const byName = await runSearch(query.name);
        return strictTokenMatchFilter(byName, query.name);
      }
      return [];
    }

    if (query.name) {
      return runSearch(query.name);
    }

    return [];
  },
};
