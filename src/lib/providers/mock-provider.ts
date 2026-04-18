import type { PriceProvider } from "./types";
import type { SearchQuery } from "@/types/price-monitor";

interface RawItem {
  mall: string;
  shop: string;
  item: string;
  price: number;
  shipping: number;
  url: string;
}

const DUMMY_CATALOG: { keywords: string[]; items: RawItem[] }[] = [
  {
    keywords: ["nike air force 1", "air force", "af1", "0883212345001"],
    items: [
      { mall: "楽天",  shop: "スニーカーハウス楽天店",   item: "Nike Air Force 1 '07 ホワイト CW2288-111", price: 14300, shipping: 0,   url: "https://example.com/rakuten/af1-1" },
      { mall: "楽天",  shop: "シューズストアABC",         item: "ナイキ エアフォース1 '07 ホワイト 新品",   price: 14800, shipping: 500, url: "https://example.com/rakuten/af1-2" },
      { mall: "楽天",  shop: "フットロッカー楽天",         item: "Nike AF1 Low ホワイト メンズ",             price: 15100, shipping: 0,   url: "https://example.com/rakuten/af1-3" },
      { mall: "Yahoo", shop: "スポーツDEPO Yahoo店",      item: "Nike Air Force 1 '07 White",               price: 14500, shipping: 600, url: "https://example.com/yahoo/af1-1" },
      { mall: "Yahoo", shop: "シューマート",               item: "ナイキ AF1 ロー ホワイト [送料無料]",      price: 15500, shipping: 0,   url: "https://example.com/yahoo/af1-2" },
    ],
  },
  {
    keywords: ["nike air max 90", "air max", "0883212345002"],
    items: [
      { mall: "楽天",  shop: "シューズプラザ",             item: "Nike Air Max 90 ブラック CN8490-002",      price: 16500, shipping: 300, url: "https://example.com/rakuten/am90-1" },
      { mall: "楽天",  shop: "アスリートゲート",           item: "ナイキ エアマックス 90 ブラック",           price: 16800, shipping: 0,   url: "https://example.com/rakuten/am90-2" },
      { mall: "楽天",  shop: "ABC-MART楽天市場店",          item: "Air Max 90 Recraft Black",                  price: 17200, shipping: 500, url: "https://example.com/rakuten/am90-3" },
      { mall: "Yahoo", shop: "スニーカーベース",           item: "Nike Air Max 90 ブラック メンズ",           price: 16900, shipping: 0,   url: "https://example.com/yahoo/am90-1" },
      { mall: "Yahoo", shop: "アーバンスポーツ",           item: "ナイキ AM90 ブラック 正規品",               price: 17500, shipping: 600, url: "https://example.com/yahoo/am90-2" },
    ],
  },
  {
    keywords: ["stan smith", "スタンスミス", "4065427000001"],
    items: [
      { mall: "楽天",  shop: "アディダス楽天ストア",       item: "adidas Stan Smith Primegreen ホワイト",     price: 13000, shipping: 0,   url: "https://example.com/rakuten/ss-1" },
      { mall: "楽天",  shop: "スニーカーディレクト",       item: "スタンスミス ホワイト/グリーン",            price: 12700, shipping: 500, url: "https://example.com/rakuten/ss-2" },
      { mall: "楽天",  shop: "シューズセレクト",           item: "adidas Originals Stan Smith",               price: 13400, shipping: 0,   url: "https://example.com/rakuten/ss-3" },
      { mall: "Yahoo", shop: "フットギア Yahoo店",         item: "Stan Smith Core White",                     price: 13100, shipping: 300, url: "https://example.com/yahoo/ss-1" },
      { mall: "Yahoo", shop: "ストリートスタイル",         item: "アディダス スタンスミス 定番",              price: 13800, shipping: 0,   url: "https://example.com/yahoo/ss-2" },
    ],
  },
  {
    keywords: ["samba", "サンバ", "4065427000002"],
    items: [
      { mall: "楽天",  shop: "スニーカー倉庫",             item: "adidas Samba OG ブラック/ホワイト",         price: 15800, shipping: 500, url: "https://example.com/rakuten/samba-1" },
      { mall: "楽天",  shop: "トレンドスニーカー",         item: "サンバ OG コアブラック",                    price: 16500, shipping: 0,   url: "https://example.com/rakuten/samba-2" },
      { mall: "楽天",  shop: "スポーツワン",               item: "adidas Samba OG Black 国内正規",            price: 17200, shipping: 0,   url: "https://example.com/rakuten/samba-3" },
      { mall: "Yahoo", shop: "スニーカーロフト",           item: "サンバ OG ブラック メンズ",                 price: 16000, shipping: 500, url: "https://example.com/yahoo/samba-1" },
      { mall: "Yahoo", shop: "シューズBOX",                 item: "adidas Samba OG 人気モデル",                price: 17000, shipping: 600, url: "https://example.com/yahoo/samba-2" },
    ],
  },
  {
    keywords: ["new balance 574", "nb574", "0739980012345"],
    items: [
      { mall: "楽天",  shop: "ニューバランス楽天",         item: "New Balance ML574 グレー",                  price: 11500, shipping: 0,   url: "https://example.com/rakuten/nb574-1" },
      { mall: "楽天",  shop: "スニーカーパーク",           item: "ニューバランス 574 Classic グレー",         price: 11800, shipping: 300, url: "https://example.com/rakuten/nb574-2" },
      { mall: "楽天",  shop: "ABC シューズ",                item: "NB 574 Core Grey EVG",                      price: 12300, shipping: 0,   url: "https://example.com/rakuten/nb574-3" },
      { mall: "Yahoo", shop: "フットプラネット",           item: "New Balance 574 Grey メンズ",               price: 11700, shipping: 0,   url: "https://example.com/yahoo/nb574-1" },
      { mall: "Yahoo", shop: "スポーツマート",             item: "ニューバランス ML574 定番グレー",           price: 12500, shipping: 500, url: "https://example.com/yahoo/nb574-2" },
    ],
  },
  {
    keywords: ["new balance 996", "nb996", "0739980012346"],
    items: [
      { mall: "楽天",  shop: "プレミアムシューズ",         item: "New Balance 996 ネイビー MRL996",           price: 19500, shipping: 0,   url: "https://example.com/rakuten/nb996-1" },
      { mall: "楽天",  shop: "シューズセレクション",       item: "ニューバランス 996 ネイビー",               price: 19800, shipping: 500, url: "https://example.com/rakuten/nb996-2" },
      { mall: "楽天",  shop: "スニーカーラボ",             item: "NB MRL996 Navy メンズ/レディース",          price: 20200, shipping: 0,   url: "https://example.com/rakuten/nb996-3" },
      { mall: "Yahoo", shop: "フットウェアジャパン",       item: "New Balance 996 Navy Classic",              price: 19300, shipping: 600, url: "https://example.com/yahoo/nb996-1" },
      { mall: "Yahoo", shop: "スニーカーエージェント",     item: "ニューバランス 996 NV 人気モデル",          price: 20500, shipping: 0,   url: "https://example.com/yahoo/nb996-2" },
    ],
  },
  {
    keywords: ["all star", "converse", "オールスター", "コンバース", "4549643000001"],
    items: [
      { mall: "楽天",  shop: "コンバース楽天店",           item: "Converse All Star HI ホワイト",             price: 7500, shipping: 0,   url: "https://example.com/rakuten/allstar-1" },
      { mall: "楽天",  shop: "スニーカーマニア",           item: "コンバース オールスター ハイ ホワイト",     price: 7200, shipping: 300, url: "https://example.com/rakuten/allstar-2" },
      { mall: "楽天",  shop: "シューズファクトリー",       item: "Converse CT70 Hi White",                    price: 7800, shipping: 0,   url: "https://example.com/rakuten/allstar-3" },
      { mall: "Yahoo", shop: "カジュアルシューズ館",       item: "オールスター ハイカット ホワイト",          price: 7400, shipping: 300, url: "https://example.com/yahoo/allstar-1" },
      { mall: "Yahoo", shop: "靴のヒラキYahoo店",          item: "Converse All Star レギュラー HI",           price: 7900, shipping: 0,   url: "https://example.com/yahoo/allstar-2" },
    ],
  },
  {
    keywords: ["vans old skool", "old skool", "オールドスクール", "vans", "0191163000001"],
    items: [
      { mall: "楽天",  shop: "ヴァンズ公式楽天",           item: "Vans Old Skool ブラック/ホワイト",          price: 9700, shipping: 0,   url: "https://example.com/rakuten/vans-1" },
      { mall: "楽天",  shop: "スケーターショップ",         item: "バンズ オールドスクール 定番",              price: 9400, shipping: 500, url: "https://example.com/rakuten/vans-2" },
      { mall: "楽天",  shop: "スニーカーブティック",       item: "VANS Old Skool Classic Black/White",        price: 10100, shipping: 0,   url: "https://example.com/rakuten/vans-3" },
      { mall: "Yahoo", shop: "ストリートシューズ",         item: "Vans Old Skool BLK/WHT メンズ",             price: 9500, shipping: 300, url: "https://example.com/yahoo/vans-1" },
      { mall: "Yahoo", shop: "アーバンフット",             item: "バンズ オールドスクール 人気",              price: 10200, shipping: 0,   url: "https://example.com/yahoo/vans-2" },
    ],
  },
  {
    keywords: ["gel-kayano", "kayano", "ゲルカヤノ", "カヤノ", "asics", "4550456000001"],
    items: [
      { mall: "楽天",  shop: "アシックス楽天店",           item: "asics GEL-KAYANO 30 メンズ",                price: 21000, shipping: 0,   url: "https://example.com/rakuten/kayano-1" },
      { mall: "楽天",  shop: "ランニング専門店RunRun",     item: "ゲルカヤノ30 ランニング メンズ",            price: 21500, shipping: 500, url: "https://example.com/rakuten/kayano-2" },
      { mall: "楽天",  shop: "スポーツオーソリティ楽天",   item: "ASICS GEL-KAYANO 30 Running",               price: 22800, shipping: 0,   url: "https://example.com/rakuten/kayano-3" },
      { mall: "Yahoo", shop: "ランナーズショップ",         item: "アシックス ゲルカヤノ30 正規品",            price: 21300, shipping: 300, url: "https://example.com/yahoo/kayano-1" },
      { mall: "Yahoo", shop: "フィットネスストア",         item: "GEL-KAYANO 30 Men's ランシュー",            price: 22500, shipping: 0,   url: "https://example.com/yahoo/kayano-2" },
    ],
  },
  {
    keywords: ["puma suede", "suede classic", "プーマ スウェード", "スウェード", "4064536000001"],
    items: [
      { mall: "楽天",  shop: "プーマ公式楽天",             item: "PUMA Suede Classic XXI ブラック",           price: 10000, shipping: 0,   url: "https://example.com/rakuten/puma-1" },
      { mall: "楽天",  shop: "スニーカーカンパニー",       item: "プーマ スウェード クラシック",              price: 10300, shipping: 300, url: "https://example.com/rakuten/puma-2" },
      { mall: "楽天",  shop: "シューズアウトレット",       item: "PUMA Suede Classic+",                       price: 10500, shipping: 0,   url: "https://example.com/rakuten/puma-3" },
      { mall: "Yahoo", shop: "カジュアルフット",           item: "プーマ Suede Classic メンズ",               price: 10200, shipping: 300, url: "https://example.com/yahoo/puma-1" },
      { mall: "Yahoo", shop: "ストリートブランド",         item: "PUMA スウェード 定番モデル",                price: 10700, shipping: 0,   url: "https://example.com/yahoo/puma-2" },
    ],
  },
];

function generateFallback(
  query: SearchQuery,
  targetMall: string
): RawItem[] {
  const label = query.name || query.jan || "商品";
  const seed = (query.name || query.jan || "x").length;
  const base = 5000 + ((seed * 137) % 8000);
  const samples =
    targetMall === "楽天"
      ? [
          { shop: "楽天 ショップA", delta: 0, ship: 0 },
          { shop: "楽天 ショップB", delta: -300, ship: 500 },
          { shop: "楽天 ショップC", delta: 200, ship: 0 },
        ]
      : [
          { shop: "Yahoo ストアX", delta: -150, ship: 600 },
          { shop: "Yahoo ストアY", delta: 100, ship: 0 },
        ];
  return samples.map((s, i) => ({
    mall: targetMall,
    item: `${label}（参考${i + 1}）`,
    shop: s.shop,
    price: base + s.delta,
    shipping: s.ship,
    url: `https://example.com/${targetMall}/${encodeURIComponent(label)}-${i}`,
  }));
}

export const mockProvider: PriceProvider = {
  async fetchPrices(query, { mall }) {
    await new Promise((r) => setTimeout(r, 300 + Math.random() * 500));

    const needle = [query.name, query.jan]
      .filter(Boolean)
      .map((s) => s!.trim().toLowerCase())
      .join(" ");

    if (!needle) return [];

    const targetMall = mall === "rakuten" ? "楽天" : "Yahoo";

    const matched = DUMMY_CATALOG.filter((entry) =>
      entry.keywords.some((k) => needle.includes(k.toLowerCase()))
    )
      .flatMap((entry) => entry.items)
      .filter((it) => it.mall === targetMall);

    const items = matched.length > 0 ? matched : generateFallback(query, targetMall);

    return items.map((it) => ({
      mall: it.mall,
      item_name: it.item,
      shop_name: it.shop,
      price: it.price,
      shipping_fee: it.shipping,
      effective_price: it.price + it.shipping,
      url: it.url,
    }));
  },
};
