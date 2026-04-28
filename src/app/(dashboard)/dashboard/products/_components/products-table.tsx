"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import type { Product } from "@/types/price-monitor";

const LEVEL_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  urgent: { label: "対応推奨", bg: "bg-red-100",   text: "text-red-700" },
  watch:  { label: "経過観察", bg: "bg-amber-100", text: "text-amber-800" },
  good:   { label: "良好",     bg: "bg-green-100", text: "text-green-700" },
};

type SourceFilter = "all" | "yahoo" | "rakuten";
type LevelFilter = "all" | "urgent" | "watch" | "good" | "no_data";

interface ProductsTableProps {
  products: Product[];
}

export function ProductsTable({ products }: ProductsTableProps) {
  const [search, setSearch] = useState("");
  const [source, setSource] = useState<SourceFilter>("all");
  const [level, setLevel] = useState<LevelFilter>("all");

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (source === "yahoo" && !p.sku.startsWith("SKU-Y")) return false;
      if (source === "rakuten" && !p.sku.startsWith("SKU-R")) return false;
      if (level !== "all") {
        const lv = p.last_suggestion_level;
        if (level === "no_data") {
          if (lv === "urgent" || lv === "watch" || lv === "good") return false;
        } else {
          if (lv !== level) return false;
        }
      }
      if (search.trim()) {
        const needle = search.trim().toLowerCase();
        const haystack = [p.sku, p.name, p.brand, p.model, p.category]
          .filter(Boolean)
          .map((x) => String(x).toLowerCase())
          .join(" ");
        if (!haystack.includes(needle)) return false;
      }
      return true;
    });
  }, [products, search, source, level]);

  return (
    <div className="space-y-3">
      {/* フィルタバー */}
      <div className="flex flex-wrap items-center gap-2">
        <Input
          type="text"
          placeholder="SKU / 商品名 / ブランド / 品番 で検索"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <FilterPills
          options={[
            { value: "all", label: "全モール" },
            { value: "yahoo", label: "Yahoo由来" },
            { value: "rakuten", label: "楽天由来" },
          ]}
          value={source}
          onChange={(v) => setSource(v as SourceFilter)}
        />
        <FilterPills
          options={[
            { value: "all", label: "全レベル" },
            { value: "urgent", label: "🔴 対応推奨" },
            { value: "watch", label: "🟠 経過観察" },
            { value: "good", label: "🟢 良好" },
            { value: "no_data", label: "⚪ データなし" },
          ]}
          value={level}
          onChange={(v) => setLevel(v as LevelFilter)}
        />
        <span className="ml-auto text-xs text-muted-foreground">
          {filtered.length} / {products.length} 件
        </span>
      </div>

      {/* テーブル */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-xs text-muted-foreground">
              <th className="px-3 py-2.5 text-left">SKU</th>
              <th className="px-3 py-2.5 text-left">ブランド</th>
              <th className="px-3 py-2.5 text-left">品番</th>
              <th className="px-3 py-2.5 text-left">カテゴリ</th>
              <th className="px-3 py-2.5 text-left">商品名</th>
              <th className="px-3 py-2.5 text-right">自社価格</th>
              <th className="px-3 py-2.5 text-right">原価</th>
              <th className="px-3 py-2.5 text-right">在庫</th>
              <th className="px-3 py-2.5 text-center">レベル</th>
              <th className="px-3 py-2.5 text-left">最終確認</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-3 py-8 text-center text-sm text-muted-foreground">
                  該当する商品がありません。
                </td>
              </tr>
            ) : (
              filtered.map((p) => {
                const lv = p.last_suggestion_level as string | null | undefined;
                const badge = lv && LEVEL_BADGE[lv] ? LEVEL_BADGE[lv] : null;
                return (
                  <tr key={p.id} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2.5 font-mono text-xs">{p.sku}</td>
                    <td className="px-3 py-2.5">{p.brand ?? <span className="text-muted-foreground">-</span>}</td>
                    <td className="px-3 py-2.5 font-mono text-xs">{p.model ?? <span className="text-muted-foreground">-</span>}</td>
                    <td className="px-3 py-2.5 text-xs">{p.category ?? <span className="text-muted-foreground">-</span>}</td>
                    <td className="max-w-[400px] px-3 py-2.5">
                      <span className="line-clamp-2 text-xs" title={p.name}>{p.name}</span>
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums">¥{p.my_price.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-xs text-muted-foreground">¥{p.cost_price.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{p.stock}</td>
                    <td className="px-3 py-2.5 text-center">
                      {badge ? (
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${badge.bg} ${badge.text}`}>
                          {badge.label}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">
                      {p.last_checked_at ? formatDate(p.last_checked_at) : "—"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterPills<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-1 rounded-md border bg-muted/30 p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`rounded px-2.5 py-1 text-xs transition-colors ${
            value === opt.value
              ? "bg-background font-semibold shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getMonth() + 1}/${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
