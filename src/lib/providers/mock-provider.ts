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

// violal 社の10商品に対応。各SKUの楽天側最安は last_suggestion_level と整合するよう設定。
const DUMMY_CATALOG: { keywords: string[]; items: RawItem[] }[] = [
  // SKU-001 innovator INV43EX スーツケース 38+5L (my 24,800, urgent → anchor 22,000)
  {
    keywords: ["inv43ex", "innovator inv43", "inv43"],
    items: [
      { mall: "楽天",  shop: "innovatorStore楽天店",       item: "innovator エキスパンダブル 38+5L INV43EX ブラック", price: 22000, shipping: 0,   url: "https://example.com/rakuten/inv43-1" },
      { mall: "楽天",  shop: "キャリーケース専門店",       item: "innovator INV43EX スーツケース 機内持込",            price: 22500, shipping: 0,   url: "https://example.com/rakuten/inv43-2" },
      { mall: "楽天",  shop: "トラベルショップA",           item: "イノベーター INV43EX グレー 38L",                    price: 23200, shipping: 500, url: "https://example.com/rakuten/inv43-3" },
      { mall: "Yahoo", shop: "スーツケース館 Yahoo店",     item: "innovator INV43EX エキスパンダブル 38+5L",          price: 22300, shipping: 0,   url: "https://example.com/yahoo/inv43-1" },
      { mall: "Yahoo", shop: "旅行用品ストア",             item: "イノベーター INV43 38L 拡張可能",                    price: 23500, shipping: 0,   url: "https://example.com/yahoo/inv43-2" },
    ],
  },
  // SKU-002 innovator IW66 CARRY WAGON 75L (my 18,800, recommend → anchor 17,700)
  {
    keywords: ["iw66", "innovator iw66", "carry wagon", "innovator 75l"],
    items: [
      { mall: "楽天",  shop: "innovatorStore楽天店",       item: "innovator IW66 CARRY WAGON 75L ブラック",           price: 17700, shipping: 0,   url: "https://example.com/rakuten/iw66-1" },
      { mall: "楽天",  shop: "キャリーケース専門店",       item: "イノベーター IW66 Mサイズ 75L",                      price: 18000, shipping: 0,   url: "https://example.com/rakuten/iw66-2" },
      { mall: "楽天",  shop: "トラベルショップB",           item: "innovator CARRY WAGON 75L ネイビー",                price: 18500, shipping: 0,   url: "https://example.com/rakuten/iw66-3" },
      { mall: "Yahoo", shop: "旅行用品ストア",             item: "イノベーター IW66 CARRY WAGON",                      price: 17900, shipping: 0,   url: "https://example.com/yahoo/iw66-1" },
      { mall: "Yahoo", shop: "スーツケース館 Yahoo店",     item: "innovator 75L スーツケース IW66",                    price: 18700, shipping: 0,   url: "https://example.com/yahoo/iw66-2" },
    ],
  },
  // SKU-003 Salomon L49174 AERO GLIDE 4 GRVL (my 19,800, recommend → anchor 18,700)
  {
    keywords: ["l49174", "salomon l49174", "aero glide 4", "aero glide"],
    items: [
      { mall: "楽天",  shop: "サロモン楽天店",             item: "Salomon AERO GLIDE 4 GRVL L49174 メンズ",           price: 18700, shipping: 0,   url: "https://example.com/rakuten/l49174-1" },
      { mall: "楽天",  shop: "ランニング専門Run",          item: "サロモン エアロ グライド 4 GRVL",                   price: 19000, shipping: 0,   url: "https://example.com/rakuten/l49174-2" },
      { mall: "楽天",  shop: "スポーツオーソリティ楽天",   item: "Salomon L49174 GRVL ランニングシューズ",            price: 19500, shipping: 0,   url: "https://example.com/rakuten/l49174-3" },
      { mall: "Yahoo", shop: "アウトドア専門店",           item: "サロモン AERO GLIDE 4 国内正規",                     price: 18900, shipping: 0,   url: "https://example.com/yahoo/l49174-1" },
      { mall: "Yahoo", shop: "フィットネスストア",         item: "Salomon Aero Glide 4 GRVL 27.0cm",                   price: 19700, shipping: 0,   url: "https://example.com/yahoo/l49174-2" },
    ],
  },
  // SKU-004 Salomon L47987 XA PRO 3D V9 GTX (my 24,500, urgent → anchor 21,700)
  {
    keywords: ["l47987", "salomon l47987", "xa pro 3d v9", "xa pro 3d"],
    items: [
      { mall: "楽天",  shop: "サロモン楽天店",             item: "Salomon XA PRO 3D V9 GTX L47987 メンズ",            price: 21700, shipping: 0,   url: "https://example.com/rakuten/l47987-1" },
      { mall: "楽天",  shop: "トレイルランショップ",       item: "サロモン XA PRO 3D V9 GTX Gore-Tex",                 price: 22000, shipping: 0,   url: "https://example.com/rakuten/l47987-2" },
      { mall: "楽天",  shop: "アウトドアファクトリー",     item: "Salomon L47987 XA PRO 3D V9 国内正規",               price: 22500, shipping: 0,   url: "https://example.com/rakuten/l47987-3" },
      { mall: "Yahoo", shop: "ランナーズショップ",         item: "サロモン XA PRO 3D V9 GTX トレイルラン",             price: 21900, shipping: 0,   url: "https://example.com/yahoo/l47987-1" },
      { mall: "Yahoo", shop: "アウトドア専門店",           item: "Salomon L47987 Gore-Tex 27.5cm",                     price: 22800, shipping: 0,   url: "https://example.com/yahoo/l47987-2" },
    ],
  },
  // SKU-005 / SKU-006 Columbia WR7658 Spire Valley (共有モデル — anchor 9,950 で両方をカバー)
  //   SKU-005 my 10,200 monitor, SKU-006 my 9,700 good
  {
    keywords: ["wr7658", "columbia wr7658", "spire valley", "スパイアーバレー"],
    items: [
      { mall: "楽天",  shop: "コロンビア楽天",             item: "Columbia Spire Valley WR7658 ブラック L",           price: 9950,  shipping: 0,   url: "https://example.com/rakuten/wr7658-1" },
      { mall: "楽天",  shop: "アウトドアストア",           item: "コロンビア スパイアーバレー ウィンドブレーカー",     price: 10100, shipping: 0,   url: "https://example.com/rakuten/wr7658-2" },
      { mall: "楽天",  shop: "スポーツデポ楽天",           item: "Columbia WR7658 ジャケット メンズ",                  price: 10400, shipping: 0,   url: "https://example.com/rakuten/wr7658-3" },
      { mall: "Yahoo", shop: "アウトドアYahoo",             item: "Columbia スパイアーバレー ネイビー",                 price: 10050, shipping: 0,   url: "https://example.com/yahoo/wr7658-1" },
      { mall: "Yahoo", shop: "カジュアルアウトドア",       item: "Columbia WR7658 Spire Valley XL",                    price: 10500, shipping: 0,   url: "https://example.com/yahoo/wr7658-2" },
    ],
  },
  // SKU-007 AVIREX AVX3514 4WAY ボンサック (my 9,000, good → anchor 9,200)
  {
    keywords: ["avx3514", "avirex avx3514", "avirex ボンサック", "avirex 4way"],
    items: [
      { mall: "楽天",  shop: "AVIREX楽天ストア",           item: "AVIREX AVX3514 4WAY ボンサック ブラック",           price: 9200,  shipping: 0,   url: "https://example.com/rakuten/avx3514-1" },
      { mall: "楽天",  shop: "ミリタリーショップ",         item: "アヴィレックス 4WAY ボンサック バックパック",        price: 9500,  shipping: 0,   url: "https://example.com/rakuten/avx3514-2" },
      { mall: "楽天",  shop: "バッグセレクト",             item: "AVIREX AVX3514 ショルダー/ボストン",                price: 9800,  shipping: 0,   url: "https://example.com/rakuten/avx3514-3" },
      { mall: "Yahoo", shop: "ミリタリースタイル",         item: "AVIREX AVX3514 ボンサック カーキ",                   price: 9400,  shipping: 0,   url: "https://example.com/yahoo/avx3514-1" },
      { mall: "Yahoo", shop: "バッグ専門Yahoo",             item: "アヴィレックス 4WAY バッグ",                         price: 9900,  shipping: 0,   url: "https://example.com/yahoo/avx3514-2" },
    ],
  },
  // SKU-008 CHUMS CH60-4039 トートバッグ ブービーステッチ (my 8,900, urgent → anchor 7,800)
  {
    keywords: ["ch60-4039", "chums ch60", "chums トート", "ブービーステッチ", "booby stitch"],
    items: [
      { mall: "楽天",  shop: "CHUMS楽天公式",              item: "CHUMS トートバッグ ブービーステッチ CH60-4039",     price: 7800,  shipping: 0,   url: "https://example.com/rakuten/ch60-1" },
      { mall: "楽天",  shop: "アウトドアバッグ館",         item: "チャムス ブービー トートバッグ",                     price: 8000,  shipping: 0,   url: "https://example.com/rakuten/ch60-2" },
      { mall: "楽天",  shop: "カジュアルCHUMS",             item: "CHUMS CH60-4039 ベージュ",                           price: 8200,  shipping: 0,   url: "https://example.com/rakuten/ch60-3" },
      { mall: "Yahoo", shop: "アウトドア Yahoo",            item: "CHUMS ブービーステッチ トート",                      price: 7950,  shipping: 0,   url: "https://example.com/yahoo/ch60-1" },
      { mall: "Yahoo", shop: "バッグストア",               item: "チャムス トートバッグ CH60-4039",                    price: 8300,  shipping: 0,   url: "https://example.com/yahoo/ch60-2" },
    ],
  },
  // SKU-009 Columbia PG3033 Urban Hike Graphic Tシャツ (my 4,680, recommend → anchor 4,400)
  {
    keywords: ["pg3033", "columbia pg3033", "urban hike"],
    items: [
      { mall: "楽天",  shop: "コロンビア楽天",             item: "Columbia Urban Hike Graphic Tシャツ PG3033",        price: 4400,  shipping: 0,   url: "https://example.com/rakuten/pg3033-1" },
      { mall: "楽天",  shop: "アウトドアストア",           item: "コロンビア アーバンハイク グラフィック Tシャツ",     price: 4500,  shipping: 0,   url: "https://example.com/rakuten/pg3033-2" },
      { mall: "楽天",  shop: "カジュアルシャツ館",         item: "Columbia PG3033 Tee メンズ",                         price: 4650,  shipping: 0,   url: "https://example.com/rakuten/pg3033-3" },
      { mall: "Yahoo", shop: "カジュアル Yahoo",            item: "Columbia Urban Hike Tシャツ ホワイト",              price: 4550,  shipping: 0,   url: "https://example.com/yahoo/pg3033-1" },
      { mall: "Yahoo", shop: "アパレルストア",             item: "コロンビア PG3033 半袖 Tシャツ",                     price: 4750,  shipping: 0,   url: "https://example.com/yahoo/pg3033-2" },
    ],
  },
  // SKU-010 Columbia YU8523 SKYRIDE STREET WATERPROOF (my 13,100, recommend → anchor 12,400)
  {
    keywords: ["yu8523", "columbia yu8523", "skyride street", "skyride"],
    items: [
      { mall: "楽天",  shop: "コロンビア楽天",             item: "Columbia SKYRIDE STREET WATERPROOF YU8523",         price: 12400, shipping: 0,   url: "https://example.com/rakuten/yu8523-1" },
      { mall: "楽天",  shop: "防水シューズ館",             item: "コロンビア スカイライド ストリート 防水",            price: 12600, shipping: 0,   url: "https://example.com/rakuten/yu8523-2" },
      { mall: "楽天",  shop: "シューズデポ楽天",           item: "Columbia YU8523 ストリート スニーカー",              price: 12900, shipping: 0,   url: "https://example.com/rakuten/yu8523-3" },
      { mall: "Yahoo", shop: "アウトドア Yahoo",            item: "Columbia SKYRIDE STREET 防水 27cm",                  price: 12500, shipping: 0,   url: "https://example.com/yahoo/yu8523-1" },
      { mall: "Yahoo", shop: "フットウェア Yahoo",          item: "コロンビア YU8523 防水スニーカー",                   price: 13000, shipping: 0,   url: "https://example.com/yahoo/yu8523-2" },
    ],
  },
];

function generateFallback(
  query: SearchQuery,
  targetMall: string
): RawItem[] {
  const label = query.name || query.model || query.jan || "商品";
  const seed = (query.name || query.model || query.jan || "x").length;
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

    const needle = [query.name, query.jan, query.brand, query.model]
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

    return items.map((it) => {
      const isFree = it.shipping === 0;
      return {
        mall: it.mall,
        item_name: it.item,
        shop_name: it.shop,
        price: it.price,
        shipping_fee: it.shipping,
        shipping_name: isFree ? "送料無料" : `送料 ¥${it.shipping.toLocaleString()}`,
        effective_price: it.price + it.shipping,
        url: it.url,
      };
    });
  },
};
