"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { loadMonitorSummary, loadProductsByLevel, type MonitorSummary as MS } from "../actions";
import type { Product } from "@/types/price-monitor";

function formatTimeAgo(iso: string | null): string {
  if (!iso) return "未実行";
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "たった今";
  if (min < 60) return `${min}分前`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}時間前`;
  return `${Math.floor(hr / 24)}日前`;
}

type Level = "urgent" | "recommend" | "monitor" | "good";

const LEVELS: { key: Level; label: string; icon: string; color: string; selectedBorder: string }[] = [
  { key: "urgent",    label: "緊急", icon: "🔴", color: "bg-red-50 border-red-200 text-red-700",       selectedBorder: "border-red-500 ring-2 ring-red-300" },
  { key: "recommend", label: "推奨", icon: "🟠", color: "bg-orange-50 border-orange-200 text-orange-700", selectedBorder: "border-orange-500 ring-2 ring-orange-300" },
  { key: "monitor",   label: "監視", icon: "🔵", color: "bg-blue-50 border-blue-200 text-blue-700",      selectedBorder: "border-blue-500 ring-2 ring-blue-300" },
  { key: "good",      label: "優位", icon: "🟢", color: "bg-green-50 border-green-200 text-green-700",    selectedBorder: "border-green-500 ring-2 ring-green-300" },
];

interface MonitorSummaryProps {
  onProductClick?: (product: Product) => void;
}

export function MonitorSummary({ onProductClick }: MonitorSummaryProps) {
  const [summary, setSummary] = useState<MS | null>(null);
  const [expandedLevel, setExpandedLevel] = useState<Level | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    loadMonitorSummary().then(setSummary).catch(console.error);
  }, []);

  async function handleLevelClick(level: Level) {
    if (expandedLevel === level) {
      setExpandedLevel(null);
      setProducts([]);
      return;
    }
    setExpandedLevel(level);
    setLoadingProducts(true);
    try {
      const result = await loadProductsByLevel(level);
      setProducts(result);
    } finally {
      setLoadingProducts(false);
    }
  }

  if (!summary) {
    return (
      <Card>
        <CardContent className="py-6 text-sm text-muted-foreground">
          監視サマリーを読み込み中…
        </CardContent>
      </Card>
    );
  }

  const expandedLevelMeta = LEVELS.find((l) => l.key === expandedLevel);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">監視サマリー</CardTitle>
          <span className="text-xs text-muted-foreground">
            監視中 {summary.totalMonitored} 商品 · 最終更新 {formatTimeAgo(summary.lastCheckedAt)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-3">
          {LEVELS.map((l) => {
            const isSelected = expandedLevel === l.key;
            return (
              <button
                key={l.key}
                type="button"
                onClick={() => handleLevelClick(l.key)}
                className={`rounded-lg border p-4 text-left transition-all hover:shadow-md cursor-pointer ${l.color} ${isSelected ? l.selectedBorder : ""}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{l.icon}</span>
                  <span className="text-sm font-medium">{l.label}</span>
                </div>
                <div className="mt-2 text-2xl font-bold tabular-nums">
                  {summary.counts[l.key]}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">件</span>
                </div>
              </button>
            );
          })}
        </div>

        {expandedLevel && expandedLevelMeta && (
          <div className="rounded-lg border bg-muted/30 p-4">
            <h3 className="mb-3 text-sm font-semibold">
              {expandedLevelMeta.icon} {expandedLevelMeta.label}レベルの商品（{products.length}件）
            </h3>
            {loadingProducts ? (
              <p className="text-sm text-muted-foreground">読み込み中…</p>
            ) : products.length === 0 ? (
              <p className="text-sm text-muted-foreground">該当する商品がありません。</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-xs text-muted-foreground">
                      <th className="px-3 py-2 text-left">SKU</th>
                      <th className="px-3 py-2 text-left">商品名</th>
                      <th className="px-3 py-2 text-right">自社価格</th>
                      <th className="px-3 py-2 text-right">在庫</th>
                      <th className="px-3 py-2 text-left">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id} className="border-b hover:bg-background">
                        <td className="px-3 py-2 font-mono text-xs">{p.sku}</td>
                        <td className="px-3 py-2">{p.name}</td>
                        <td className="px-3 py-2 text-right tabular-nums">
                          ¥{p.my_price.toLocaleString()}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums">{p.stock}</td>
                        <td className="px-3 py-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            onClick={() => onProductClick?.(p)}
                          >
                            検索
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
