import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Product, Suggestion } from "@/types/price-monitor";

interface MyProductCardProps {
  product: Product | null;
  suggestion: Suggestion | null;
}

export function MyProductCard({ product, suggestion }: MyProductCardProps) {
  if (!product) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">自社商品情報</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            自社商品マスタに該当する商品が見つかりませんでした。商品名 / JAN を見直してください。
          </div>
        </CardContent>
      </Card>
    );
  }

  const minViable = suggestion?.minViablePrice ?? Math.ceil(product.cost_price * 1.1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">自社商品情報</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {product.sku}
          </span>
          <span className="font-semibold">{product.name}</span>
        </div>
        <div className="grid grid-cols-5 gap-3">
          <Cell label="JANコード" value={product.jan ?? "-"} />
          <Cell label="自社販売価格" value={`¥${product.my_price.toLocaleString()}`} />
          <Cell label="原価" value={`¥${product.cost_price.toLocaleString()}`} />
          <Cell label="粗利下限（原価+10%）" value={`¥${minViable.toLocaleString()}`} />
          <Cell label="在庫" value={`${product.stock} 個`} />
        </div>
      </CardContent>
    </Card>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/50 p-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold tabular-nums">{value}</p>
    </div>
  );
}
