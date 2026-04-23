"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { SearchHistoryEntry } from "@/types/price-monitor";

const LEVEL_LABEL: Record<string, string> = {
  urgent: "対応推奨",
  watch:  "経過観察",
  good:   "良好",
  // 旧データ（マイグレーション前）の互換用
  recommend: "経過観察",
  monitor:   "経過観察",
  no_data: "-",
};

interface SearchHistoryProps {
  history: SearchHistoryEntry[];
  onReplay: (entry: SearchHistoryEntry) => void;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function SearchHistory({ history, onReplay }: SearchHistoryProps) {
  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">検索履歴（直近10件）</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">まだ履歴はありません。</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">検索履歴（直近10件）</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-xs text-muted-foreground">
                <th className="px-3 py-2 text-left">日時</th>
                <th className="px-3 py-2 text-left">商品名</th>
                <th className="px-3 py-2 text-left">JAN</th>
                <th className="px-3 py-2 text-right">件数</th>
                <th className="px-3 py-2 text-right">最安値</th>
                <th className="px-3 py-2 text-left">判定</th>
                <th className="px-3 py-2 text-left">操作</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id} className="border-b hover:bg-muted/30">
                  <td className="px-3 py-2 tabular-nums">{formatDate(h.searched_at)}</td>
                  <td className="px-3 py-2">{h.query_name || "-"}</td>
                  <td className="px-3 py-2">{h.query_jan || "-"}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{h.result_count}</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {h.lowest_price != null ? (
                      <>
                        ¥{h.lowest_price.toLocaleString()}{" "}
                        <span className="text-muted-foreground">({h.lowest_mall})</span>
                      </>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {LEVEL_LABEL[h.suggestion_level ?? ""] ?? "-"}
                  </td>
                  <td className="px-3 py-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => onReplay(h)}
                    >
                      再検索
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
