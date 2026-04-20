"use client";

import { useState } from "react";
import type { CompetitorItem, Product } from "@/types/price-monitor";

interface ResultsTableProps {
  items: CompetitorItem[];
  myProduct?: Product | null;
}

type DisplayItem = CompetitorItem & { isSelf?: boolean; rank: number };

const MALL_COLORS: Record<string, string> = {
  "楽天": "bg-red-700",
  Yahoo: "bg-red-500",
  violal: "bg-indigo-600",
};

export function ResultsTable({ items, myProduct }: ResultsTableProps) {
  const [tab, setTab] = useState<"top" | "all">("top");

  // 自社商品をマージしてソート
  const merged: (CompetitorItem & { isSelf?: boolean })[] = myProduct
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

  // 全件に順位を付与（実質価格が同じなら同順位、次は件数ぶんスキップする標準競争順位: 1,2,2,4）
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

  if (ranked.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
        該当する競合商品はありませんでした。
      </div>
    );
  }

  const selfItem = ranked.find((x) => x.isSelf);
  const selfRank = selfItem?.rank ?? null;
  const hasMoreBeyondTen = ranked.length > 10;

  // 表示対象の行を決定
  // 自社行は「必ず」表示するため、top10 スライスに含まれていなければ末尾に付け足す。
  // 同率順位があると配列インデックスと rank がずれる場合があるので、rank比較ではなく配列実在で判定。
  let displayItems: DisplayItem[];
  let selfAppended = false;
  if (tab === "top") {
    const top10 = ranked.slice(0, 10);
    const selfInTop10 = selfItem ? top10.includes(selfItem) : true;
    if (selfItem && !selfInTop10) {
      displayItems = [...top10, selfItem];
      selfAppended = true;
    } else {
      displayItems = top10;
    }
  } else {
    displayItems = ranked;
  }

  const minPrice = ranked[0].effective_price;

  return (
    <div className="space-y-3">
      {hasMoreBeyondTen && (
        <div className="flex border-b">
          <TabButton active={tab === "top"} onClick={() => setTab("top")}>
            上位10件{selfAppended ? " + 自社" : ""}
          </TabButton>
          <TabButton active={tab === "all"} onClick={() => setTab("all")}>
            全件表示（{ranked.length}件）
          </TabButton>
        </div>
      )}

      {selfAppended && tab === "top" && (
        <p className="text-xs text-muted-foreground">
          自社は <span className="font-semibold text-indigo-700">{selfRank}位</span>。参考として末尾に表示しています。
        </p>
      )}

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-xs text-muted-foreground">
              <th className="w-12 px-3 py-2.5 text-center">順位</th>
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
              const isBest = item.effective_price === minPrice;
              const isSelf = item.isSelf === true;
              // 上位10件タブで自社を末尾に付け足す場合のみ、境界線を強調
              const isAppendedSelf =
                tab === "top" && isSelf && selfAppended && idx === displayItems.length - 1;

              let rowBg = "";
              if (isSelf && isBest) rowBg = "bg-indigo-100 hover:bg-indigo-200";
              else if (isSelf) rowBg = "bg-indigo-50 hover:bg-indigo-100";
              else if (isBest) rowBg = "bg-orange-50 hover:bg-orange-100";
              else rowBg = "hover:bg-muted/30";

              return (
                <tr
                  key={`${item.rank}-${item.mall}-${item.shop_name}-${idx}`}
                  className={`border-b ${rowBg} ${isAppendedSelf ? "border-t-2 border-t-indigo-300" : ""}`}
                >
                  <td
                    className={`px-3 py-2.5 text-center font-semibold ${
                      isBest ? (isSelf ? "text-indigo-700" : "text-red-600") : "text-muted-foreground"
                    }`}
                  >
                    {isBest ? "★1" : item.rank}
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
                  <td className={`px-3 py-2.5 ${isSelf ? "font-semibold" : ""}`}>
                    {item.item_name}
                  </td>
                  <td className={`px-3 py-2.5 ${isSelf ? "font-semibold text-indigo-700" : ""}`}>
                    {item.shop_name}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    ¥{item.price.toLocaleString()}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {isSelf ? (
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
                      isBest ? (isSelf ? "text-indigo-700" : "text-red-600") : ""
                    }`}
                  >
                    ¥{item.effective_price.toLocaleString()}
                  </td>
                  <td className="px-3 py-2.5">
                    {isSelf ? (
                      <span className="text-xs text-muted-foreground">— 自社商品</span>
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
