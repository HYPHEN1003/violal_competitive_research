-- 既存のダミー商品を削除（competitor_prices は CASCADE 削除、search_history は SET NULL）
DELETE FROM products;

-- シューズ10商品を投入
INSERT INTO products (sku, name, jan, category, my_price, cost_price, stock) VALUES
  ('SHOE-001', 'Nike Air Force 1 07 ホワイト',            '0883212345001', 'シューズ', 16500,  9800, 45),
  ('SHOE-002', 'Nike Air Max 90 ブラック',                '0883212345002', 'シューズ', 17800, 10500, 28),
  ('SHOE-003', 'Adidas Stan Smith ホワイト',              '4065427000001', 'シューズ', 13200,  7900, 62),
  ('SHOE-004', 'Adidas Samba OG ブラック',                '4065427000002', 'シューズ', 18700, 11200, 15),
  ('SHOE-005', 'New Balance 574 グレー',                  '0739980012345', 'シューズ', 12100,  7200, 38),
  ('SHOE-006', 'New Balance 996 ネイビー',                '0739980012346', 'シューズ', 18900, 12500, 22),
  ('SHOE-007', 'Converse All Star HI ホワイト',           '4549643000001', 'シューズ',  7200,  4500, 89),
  ('SHOE-008', 'Vans Old Skool ブラック/ホワイト',        '0191163000001', 'シューズ',  9900,  5600, 54),
  ('SHOE-009', 'Asics Gel-Kayano 30 メンズ',              '4550456000001', 'シューズ', 23800, 13800, 18),
  ('SHOE-010', 'Puma スウェード クラシック',              '4064536000001', 'シューズ', 10450,  6200, 31);
