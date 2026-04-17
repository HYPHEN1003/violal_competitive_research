-- 競合価格監視アプリ用テーブル

-- 自社商品マスタ
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  jan TEXT,
  model TEXT,
  category TEXT,
  my_price INTEGER NOT NULL,
  cost_price INTEGER NOT NULL,
  stock INTEGER DEFAULT 0,
  is_monitored BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_products_jan ON products(jan);
CREATE INDEX idx_products_sku ON products(sku);

-- 競合価格履歴
CREATE TABLE competitor_prices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  mall TEXT NOT NULL,
  item_name TEXT NOT NULL,
  shop_name TEXT NOT NULL,
  price INTEGER NOT NULL,
  shipping_fee INTEGER DEFAULT 0,
  effective_price INTEGER NOT NULL,
  url TEXT,
  fetched_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_cp_product_id ON competitor_prices(product_id);
CREATE INDEX idx_cp_fetched_at ON competitor_prices(fetched_at);
CREATE INDEX idx_cp_product_fetched ON competitor_prices(product_id, fetched_at DESC);

-- 検索履歴
CREATE TABLE search_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  query_name TEXT,
  query_jan TEXT,
  result_count INTEGER DEFAULT 0,
  lowest_price INTEGER,
  lowest_mall TEXT,
  lowest_shop TEXT,
  matched_product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  suggestion_level TEXT,
  searched_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_sh_user ON search_history(user_id, searched_at DESC);

-- RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read products"
  ON products FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage products"
  ON products FOR ALL TO service_role USING (true);

CREATE POLICY "Authenticated users can read competitor_prices"
  ON competitor_prices FOR SELECT TO authenticated USING (true);

CREATE POLICY "Service can manage competitor_prices"
  ON competitor_prices FOR ALL TO service_role USING (true);

CREATE POLICY "Users can read own search history"
  ON search_history FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own search history"
  ON search_history FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- デモ用シードデータ
INSERT INTO products (sku, name, jan, category, my_price, cost_price, stock) VALUES
  ('SKU-001', 'ワイヤレスイヤホン Pro X1', '4901234567890', '家電', 10800, 6500, 124),
  ('SKU-002', '全自動コーヒーメーカー CM-300', '4912345678901', '家電', 15500, 9800, 38),
  ('SKU-003', 'ロボット掃除機 RV-500', '4923456789012', '家電', 34800, 22000, 12);
