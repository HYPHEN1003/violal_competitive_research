import type { PriceProvider } from "./types";
import type { CompetitorItem, SearchQuery } from "@/types/price-monitor";

const USED_NAME_PATTERN = /(中古|USED|ユーズド|リユース|フリマ|ジャンク|訳あり|難あり|使用済|古着|汚れ|よごれ|ヨゴレ|キズあり|傷あり)/i;
// 靴アクセサリ・ケア用品・書籍・玩具など汎用ノイズのみ。violal 商品カテゴリ（Tシャツ/バッグ/ウェア等）
// と衝突する語は削除済み（旧シューズ案件の名残）。将来シューズ系SKUを再投入してアパレル系と混在させる
// 場合は、SearchQuery.category を追加してカテゴリ別 NOISE に分岐する（候補B）。
const NOISE_NAME_PATTERN = /(靴紐|シューレース|シューキーパー|シューツリー|シューケア|クリーナー|洗剤|防水スプレー|消臭|撥水|インソール|中敷き?|靴クリーム|ワックス|ポリッシュ|艶出し|ソックス|靴下|キーホルダー|ステッカー|ピンバッジ|マスク|ハンガー|シュータン|保護|スプレー|ゴルフマーカー|マーカー|フィギュア|模型|ミニチュア|おまけ|景品|DVD|Blu-?ray|BD|CD|書籍|雑誌|ブック|MOOK|ムック|BOOK|レコード|ヴァイナル|アナログ盤|ボール|ラケット|氷のう|アイスパック|保冷剤|色焼け|見切り品|返品不可|キッズ|ジュニア|子ども|子供|こども|ベビー|赤ちゃん|男児|女児|少年|少女)/i;
// 子ども・ベビーサイズを示すパターン（例: 12-16, 12-165, 17-22, 17.0〜21.0cm）
const KIDS_SIZE_PATTERN = /(\b(1[0-9]|2[0-2])\s?[-～〜~]\s?(1[0-9]{1,2}|2[0-2])\b|\b1[0-9]\.[0-9]\s?[～〜~]\s?2[0-2]\.[0-9]\b)/;
// violal 自身の Yahoo 出品（"VIOLAL BAG&LUGGAGE ヤフー店" 等）は自社なので競合から除外
const SELF_SELLER_PATTERN = /violal/i;

// name フォールバック時の誤マッチ（版違い等）対策。クエリ商品名の先頭5語を「必須トークン」として、
// それらを全て含む出品のみを残す。例: "Salomon AERO GLIDE 4 GRVL ..." のとき「AERO GLIDE 3 GRVL」は "4" が無いため除外。
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

function toCompetitorItems(
  hits: Array<Record<string, unknown>>,
  options: { excludeSelf?: boolean } = { excludeSelf: true }
): CompetitorItem[] {
  return hits
    .filter((it) => {
      const name = String(it.name ?? "");
      const sellerName = String((it.seller as Record<string, unknown>)?.name ?? "");
      if (options.excludeSelf && (SELF_SELLER_PATTERN.test(sellerName) || SELF_SELLER_PATTERN.test(name))) {
        return false;
      }
      return !USED_NAME_PATTERN.test(name)
        && !NOISE_NAME_PATTERN.test(name)
        && !KIDS_SIZE_PATTERN.test(name);
    })
    .map((it) => {
      const price = Number(it.price) || 0;
      const shippingRaw = it.shipping as Record<string, unknown> | undefined;
      const shippingName = shippingRaw?.name ? String(shippingRaw.name) : null;
      const freeShipping = shippingName === "送料無料";
      const shippingFee: number | null = freeShipping ? 0 : null;
      const effectivePrice = freeShipping ? price + 0 : price;
      const sellerRaw = it.seller as Record<string, unknown> | undefined;
      const sellerId = sellerRaw?.sellerId ? String(sellerRaw.sellerId) : undefined;
      const janCode = it.janCode ? String(it.janCode) : undefined;

      return {
        mall: "Yahoo",
        item_name: String(it.name ?? ""),
        shop_name: String(sellerRaw?.name ?? ""),
        price,
        shipping_fee: shippingFee,
        shipping_name: shippingName,
        effective_price: effectivePrice,
        url: String(it.url ?? ""),
        seller_id: sellerId,
        jan_code: janCode,
      };
    });
}

async function callYahoo(paramOverrides: Record<string, string>): Promise<Array<Record<string, unknown>>> {
  const clientId = process.env.YAHOO_CLIENT_ID;
  if (!clientId) throw new Error("YAHOO_CLIENT_ID が設定されていません");
  const params = new URLSearchParams({
    appid: clientId,
    results: "30",
    sort: "+price",
    output: "json",
    condition: "new",
    ...paramOverrides,
  });
  const res = await fetch(
    `https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch?${params}`
  );
  if (!res.ok) {
    throw new Error(`Yahoo API エラー: ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  return json.hits ?? [];
}

async function fetchFromSeller(query: SearchQuery, sellerId: string): Promise<CompetitorItem[]> {
  // セラー指定検索。JAN > brand+model > name の優先順位は fetchPrices と同じ。
  // セラー指定時は violal 自己除外は不要（benchmark対象のために呼ぶ関数なので、
  // そもそも sellerId が violal でないことが前提）→ excludeSelf: false で通す
  const base = { seller_id: sellerId };

  if (query.jan) {
    const hits = await callYahoo({ ...base, jan_code: query.jan });
    return toCompetitorItems(hits, { excludeSelf: false });
  }

  if (query.brand && query.model) {
    const hits = await callYahoo({ ...base, query: `${query.brand} ${query.model}` });
    const items = toCompetitorItems(hits, { excludeSelf: false });
    if (items.length > 0) return items;
    if (query.name) {
      const fbHits = await callYahoo({ ...base, query: query.name });
      const fbItems = toCompetitorItems(fbHits, { excludeSelf: false });
      return strictTokenMatchFilter(fbItems, query.name);
    }
    return [];
  }

  if (query.name) {
    const hits = await callYahoo({ ...base, query: query.name });
    return toCompetitorItems(hits, { excludeSelf: false });
  }

  return [];
}

export const yahooProvider: PriceProvider & {
  fetchFromSeller: (query: SearchQuery, sellerId: string) => Promise<CompetitorItem[]>;
} = {
  async fetchPrices(query: SearchQuery): Promise<CompetitorItem[]> {
    if (query.jan) {
      const hits = await callYahoo({ jan_code: query.jan });
      return toCompetitorItems(hits);
    }

    if (query.brand && query.model) {
      const hits = await callYahoo({ query: `${query.brand} ${query.model}` });
      const items = toCompetitorItems(hits);
      if (items.length > 0) return items;
      if (query.name) {
        const fbHits = await callYahoo({ query: query.name });
        const fbItems = toCompetitorItems(fbHits);
        return strictTokenMatchFilter(fbItems, query.name);
      }
      return [];
    }

    if (query.name) {
      const hits = await callYahoo({ query: query.name });
      return toCompetitorItems(hits);
    }

    return [];
  },
  fetchFromSeller,
};
