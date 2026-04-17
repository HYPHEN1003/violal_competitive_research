"use client";

import { useRef, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Product } from "@/types/price-monitor";

interface SearchFormProps {
  onSearch: (formData: FormData) => void;
  products: Product[];
}

export function SearchForm({ onSearch, products }: SearchFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(() => onSearch(formData));
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
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">検索条件</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form ref={formRef} action={handleSubmit} className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div className="space-y-1.5">
            <Label htmlFor="q-name">商品名</Label>
            <Input id="q-name" name="name" placeholder="例：ワイヤレスイヤホン" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="q-jan">JANコード</Label>
            <Input id="q-jan" name="jan" placeholder="例：4901234567890" inputMode="numeric" />
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
