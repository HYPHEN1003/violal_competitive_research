"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { buildMallSuggestion, classifyLevel } from "@/lib/suggestion-engine";
import type { CompetitorItem, SelfMallPrice, Suggestion, SuggestionAction, SuggestionLevel } from "@/types/price-monitor";

const LEVEL_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  urgent:  { bg: "bg-red-600",    text: "text-white", label: "対応推奨" },
  watch:   { bg: "bg-amber-500",  text: "text-white", label: "経過観察" },
  good:    { bg: "bg-green-600",  text: "text-white", label: "良好" },
  no_data: { bg: "bg-gray-500",   text: "text-white", label: "データなし" },
};

interface SuggestionCardProps {
  suggestion: Suggestion | null;
  items?: CompetitorItem[];
  selfMallPrices?: { yahoo: SelfMallPrice; rakuten: SelfMallPrice };
}

interface MallSnapshot {
  mall: "Yahoo" | "楽天";
  selfPrice: number | null;
  competitorLowest: number | null;
  level: SuggestionLevel | null;
  diff: number | null;
  ratio: number | null;
}

function buildMallSnapshot(
  mall: "Yahoo" | "楽天",
  items: CompetitorItem[],
  selfMallPrice?: SelfMallPrice
): MallSnapshot {
  const mallItems = items.filter((i) => i.mall === mall);
  const competitorLowest = mallItems.length > 0
    ? mallItems.reduce((min, i) => (i.effective_price < min ? i.effective_price : min), Infinity)
    : null;

  if (!selfMallPrice?.found || selfMallPrice.price === undefined || competitorLowest === null) {
    return { mall, selfPrice: null, competitorLowest, level: null, diff: null, ratio: null };
  }
  const myMallPrice = selfMallPrice.effective_price ?? selfMallPrice.price;
  const c = classifyLevel(myMallPrice, competitorLowest);
  return {
    mall,
    selfPrice: myMallPrice,
    competitorLowest,
    level: c.level,
    diff: c.diff,
    ratio: c.ratio,
  };
}

export function SuggestionCard({ suggestion, items = [], selfMallPrices }: SuggestionCardProps) {
  if (!suggestion) return null;

  const style = LEVEL_STYLES[suggestion.level] ?? LEVEL_STYLES.no_data;
  const yahooSnap = buildMallSnapshot("Yahoo", items, selfMallPrices?.yahoo);
  const rakutenSnap = buildMallSnapshot("楽天", items, selfMallPrices?.rakuten);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">価格戦略の提案</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${style.bg} ${style.text}`}>
            {style.label}（総合）
          </span>
          <span className="font-semibold">{suggestion.title}</span>
          <span className="text-xs text-muted-foreground">
            ※ 全モールの最安と基準価格 ¥{suggestion.myProduct.my_price.toLocaleString()} の比較
          </span>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {suggestion.summary}
        </p>

        {/* モール別ミニ分析 */}
        <div>
          <p className="mb-2 text-xs font-semibold text-muted-foreground">モール別の戦線</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <MallSnapshotCard snapshot={yahooSnap} />
            <MallSnapshotCard snapshot={rakutenSnap} />
          </div>
        </div>

        {/* モール別 推奨アクション */}
        <div className="space-y-4">
          <p className="text-xs font-semibold text-muted-foreground">モール別 推奨アクション</p>
          <MallActionsSection
            mallLabel="Yahoo戦線"
            myProduct={suggestion.myProduct}
            snapshot={yahooSnap}
          />
          <MallActionsSection
            mallLabel="楽天戦線"
            myProduct={suggestion.myProduct}
            snapshot={rakutenSnap}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function MallActionsSection({
  mallLabel,
  myProduct,
  snapshot,
}: {
  mallLabel: string;
  myProduct: Suggestion["myProduct"];
  snapshot: MallSnapshot;
}) {
  if (snapshot.selfPrice === null || snapshot.competitorLowest === null) {
    return (
      <div className="rounded-lg border bg-muted/20 p-3">
        <p className="text-sm font-semibold">{mallLabel}</p>
        <p className="mt-1 text-xs text-muted-foreground">データ不足のため推奨アクションを生成できません。</p>
      </div>
    );
  }
  const result = buildMallSuggestion(myProduct, snapshot.selfPrice, snapshot.competitorLowest);
  const style = LEVEL_STYLES[result.level] ?? LEVEL_STYLES.no_data;

  return (
    <div className="rounded-lg border p-3 space-y-2">
      <div className="flex items-center gap-2">
        <p className="text-sm font-semibold">{mallLabel}</p>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${style.bg} ${style.text}`}>
          {style.label}
        </span>
      </div>
      <div className="space-y-2">
        {result.actions.map((action, i) => (
          <ActionRow key={i} action={action} mallLabel={mallLabel} />
        ))}
      </div>
    </div>
  );
}

function ActionRow({ action, mallLabel }: { action: SuggestionAction; mallLabel: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border bg-background p-3">
      <div className="min-w-0 space-y-1">
        <p className="text-sm font-semibold">{action.label}</p>
        <p className="text-xs text-muted-foreground">{action.detail}</p>
        {action.warning && (
          <p className="inline-block rounded bg-red-50 px-2 py-0.5 text-xs text-red-700">
            {action.warning}
          </p>
        )}
      </div>
      <Button
        size="sm"
        className="shrink-0"
        onClick={() =>
          alert(
            `【デモ】以下の施策を ${mallLabel} で発行しました（モック）:\n\n${action.label}\n\n${action.detail}`
          )
        }
      >
        この施策を発行
      </Button>
    </div>
  );
}

function MallSnapshotCard({ snapshot }: { snapshot: MallSnapshot }) {
  const mallLabel = `${snapshot.mall}戦線`;

  if (snapshot.selfPrice === null || snapshot.competitorLowest === null) {
    return (
      <div className="rounded-lg border bg-muted/30 p-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">{mallLabel}</p>
          <span className="text-[10px] text-muted-foreground">データ不足</span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {snapshot.competitorLowest === null ? "競合データなし" : "自社モール価格未取得"}
        </p>
      </div>
    );
  }

  const style = snapshot.level ? LEVEL_STYLES[snapshot.level] : LEVEL_STYLES.no_data;
  const diff = snapshot.diff ?? 0;
  const ratio = snapshot.ratio ?? 0;
  const ratioText = `${ratio >= 0 ? "+" : ""}${(ratio * 100).toFixed(1)}%`;
  const diffText = `${diff > 0 ? "+" : diff < 0 ? "-" : ""}¥${Math.abs(diff).toLocaleString()}`;
  const diffColor = diff > 0 ? "text-red-600" : diff < 0 ? "text-green-600" : "text-muted-foreground";

  return (
    <div className="rounded-lg border p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold">{mallLabel}</p>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${style.bg} ${style.text}`}>
          {style.label}
        </span>
      </div>
      <div className="space-y-1.5 text-sm">
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-muted-foreground">自社（{snapshot.mall}店）</span>
          <span className="font-semibold tabular-nums">¥{snapshot.selfPrice.toLocaleString()}</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-muted-foreground">競合最安</span>
          <span className="font-semibold tabular-nums">¥{snapshot.competitorLowest.toLocaleString()}</span>
        </div>
        <div className="flex items-baseline justify-between border-t pt-1.5">
          <span className="text-xs text-muted-foreground">価格差</span>
          <span className={`font-bold tabular-nums ${diffColor}`}>
            {diffText} ({ratioText})
          </span>
        </div>
      </div>
    </div>
  );
}
