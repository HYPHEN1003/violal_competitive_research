import type { CompetitorItem } from "@/types/price-monitor";

interface ResultsTableProps {
  items: CompetitorItem[];
}

const MALL_COLORS: Record<string, string> = {
  "楽天": "bg-red-700",
  Yahoo: "bg-red-500",
};

export function ResultsTable({ items }: ResultsTableProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
        該当する競合商品はありませんでした。
      </div>
    );
  }

  const minPrice = items[0].effective_price;

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
          {items.map((item, i) => {
            const isBest = item.effective_price === minPrice;
            return (
              <tr
                key={i}
                className={`border-b hover:bg-muted/30 ${isBest ? "bg-orange-50 hover:bg-orange-100" : ""}`}
              >
                <td className={`px-3 py-2.5 text-center font-semibold ${isBest ? "text-red-600" : "text-muted-foreground"}`}>
                  {isBest ? "★1" : i + 1}
                </td>
                <td className="px-3 py-2.5">
                  <span
                    className={`inline-block rounded px-2 py-0.5 text-[11px] font-semibold text-white ${MALL_COLORS[item.mall] ?? "bg-gray-500"}`}
                  >
                    {item.mall}
                  </span>
                </td>
                <td className="px-3 py-2.5">{item.item_name}</td>
                <td className="px-3 py-2.5">{item.shop_name}</td>
                <td className="px-3 py-2.5 text-right tabular-nums">
                  ¥{item.price.toLocaleString()}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums">
                  {item.shipping_fee === 0 ? (
                    <span className="text-muted-foreground">送料無料</span>
                  ) : (
                    `¥${item.shipping_fee.toLocaleString()}`
                  )}
                </td>
                <td
                  className={`px-3 py-2.5 text-right font-semibold tabular-nums ${isBest ? "text-red-600" : ""}`}
                >
                  ¥{item.effective_price.toLocaleString()}
                </td>
                <td className="px-3 py-2.5">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    商品ページ ↗
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
