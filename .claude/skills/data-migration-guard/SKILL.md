---
name: data-migration-guard
description: 静的JSON→DB移行チェックリスト。「JSON移行」「データ移行」「静的データをDBに」と言われた時に使用。既知のJS落とし穴を事前チェック。
---

# 静的 JSON → DB 移行ガード

静的 JSON ファイルから Supabase（DB）への移行時に踏みやすい地雷を事前チェックする。

## 事前チェックリスト

### 1. Math.max / Math.min 空配列問題

```javascript
// 危険: 空配列で -Infinity を返す
Math.max(...[])  // → -Infinity
Math.min(...[])  // → Infinity
```

**対策**:
```javascript
const safeMax = (arr) => arr.length > 0 ? Math.max(...arr) : 0;
const safeMin = (arr) => arr.length > 0 ? Math.min(...arr) : 0;
```

**影響**: Chart.js に `-Infinity` が入るとグラフがフリーズする。

### 2. Context Provider スコープ問題

```tsx
// 危険: Provider の外で useContext すると undefined
<Layout>
  <DataProvider>  {/* ← ここでしかデータが取れない */}
    <Dashboard />
  </DataProvider>
  <Sidebar />     {/* ← ここでは undefined */}
</Layout>
```

**対策**: Provider を適切な階層に配置。必要なら Layout レベルに上げる。

### 3. export const dynamic の名前衝突

```typescript
// 危険: Next.js の予約語と衝突
export const dynamic = 'force-dynamic';  // Next.js のルート設定
export const dynamic = myData;            // ← 名前が衝突！
```

**対策**: データには別の変数名を使う（`dynamicData`, `items` 等）。

### 4. .env.local フォーマット問題

```
# 危険なパターン
DATABASE_URL="postgres://..."   # 引用符が値に含まれる場合あり
API_KEY = sk_live_xxx           # 空白が入ると値が壊れる
MULTILINE=line1\nline2          # 改行が意図通りに入らない
```

**対策**: 引用符は必要な場合のみ。空白を入れない。改行は別の方法で。

### 5. 移行スクリプトのベストプラクティス

1. **バックアップ**: 移行前に JSON ファイルのバックアップを取る
2. **段階的移行**: 全データを一度に移行せず、テーブルごとに分割
3. **型変換**: JSON の string → DB の integer 等、型変換を明示的に行う
4. **null ハンドリング**: JSON の `null` / `undefined` / 空文字の扱いを統一
5. **検証**: 移行後のレコード数が JSON のオブジェクト数と一致するか確認
