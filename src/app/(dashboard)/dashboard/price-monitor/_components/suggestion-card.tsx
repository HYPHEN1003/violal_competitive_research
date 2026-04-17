"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Suggestion } from "@/types/price-monitor";

const LEVEL_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  urgent:    { bg: "bg-red-600",    text: "text-white", label: "緊急" },
  recommend: { bg: "bg-orange-600", text: "text-white", label: "推奨" },
  monitor:   { bg: "bg-blue-600",   text: "text-white", label: "監視" },
  good:      { bg: "bg-green-600",  text: "text-white", label: "優位" },
  no_data:   { bg: "bg-gray-500",   text: "text-white", label: "データなし" },
};

interface SuggestionCardProps {
  suggestion: Suggestion | null;
}

export function SuggestionCard({ suggestion }: SuggestionCardProps) {
  if (!suggestion) return null;

  const style = LEVEL_STYLES[suggestion.level] ?? LEVEL_STYLES.no_data;

  const diffSign =
    suggestion.diffAmount == null
      ? "-"
      : (suggestion.diffAmount > 0 ? "+" : "") +
        suggestion.diffAmount.toLocaleString();
  const ratioText =
    suggestion.diffRatio == null
      ? "-"
      : (suggestion.diffRatio > 0 ? "+" : "") +
        (suggestion.diffRatio * 100).toFixed(1) +
        "%";
  const diffColor =
    suggestion.diffAmount == null
      ? ""
      : suggestion.diffAmount > 0
        ? "text-red-600"
        : "text-green-600";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">価格戦略の提案</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${style.bg} ${style.text}`}>
            {style.label}
          </span>
          <span className="font-semibold">{suggestion.title}</span>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {suggestion.summary}
        </p>

        <div className="grid grid-cols-4 gap-3">
          <DiffCell label="自社価格" value={`¥${suggestion.myProduct.my_price.toLocaleString()}`} />
          <DiffCell
            label="競合最安（実質）"
            value={
              suggestion.lowestCompetitor
                ? `¥${suggestion.lowestCompetitor.effective_price.toLocaleString()}`
                : "-"
            }
            sub={
              suggestion.lowestCompetitor
                ? `${suggestion.lowestCompetitor.mall} / ${suggestion.lowestCompetitor.shop_name}`
                : undefined
            }
          />
          <DiffCell label="価格差" value={`¥${diffSign}`} valueClass={diffColor} />
          <DiffCell label="価格差（%）" value={ratioText} valueClass={diffColor} />
        </div>

        <div className="space-y-2">
          {suggestion.actions.map((action, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-3 rounded-lg border p-4"
            >
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
                    `【デモ】以下の施策を発行しました（モック）:\n\n${action.label}\n\n${action.detail}`
                  )
                }
              >
                この施策を発行
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function DiffCell({
  label,
  value,
  sub,
  valueClass,
}: {
  label: string;
  value: string;
  sub?: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-lg border bg-muted/50 p-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className={`mt-1 font-semibold tabular-nums ${valueClass ?? ""}`}>{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  );
}
