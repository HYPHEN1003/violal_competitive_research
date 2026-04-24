import type { Product, Suggestion } from "@/types/price-monitor";

interface MyProductCardProps {
  product: Product | null;
  suggestion: Suggestion | null;
}

export function MyProductCard({ product, suggestion }: MyProductCardProps) {
  if (!product) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
        ⚠ 自社商品マスタに該当する商品が見つかりませんでした。商品名 / 品番 / JAN を見直してください。
      </div>
    );
  }

  const minViable = suggestion?.minViablePrice ?? Math.ceil(product.cost_price * 1.1);

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border bg-muted/30 px-4 py-2.5 text-sm">
      <span className="rounded bg-background px-2 py-0.5 text-xs font-mono font-medium">
        {product.sku}
      </span>
      <span className="font-semibold">{product.name}</span>
      <span className="hidden h-4 w-px bg-border sm:inline-block" />
      {product.brand && <Pill label="ブランド" value={product.brand} />}
      {product.model && <Pill label="品番" value={product.model} mono />}
      <Pill label="在庫" value={`${product.stock}個`} />
      <Pill label="原価" value={`¥${product.cost_price.toLocaleString()}`} />
      <Pill label="粗利下限" value={`¥${minViable.toLocaleString()}`} />
      {product.jan && <Pill label="JAN" value={product.jan} mono />}
    </div>
  );
}

function Pill({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <span className="text-xs">
      <span className="text-muted-foreground">{label}:</span>{" "}
      <span className={`font-medium ${mono ? "font-mono" : ""}`}>{value}</span>
    </span>
  );
}
