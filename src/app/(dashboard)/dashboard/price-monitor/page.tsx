"use client";

import { useState, useEffect, useTransition } from "react";
import { SearchForm } from "./_components/search-form";
import { SummaryCard } from "./_components/summary-card";
import { MyProductCard } from "./_components/my-product-card";
import { SuggestionCard } from "./_components/suggestion-card";
import { ResultsTable } from "./_components/results-table";
import { SearchHistory } from "./_components/search-history";
import { MonitorSummary } from "./_components/monitor-summary";
import {
  searchCompetitors,
  loadSearchHistory,
  loadProducts,
  type SearchResponse,
} from "./actions";
import type { Product, SearchHistoryEntry } from "@/types/price-monitor";

export default function PriceMonitorPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [history, setHistory] = useState<SearchHistoryEntry[]>([]);
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [queryName, setQueryName] = useState("");
  const [queryJan, setQueryJan] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const [prods, hist] = await Promise.all([
        loadProducts(),
        loadSearchHistory(),
      ]);
      setProducts(prods);
      setHistory(hist);
    });
  }, []);

  async function handleSearch(formData: FormData) {
    setError(null);
    const name = (formData.get("name") as string)?.trim() || "";
    const jan = (formData.get("jan") as string)?.trim() || "";
    setQueryName(name);
    setQueryJan(jan);

    try {
      const res = await searchCompetitors(formData);
      setResult(res);
      const updatedHistory = await loadSearchHistory();
      setHistory(updatedHistory);
    } catch (e) {
      setError(e instanceof Error ? e.message : "検索処理でエラーが発生しました");
      setResult(null);
    }
  }

  function handleReplay(entry: SearchHistoryEntry) {
    const fd = new FormData();
    if (entry.query_name) fd.set("name", entry.query_name);
    if (entry.query_jan) fd.set("jan", entry.query_jan);
    handleSearch(fd);
  }

  function handleProductSearch(product: Product) {
    const fd = new FormData();
    fd.set("name", product.name);
    if (product.jan) fd.set("jan", product.jan);
    handleSearch(fd);
    setTimeout(() => {
      window.scrollTo({ top: 400, behavior: "smooth" });
    }, 100);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">競合価格監視</h2>
        <p className="text-sm text-muted-foreground">
          楽天市場 / Yahoo!ショッピングの競合価格を取得して比較します
        </p>
      </div>

      <SearchForm onSearch={handleSearch} products={products} />

      <MonitorSummary onProductClick={handleProductSearch} />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {result && (
        <>
          <MyProductCard
            product={result.myProduct}
            suggestion={result.suggestion}
          />
          <SuggestionCard suggestion={result.suggestion} />
          <SummaryCard
            result={result}
            queryName={queryName}
            queryJan={queryJan}
          />
          <div className="space-y-2">
            <h3 className="text-base font-semibold">
              競合価格一覧（{result.count}件）
            </h3>
            <ResultsTable
              items={result.items}
              myProduct={result.myProduct}
              benchmarks={result.benchmarks}
            />
          </div>
        </>
      )}

      <SearchHistory history={history} onReplay={handleReplay} />
    </div>
  );
}
