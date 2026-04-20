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
      condition: "new",
    });

    // JAN > ブランド+品番 > 商品名 の優先順位。
    // 正規取扱店・大手EC店は型番をタイトルに含めることが多く、型番検索の方がノイズが少ない。
    // 商品名はフォールバック。
    if (query.jan) {
      params.set("jan_code", query.jan);
    } else if (query.brand && query.model) {
      params.set("query", `${query.brand} ${query.model}`);
    } else if (query.name) {
      params.set("query", query.name);
    } else {
      return [];
    }

    const USED_NAME_PATTERN = /(中古|USED|ユーズド|リユース|フリマ|ジャンク|訳あり|難あり|使用済|古着|汚れ|よごれ|ヨゴレ|キズあり|傷あり)/i;
    // 関連アクセサリ・ケア用品・衣類など「靴本体でない」ノイズを除外
    // 靴アクセサリ・ケア用品・書籍・玩具など汎用ノイズのみ。violal 商品カテゴリ（Tシャツ/バッグ/ウェア等）
    // と衝突する語は削除済み（旧シューズ案件の名残）。将来シューズ系SKUを再投入してアパレル系と混在させる
    // 場合は、SearchQuery.category を追加してカテゴリ別 NOISE に分岐する（候補B）。
    const NOISE_NAME_PATTERN = /(靴紐|シューレース|シューキーパー|シューツリー|シューケア|クリーナー|洗剤|防水スプレー|消臭|撥水|インソール|中敷き?|靴クリーム|ワックス|ポリッシュ|艶出し|ソックス|靴下|キーホルダー|ステッカー|ピンバッジ|マスク|ハンガー|シュータン|保護|スプレー|ゴルフマーカー|マーカー|フィギュア|模型|ミニチュア|おまけ|景品|DVD|Blu-?ray|BD|CD|書籍|雑誌|ブック|MOOK|ムック|BOOK|レコード|ヴァイナル|アナログ盤|ボール|ラケット|氷のう|アイスパック|保冷剤|色焼け|見切り品|返品不可|キッズ|ジュニア|子ども|子供|こども|ベビー|赤ちゃん|男児|女児|少年|少女)/i;
    // 子ども・ベビーサイズを示すパターン（例: 12-16, 12-165, 17-22, 17.0〜21.0cm）
    const KIDS_SIZE_PATTERN = /(\b(1[0-9]|2[0-2])\s?[-～〜~]\s?(1[0-9]{1,2}|2[0-2])\b|\b1[0-9]\.[0-9]\s?[～〜~]\s?2[0-2]\.[0-9]\b)/;

    const res = await fetch(
      `https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch?${params}`
    );

    if (!res.ok) {
      throw new Error(`Yahoo API エラー: ${res.status} ${res.statusText}`);
    }

    const json = await res.json();
    const hits: Array<Record<string, unknown>> = json.hits ?? [];

    // violal 自身の Yahoo 出品（"VIOLAL BAG&LUGGAGE ヤフー店" 等）は自社なので競合から除外
    const SELF_SELLER_PATTERN = /violal/i;

    return hits
      .filter((it) => {
        const name = String(it.name ?? "");
        const sellerName = String((it.seller as Record<string, unknown>)?.name ?? "");
        if (SELF_SELLER_PATTERN.test(sellerName) || SELF_SELLER_PATTERN.test(name)) return false;
        return !USED_NAME_PATTERN.test(name)
          && !NOISE_NAME_PATTERN.test(name)
          && !KIDS_SIZE_PATTERN.test(name);
      })
      .map((it) => {
      const price = Number(it.price) || 0;
      const shippingRaw = it.shipping as Record<string, unknown> | undefined;
      const shippingName = shippingRaw?.name ? String(shippingRaw.name) : null;
      // shipping.name === "送料無料" のみ信頼して 0 円扱い。それ以外は null（送料分は effective_price に含めない）
      const freeShipping = shippingName === "送料無料";
      const shippingFee: number | null = freeShipping ? 0 : null;
      const effectivePrice = freeShipping ? price + 0 : price;

      return {
        mall: "Yahoo",
        item_name: String(it.name ?? ""),
        shop_name: String((it.seller as Record<string, unknown>)?.name ?? ""),
        price,
        shipping_fee: shippingFee,
        shipping_name: shippingName,
        effective_price: effectivePrice,
        url: String(it.url ?? ""),
      };
    });
  },
};
