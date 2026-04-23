"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { BenchmarkResult, Product } from "@/types/price-monitor";

interface BenchmarkCardProps {
  benchmarks?: BenchmarkResult[];
  myProduct: Product | null;
}

export function BenchmarkCard({ benchmarks, myProduct }: BenchmarkCardProps) {
  if (!myProduct || !benchmarks || benchmarks.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">🎯 ベンチマーク3社の価格</CardTitle>
          <span className="text-xs text-muted-foreground">
            自社 ¥{myProduct.my_price.toLocaleString()} との比較
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {benchmarks.map((b) => (
          <BenchmarkRow key={b.shop.id} result={b} />
        ))}
      </CardContent>
    </Card>
  );
}

function BenchmarkRow({ result }: { result: BenchmarkResult }) {
  const { shop, found } = result;

  if (!found) {
    return (
      <div className="flex items-center justify-between gap-4 rounded-lg border bg-muted/30 p-4">
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{shop.name}</p>
          <p className="text-xs text-muted-foreground">取り扱いなし</p>
        </div>
        <Button asChild size="sm" variant="outline">
          <a href={shop.base_url} target="_blank" rel="noopener noreferrer">
            店舗トップへ ↗
          </a>
        </Button>
      </div>
    );
  }

  const effective = result.effective_price ?? result.price ?? 0;
  const diff = result.diff_amount ?? 0;
  const ratio = result.diff_ratio ?? 0;
  // diff > 0: 自社が高い（=相手が安い）、diff < 0: 自社が安い
  const diffSign = diff > 0 ? "+" : "";
  const diffColor =
    diff > 0 ? "text-red-600" : diff < 0 ? "text-green-600" : "text-muted-foreground";
  const ratioText = `${ratio > 0 ? "+" : ""}${(ratio * 100).toFixed(1)}%`;

  return (
    <div className="rounded-lg border p-4 hover:bg-muted/20">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="font-semibold">{shop.name}</p>
          <p className="truncate text-xs text-muted-foreground">{result.item_name}</p>
          {result.jan_code && (
            <p className="text-[10px] text-muted-foreground font-mono">
              JAN: {result.jan_code}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-lg font-bold tabular-nums">¥{effective.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">
            {result.shipping_name || (result.shipping_fee === 0 ? "送料無料" : "送料別")}
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-4">
        <div className="flex items-baseline gap-2">
          <span className="text-xs text-muted-foreground">自社比</span>
          <span className={`text-sm font-semibold tabular-nums ${diffColor}`}>
            {diffSign}¥{Math.abs(diff).toLocaleString()} ({ratioText})
          </span>
        </div>
        <Button asChild size="sm" variant="outline">
          <a href={result.url} target="_blank" rel="noopener noreferrer">
            この商品ページへ ↗
          </a>
        </Button>
      </div>
    </div>
  );
}
