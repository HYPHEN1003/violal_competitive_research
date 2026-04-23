-- ベンチマーク対象店舗マスタ
CREATE TABLE benchmark_shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  yahoo_seller_id TEXT NOT NULL UNIQUE,
  base_url TEXT NOT NULL,
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE benchmark_shops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read benchmark_shops"
  ON benchmark_shops FOR SELECT TO authenticated USING (true);

CREATE POLICY "Service can manage benchmark_shops"
  ON benchmark_shops FOR ALL TO service_role USING (true);

-- デモ用3社
INSERT INTO benchmark_shops (name, yahoo_seller_id, base_url, priority) VALUES
  ('ギャレリア Bag&Luggage', 'galleria-onlineshop', 'https://store.shopping.yahoo.co.jp/galleria-onlineshop/', 1),
  ('ミスチーフ',             'mischief',            'https://store.shopping.yahoo.co.jp/mischief/',            2),
  ('カバンのセレクション',    'selection',           'https://store.shopping.yahoo.co.jp/selection/',           3);
