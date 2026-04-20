import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SearchResponse } from "../actions";

interface SummaryCardProps {
  result: SearchResponse;
  queryName?: string;
  queryJan?: string;
}

export function SummaryCard({ result, queryName, queryJan }: SummaryCardProps) {
  const queryParts: string[] = [];
  if (queryName) queryParts.push(`商品名: ${queryName}`);
  if (queryJan) queryParts.push(`JAN: ${queryJan}`);
  if (result.myProduct?.brand) queryParts.push(`ブランド: ${result.myProduct.brand}`);
  if (result.myProduct?.model) queryParts.push(`品番: ${result.myProduct.model}`);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">検索結果サマリー</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border bg-muted/50 p-4">
            <p className="text-xs text-muted-foreground">検索条件</p>
            <p className="mt-1 text-sm font-semibold break-all">
              {queryParts.join(" / ") || "(条件なし)"}
            </p>
          </div>
          <div className="rounded-lg border bg-muted/50 p-4">
            <p className="text-xs text-muted-foreground">取得件数</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">
              {result.count} 件
            </p>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs text-muted-foreground">最安値（実質価格）</p>
            {result.lowest ? (
              <>
                <p className="mt-1 text-xl font-bold text-red-600 tabular-nums">
                  ¥{result.lowest.price.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {result.lowest.mall} / {result.lowest.shop}
                </p>
              </>
            ) : (
              <p className="mt-1 text-sm italic text-muted-foreground">該当なし</p>
            )}
          </div>
        </div>

        {result.errors.length > 0 && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            一部モールの取得に失敗しました：
            {result.errors.map((e) => `${e.mall}: ${e.message}`).join(" / ")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
