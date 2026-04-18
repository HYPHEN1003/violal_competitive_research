"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Search, X } from "lucide-react";
import type { Product } from "@/types/price-monitor";

interface SearchFormProps {
  onSearch: (formData: FormData) => void;
  products: Product[];
}

export function SearchForm({ onSearch, products }: SearchFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  function handleSubmit(formData: FormData) {
    startTransition(() => onSearch(formData));
    setIsOpen(false);
  }

  function quickSearch(product: Product) {
    if (!formRef.current) return;
    const nameInput = formRef.current.querySelector<HTMLInputElement>('[name="name"]');
    const janInput = formRef.current.querySelector<HTMLInputElement>('[name="jan"]');
    if (nameInput) nameInput.value = product.name;
    if (janInput) janInput.value = product.jan ?? "";
    const fd = new FormData();
    fd.set("name", product.name);
    fd.set("jan", product.jan ?? "");
    startTransition(() => onSearch(fd));
    setIsOpen(false);
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center gap-2 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 px-4 py-3 text-left text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
      >
        <Search className="h-4 w-4" />
        <span>商品名 / JAN で個別検索</span>
        <span className="ml-auto text-xs">クリックで開く ▼</span>
      </button>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Search className="h-4 w-4" />
            個別検索
          </h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-8 gap-1 px-2"
          >
            <X className="h-4 w-4" />
            閉じる
          </Button>
        </div>
        <form ref={formRef} action={handleSubmit} className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div className="space-y-1.5">
            <Label htmlFor="q-name">商品名</Label>
            <Input id="q-name" name="name" placeholder="例: Nike Air Force 1" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="q-jan">JANコード</Label>
            <Input id="q-jan" name="jan" placeholder="例: 0883212345001" inputMode="numeric" />
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? "取得中…" : "検索"}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground">
          商品名・JANコードのいずれかを入力してください（両方入力時はAND条件）。
        </p>

        {products.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">自社商品マスタからクイック検索:</p>
            <div className="flex flex-wrap gap-2">
              {products.map((p) => (
                <Button
                  key={p.id}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => quickSearch(p)}
                  disabled={isPending}
                >
                  {p.sku}: {p.name}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
