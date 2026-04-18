import type { CompetitorItem, Product } from "@/types/price-monitor";

interface ResultsTableProps {
  items: CompetitorItem[];
  myProduct?: Product | null;
}

type DisplayItem = CompetitorItem & { isSelf?: boolean };

const MALL_COLORS: Record<string, string> = {
  "楽天": "bg-red-700",
  Yahoo: "bg-red-500",
  violal: "bg-indigo-600",
};

export function ResultsTable({ items, myProduct }: ResultsTableProps) {
  const mergedItems: DisplayItem[] = myProduct
    ? [
        ...items,
        {
          mall: "violal",
          item_name: myProduct.name,
          shop_name: "violal（自社）",
          price: myProduct.my_price,
          shipping_fee: 0,
          effective_price: myProduct.my_price,
          url: "",
          isSelf: true,
        },
      ].sort((a, b) => a.effective_price - b.effective_price)
    : items;

  if (mergedItems.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
        該当する競合商品はありませんでした。
      </div>
    );
  }

  const minPrice = mergedItems[0].effective_price;

  return (
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
          {mergedItems.map((item, i) => {
            const isBest = item.effective_price === minPrice;
            const isSelf = item.isSelf === true;

            let rowBg = "";
            if (isSelf && isBest) rowBg = "bg-indigo-100 hover:bg-indigo-200";
            else if (isSelf)      rowBg = "bg-indigo-50 hover:bg-indigo-100";
            else if (isBest)      rowBg = "bg-orange-50 hover:bg-orange-100";
            else                  rowBg = "hover:bg-muted/30";

            return (
              <tr key={i} className={`border-b ${rowBg}`}>
                <td
                  className={`px-3 py-2.5 text-center font-semibold ${
                    isBest ? (isSelf ? "text-indigo-700" : "text-red-600") : "text-muted-foreground"
                  }`}
                >
                  {isBest ? "★1" : i + 1}
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
                    <span className="text-muted-foreground">—</span>
                  ) : item.shipping_fee === 0 ? (
                    <span className="text-muted-foreground">送料無料</span>
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
  );
}
