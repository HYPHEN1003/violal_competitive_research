-- products テーブルに状態カラム追加
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS sales_rank INTEGER,
  ADD COLUMN IF NOT EXISTS last_suggestion_level TEXT,
  ADD COLUMN IF NOT EXISTS last_checked_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_products_monitored ON products(is_monitored);
CREATE INDEX IF NOT EXISTS idx_products_last_level ON products(last_suggestion_level);

-- 既存10商品の状態設定（mock-provider.ts の判定結果に合わせた疑似データ）
UPDATE products SET sales_rank=1,  last_suggestion_level='urgent',    last_checked_at=now(), is_monitored=TRUE WHERE sku='SHOE-001';
UPDATE products SET sales_rank=2,  last_suggestion_level='recommend', last_checked_at=now(), is_monitored=TRUE WHERE sku='SHOE-002';
UPDATE products SET sales_rank=3,  last_suggestion_level='monitor',   last_checked_at=now(), is_monitored=TRUE WHERE sku='SHOE-003';
UPDATE products SET sales_rank=4,  last_suggestion_level='urgent',    last_checked_at=now(), is_monitored=TRUE WHERE sku='SHOE-004';
UPDATE products SET sales_rank=5,  last_suggestion_level='recommend', last_checked_at=now(), is_monitored=TRUE WHERE sku='SHOE-005';
UPDATE products SET sales_rank=6,  last_suggestion_level='good',      last_checked_at=now(), is_monitored=TRUE WHERE sku='SHOE-006';
UPDATE products SET sales_rank=7,  last_suggestion_level='good',      last_checked_at=now(), is_monitored=TRUE WHERE sku='SHOE-007';
UPDATE products SET sales_rank=8,  last_suggestion_level='monitor',   last_checked_at=now(), is_monitored=TRUE WHERE sku='SHOE-008';
UPDATE products SET sales_rank=9,  last_suggestion_level='urgent',    last_checked_at=now(), is_monitored=TRUE WHERE sku='SHOE-009';
UPDATE products SET sales_rank=10, last_suggestion_level='recommend', last_checked_at=now(), is_monitored=TRUE WHERE sku='SHOE-010';
