"use client";

import { useState } from "react";
import type { BenchmarkResult, CompetitorItem, Product, SelfMallPrice } from "@/types/price-monitor";

interface ResultsTableProps {
  items: CompetitorItem[];
  myProduct?: Product | null;
  benchmarks?: BenchmarkResult[];
  selfMallPrices?: { yahoo: SelfMallPrice; rakuten: SelfMallPrice };
}

type BaseItem = CompetitorItem & { isSelf?: boolean };
type DisplayItem = BaseItem & {
  rank: number;
  isBenchmark?: boolean;
  benchmarkFound?: boolean;
};

const MALL_COLORS: Record<string, string> = {
  "楽天": "bg-red-700",
  Yahoo: "bg-red-500",
  violal: "bg-indigo-600",
};

type Tab = "top" | "benchmark" | "yahoo" | "rakuten";

export function ResultsTable({ items, myProduct, benchmarks, selfMallPrices }: ResultsTableProps) {
  const [tab, setTab] = useState<Tab>("top");

  // モールタブ用の自社行ビルダ（モール別実価格をかぶせる）
  function buildMallSelfRow(mall: "Yahoo" | "楽天"): BaseItem | null {
    if (!myProduct) return null;
    const mp = mall === "Yahoo" ? selfMallPrices?.yahoo : selfMallPrices?.rakuten;
    if (!mp || !mp.found || mp.price === undefined) return null;
    const eff = mp.effective_price ?? mp.price;
    return {
      mall: "violal", // インディゴ強調を流用
      item_name: mp.item_name ?? myProduct.name,
      shop_name: `violal（${mall}店）`,
      price: mp.price,
      shipping_fee: mp.shipping_fee ?? null,
      shipping_name: mp.shipping_name ?? null,
      effective_price: eff,
      url: mp.url ?? "",
      isSelf: true,
    };
  }

  // 標準競争順位を付与するヘルパ（モールタブ用に局所再ランクで使用）
  function applyRanking(baseItems: BaseItem[]): DisplayItem[] {
    const sorted = baseItems.slice().sort((a, b) => a.effective_price - b.effective_price);
    const out: DisplayItem[] = [];
    let prevPrice: number | null = null;
    let prevRank = 0;
    sorted.forEach((it, i) => {
      const rank = prevPrice !== null && it.effective_price === prevPrice ? prevRank : i + 1;
      out.push({ ...it, rank });
      prevPrice = it.effective_price;
      prevRank = rank;
    });
    return out;
  }

  // 自社商品をマージしてソート
  const merged: BaseItem[] = myProduct
    ? [
        ...items,
        {
          mall: "violal",
          item_name: myProduct.name,
          shop_name: "violal（自社）",
          price: myProduct.my_price,
          shipping_fee: 0,
          shipping_name: null,
          effective_price: myProduct.my_price,
          url: "",
          isSelf: true,
        },
      ].sort((a, b) => a.effective_price - b.effective_price)
    : items.slice().sort((a, b) => a.effective_price - b.effective_price);

  // 全件に順位を付与（同率は同順位、次は件数ぶんスキップ: 1,2,2,4）
  const ranked: DisplayItem[] = [];
  let prevPrice: number | null = null;
  let prevRank = 0;
  merged.forEach((item, i) => {
    const rank =
      prevPrice !== null && item.effective_price === prevPrice ? prevRank : i + 1;
    ranked.push({ ...item, rank });
    prevPrice = item.effective_price;
    prevRank = rank;
  });

  // ベンチマーク行を DisplayItem に変換（取扱なしはプレースホルダ）
  // 1社あたり最大2行（Yahoo + 楽天）出現するので、ショップ名にモール表記を併記
  const benchmarkDisplayItems: DisplayItem[] = (benchmarks ?? []).map((r, i) => ({
    mall: r.mall,
    item_name: r.found ? (r.item_name ?? "") : "取扱なし",
    shop_name: `${r.shop.name}（${r.mall}店）`,
    price: r.price ?? 0,
    shipping_fee: r.shipping_fee ?? null,
    shipping_name: r.shipping_name ?? null,
    effective_price: r.effective_price ?? r.price ?? 0,
    url: r.url || r.shop.base_url,
    rank: i + 1,
    isBenchmark: true,
    benchmarkFound: r.found,
  }));

  if (ranked.length === 0 && benchmarkDisplayItems.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
        該当する競合商品はありませんでした。
      </div>
    );
  }

  const selfItem = ranked.find((x) => x.isSelf);
  const selfRank = selfItem?.rank ?? null;
  const hasMoreBeyondTen = ranked.length > 10;
  const hasBenchmarks = benchmarkDisplayItems.length > 0;

  const yahooItems = ranked.filter((x) => x.mall === "Yahoo");
  const rakutenItems = ranked.filter((x) => x.mall === "楽天");
  const yahooCount = yahooItems.length;
  const rakutenCount = rakutenItems.length;

  const showTabs = hasMoreBeyondTen || hasBenchmarks || (yahooCount > 0 && rakutenCount > 0);

  // 表示対象の行を決定
  let displayItems: DisplayItem[];
  let selfAppended = false;
  if (tab === "benchmark") {
    displayItems = benchmarkDisplayItems;
  } else if (tab === "yahoo") {
    // モール別自社価格を取得して、Yahoo競合と一緒に局所再ランク
    const baseYahoo: BaseItem[] = yahooItems.map((item) => {
      const { rank: _r, isBenchmark: _b, benchmarkFound: _f, ...rest } = item;
      void _r; void _b; void _f;
      return rest;
    });
    const selfRow = buildMallSelfRow("Yahoo");
    displayItems = applyRanking(selfRow ? [...baseYahoo, selfRow] : baseYahoo);
  } else if (tab === "rakuten") {
    const baseRakuten: BaseItem[] = rakutenItems.map((item) => {
      const { rank: _r, isBenchmark: _b, benchmarkFound: _f, ...rest } = item;
      void _r; void _b; void _f;
      return rest;
    });
    const selfRow = buildMallSelfRow("楽天");
    displayItems = applyRanking(selfRow ? [...baseRakuten, selfRow] : baseRakuten);
  } else {
    // tab === "top"
    const top10 = ranked.slice(0, 10);
    const selfInTop10 = selfItem ? top10.includes(selfItem) : true;
    if (selfItem && !selfInTop10) {
      displayItems = [...top10, selfItem];
      selfAppended = true;
    } else {
      displayItems = top10;
    }
  }

  const minPrice = ranked.length > 0 ? ranked[0].effective_price : Infinity;
  const benchFoundCount = (benchmarks ?? []).filter((b) => b.found).length;

  return (
    <div className="space-y-3">
      {showTabs && (
        <div className="flex flex-wrap border-b">
          <TabButton active={tab === "top"} onClick={() => setTab("top")}>
            上位10件{selfAppended && tab === "top" ? " + 自社" : ""}
          </TabButton>
          {hasBenchmarks && (
            <TabButton active={tab === "benchmark"} onClick={() => setTab("benchmark")}>
              ベンチマーク社（{benchFoundCount}/{benchmarkDisplayItems.length}社）
            </TabButton>
          )}
          <TabButton active={tab === "yahoo"} onClick={() => setTab("yahoo")}>
            Yahoo全件（{yahooCount}件）
          </TabButton>
          <TabButton active={tab === "rakuten"} onClick={() => setTab("rakuten")}>
            楽天全件（{rakutenCount}件）
          </TabButton>
        </div>
      )}

      {selfAppended && tab === "top" && (
        <p className="text-xs text-muted-foreground">
          自社は <span className="font-semibold text-indigo-700">{selfRank}位</span>。参考として末尾に表示しています。
        </p>
      )}

      {tab === "benchmark" && myProduct && (
        <p className="text-xs text-muted-foreground">
          ベンチマーク指定の3社からの価格状況。自社価格は <span className="font-semibold text-indigo-700">¥{myProduct.my_price.toLocaleString()}</span>。
        </p>
      )}

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-xs text-muted-foreground">
              <th className="w-12 px-3 py-2.5 text-center">
                {tab === "benchmark" ? "#" : "順位"}
              </th>
              <th className="px-3 py-2.5 text-left">モール</th>
              <th className="px-3 py-2.5 text-left">商品名</th>
              <th className="px-3 py-2.5 text-left">ショップ名</th>
              <th className="px-3 py-2.5 text-right">価格</th>
              <th className="px-3 py-2.5 text-right">送料</th>
              <th className="px-3 py-2.5 text-right">実質価格</th>
              <th className="px-3 py-2.5 text-left">商品URL</th>
            </tr>
          </thead>
          <tbody>
            {displayItems.map((item, idx) => {
              const isBenchmark = item.isBenchmark === true;
              const bmNotFound = isBenchmark && item.benchmarkFound === false;
              const isBest =
                !isBenchmark && item.effective_price === minPrice;
              const isSelf = item.isSelf === true;
              const isAppendedSelf =
                tab === "top" && isSelf && selfAppended && idx === displayItems.length - 1;

              let rowBg = "";
              if (bmNotFound) rowBg = "bg-muted/30";
              else if (isBenchmark) rowBg = "bg-amber-50 hover:bg-amber-100";
              else if (isSelf && isBest) rowBg = "bg-indigo-100 hover:bg-indigo-200";
              else if (isSelf) rowBg = "bg-indigo-50 hover:bg-indigo-100";
              else if (isBest) rowBg = "bg-orange-50 hover:bg-orange-100";
              else rowBg = "hover:bg-muted/30";

              return (
                <tr
                  key={`${tab}-${item.rank}-${item.mall}-${item.shop_name}-${idx}`}
                  className={`border-b ${rowBg} ${isAppendedSelf ? "border-t-2 border-t-indigo-300" : ""}`}
                >
                  <td
                    className={`px-3 py-2.5 text-center font-semibold ${
                      bmNotFound
                        ? "text-muted-foreground"
                        : isBest
                        ? isSelf
                          ? "text-indigo-700"
                          : "text-red-600"
                        : "text-muted-foreground"
                    }`}
                  >
                    {isBenchmark ? item.rank : isBest ? "★1" : item.rank}
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-[11px] font-semibold text-white ${
                        MALL_COLORS[item.mall] ?? "bg-gray-500"
                      }`}
                    >
                      {item.mall}
                    </span>
                  </td>
                  <td className={`px-3 py-2.5 ${isSelf ? "font-semibold" : ""} ${bmNotFound ? "text-muted-foreground italic" : ""}`}>
                    {item.item_name}
                  </td>
                  <td className={`px-3 py-2.5 ${isSelf ? "font-semibold text-indigo-700" : ""} ${isBenchmark && !bmNotFound ? "font-semibold" : ""}`}>
                    {item.shop_name}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {bmNotFound ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      `¥${item.price.toLocaleString()}`
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {bmNotFound ? (
                      <span className="text-muted-foreground">—</span>
                    ) : isSelf ? (
                      <span className="text-muted-foreground">送料無料</span>
                    ) : item.shipping_fee === 0 ? (
                      <span className="text-muted-foreground">送料無料</span>
                    ) : item.shipping_fee === null ? (
                      <span className="text-muted-foreground text-xs">
                        {item.shipping_name ?? "要確認"}
                      </span>
                    ) : (
                      `¥${item.shipping_fee.toLocaleString()}`
                    )}
                  </td>
                  <td
                    className={`px-3 py-2.5 text-right font-semibold tabular-nums ${
                      bmNotFound
                        ? "text-muted-foreground"
                        : isBest
                        ? isSelf
                          ? "text-indigo-700"
                          : "text-red-600"
                        : ""
                    }`}
                  >
                    {bmNotFound ? "—" : `¥${item.effective_price.toLocaleString()}`}
                  </td>
                  <td className="px-3 py-2.5">
                    {isSelf ? (
                      item.url ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-indigo-700 hover:underline"
                        >
                          自社商品ページ ↗
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">— 自社商品</span>
                      )
                    ) : bmNotFound ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:underline"
                      >
                        店舗トップ ↗
                      </a>
                    ) : (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        商品ページ ↗
                      </a>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "border-primary text-primary"
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
