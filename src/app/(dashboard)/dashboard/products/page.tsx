import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/types/price-monitor";
import { ProductsTable } from "./_components/products-table";

type LevelKey = "urgent" | "watch" | "good" | "no_data";

export default async function ProductsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("sku");

  const products = (data ?? []) as Product[];

  // レベル × モール の集計
  function emptyCount() { return { total: 0, yahoo: 0, rakuten: 0 }; }
  const stats: Record<LevelKey, { total: number; yahoo: number; rakuten: number }> = {
    urgent: emptyCount(), watch: emptyCount(), good: emptyCount(), no_data: emptyCount(),
  };
  for (const p of products) {
    const raw = p.last_suggestion_level;
    const lv: LevelKey = raw === "urgent" || raw === "watch" || raw === "good" ? raw : "no_data";
    stats[lv].total++;
    if (p.sku.startsWith("SKU-Y")) stats[lv].yahoo++;
    else if (p.sku.startsWith("SKU-R")) stats[lv].rakuten++;
  }

  const yahooCount = products.filter((p) => p.sku.startsWith("SKU-Y")).length;
  const rakutenCount = products.filter((p) => p.sku.startsWith("SKU-R")).length;
  const otherCount = products.length - yahooCount - rakutenCount;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">商品リスト</h2>
        <p className="text-sm text-muted-foreground">
          価格監視中の自社商品マスタ（{products.length}件）
        </p>
      </div>

      {/* 集計サマリー（モール別内訳付き） */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="🔴 対応推奨" stat={stats.urgent}  sub="競合より10%以上高い" />
        <SummaryCard label="🟠 経過観察" stat={stats.watch}   sub="競合より0〜10%高い" />
        <SummaryCard label="🟢 良好"     stat={stats.good}    sub="競合と同等または安い" />
        <SummaryCard label="⚪ データなし" stat={stats.no_data} sub="競合データ未取得" />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <SmallStat label="Yahoo由来" value={yahooCount} />
        <SmallStat label="楽天由来" value={rakutenCount} />
        {otherCount > 0 && <SmallStat label="その他" value={otherCount} />}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          DB 読込エラー: {error.message}
        </div>
      )}

      <ProductsTable products={products} />
    </div>
  );
}

function SummaryCard({
  label,
  stat,
  sub,
}: {
  label: string;
  stat: { total: number; yahoo: number; rakuten: number };
  sub: string;
}) {
  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <p className="text-sm font-semibold text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-bold tabular-nums">
        {stat.total}<span className="ml-1 text-sm font-normal text-muted-foreground">件</span>
      </p>
      <div className="mt-2 space-y-0.5 text-xs text-muted-foreground">
        <div>Yahoo: <span className="font-semibold tabular-nums">{stat.yahoo}件</span></div>
        <div>楽天: <span className="font-semibold tabular-nums">{stat.rakuten}件</span></div>
      </div>
      <p className="mt-2 text-[10px] text-muted-foreground">{sub}</p>
    </div>
  );
}

function SmallStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border bg-background px-3 py-2 text-sm">
      <span className="text-muted-foreground">{label}: </span>
      <span className="font-semibold tabular-nums">{value}件</span>
    </div>
  );
}
