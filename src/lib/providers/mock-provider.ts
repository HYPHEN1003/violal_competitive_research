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
    keywords: ["ワイヤレスイヤホン", "イヤホン", "earphone", "4901234567890"],
    items: [
      { mall: "楽天", shop: "サウンドプラスRakuten店", item: "ワイヤレスイヤホン Pro X1 ノイズキャンセリング", price: 9800, shipping: 0, url: "https://example.com/rakuten/x1" },
      { mall: "楽天", shop: "イヤホン本舗", item: "ワイヤレスイヤホン Pro X1 (新品)", price: 9500, shipping: 550, url: "https://example.com/rakuten/x1-2" },
      { mall: "Yahoo", shop: "オーディオストアYahoo!店", item: "ワイヤレスイヤホン Pro X1", price: 9300, shipping: 600, url: "https://example.com/yahoo/x1" },
      { mall: "Yahoo", shop: "ガジェット工房", item: "ワイヤレスイヤホン Pro X1 [送料無料]", price: 10200, shipping: 0, url: "https://example.com/yahoo/x1-2" },
      { mall: "楽天", shop: "デジタル家電館", item: "Pro X1 ワイヤレスイヤホン (並行輸入)", price: 8900, shipping: 980, url: "https://example.com/rakuten/x1-3" },
    ],
  },
  {
    keywords: ["コーヒーメーカー", "coffee", "4912345678901"],
    items: [
      { mall: "楽天", shop: "キッチンランド", item: "全自動コーヒーメーカー CM-300", price: 14800, shipping: 0, url: "https://example.com/rakuten/cm300" },
      { mall: "楽天", shop: "家電ファクトリー", item: "コーヒーメーカー CM-300 ブラック", price: 14500, shipping: 800, url: "https://example.com/rakuten/cm300-2" },
      { mall: "Yahoo", shop: "ホームアプライアンス", item: "全自動コーヒーメーカー CM-300 [新品]", price: 13980, shipping: 700, url: "https://example.com/yahoo/cm300" },
      { mall: "Yahoo", shop: "Cafe Goods Store", item: "CM-300 コーヒーメーカー", price: 15200, shipping: 0, url: "https://example.com/yahoo/cm300-2" },
    ],
  },
  {
    keywords: ["ロボット掃除機", "掃除機", "robot", "4923456789012"],
    items: [
      { mall: "楽天", shop: "クリーンライフ", item: "ロボット掃除機 RV-500 マッピング機能搭載", price: 32800, shipping: 0, url: "https://example.com/rakuten/rv500" },
      { mall: "楽天", shop: "家電プラザ", item: "RV-500 ロボット掃除機", price: 31500, shipping: 1100, url: "https://example.com/rakuten/rv500-2" },
      { mall: "Yahoo", shop: "スマート家電ストア", item: "RV-500 (国内正規品)", price: 33000, shipping: 0, url: "https://example.com/yahoo/rv500" },
      { mall: "Yahoo", shop: "リビング・ドット", item: "RV-500 ロボット掃除機 ホワイト", price: 30900, shipping: 1500, url: "https://example.com/yahoo/rv500-2" },
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
