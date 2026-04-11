# DESIGN.md — [PROJECT_NAME]

> AIエージェントが読むためのデザインシステム仕様書。
> Google Stitch の DESIGN.md 仕様に準拠（9セクション構成）。
> 壁打ちスキル（/spec-project）の Q5-7 で自動生成される。

---

## 1. Visual Theme & Atmosphere

**方向性**: [DESIGN_DIRECTION — 例: モダン・ミニマル、和風、クリニカル、プレミアム]

**キーワード**: [3-5語で雰囲気を表現 — 例: 清潔感、信頼、温かみ、プロフェッショナル]

**インスピレーション**: [参考サイトやブランド — 例: Vercel のミニマリズム、Stripe の洗練さ]

**全体の印象**:
[2-3文でデザインの哲学を記述。色使い、余白の考え方、ユーザーにどう感じてほしいか]

---

## 2. Color Palette & Roles

### プライマリカラー

| ロール | HEX | 用途 |
|--------|-----|------|
| Background | [BG_COLOR — 例: #FFFFFF] | ページ背景 |
| Background Muted | [BG_MUTED — 例: #F9FAFB] | セクション背景、カード背景 |
| Text | [TEXT_COLOR — 例: #111827] | 本文テキスト |
| Text Muted | [TEXT_MUTED — 例: #6B7280] | 補助テキスト、キャプション |
| Accent | [ACCENT_COLOR — 例: #2563EB] | リンク、アイコン、アクセント |
| CTA | [CTA_COLOR — 例: #06C755] | CTAボタン、成功状態 |
| Border | [BORDER_COLOR — 例: #E5E7EB] | 区切り線、カード枠 |

### セマンティックカラー

| ロール | HEX | 用途 |
|--------|-----|------|
| Success | #22C55E | 成功メッセージ、完了状態 |
| Warning | #F59E0B | 警告、注意喚起 |
| Error | #EF4444 | エラーメッセージ、バリデーション |
| Info | #3B82F6 | 情報、ヒント |

### ダークモード（対応する場合）

| ロール | ライト | ダーク |
|--------|--------|--------|
| Background | [BG_COLOR] | [DARK_BG — 例: #0A0A0A] |
| Text | [TEXT_COLOR] | [DARK_TEXT — 例: #EDEDED] |
| Accent | [ACCENT_COLOR] | [DARK_ACCENT] |

---

## 3. Typography Rules

### フォントファミリー

| 用途 | フォント | フォールバック |
|------|---------|--------------|
| 見出し | [HEADING_FONT — 例: Noto Serif JP] | serif |
| 本文 | [BODY_FONT — 例: Noto Sans JP] | sans-serif |
| コード | JetBrains Mono | monospace |

### タイポグラフィスケール

| レベル | サイズ | ウェイト | 行間 | 字間 | 用途 |
|--------|--------|---------|------|------|------|
| Display | 48px / 3rem | 700 | 1.1 | -0.02em | ヒーローセクション |
| H1 | 36px / 2.25rem | 700 | 1.2 | -0.015em | ページタイトル |
| H2 | 28px / 1.75rem | 600 | 1.3 | -0.01em | セクション見出し |
| H3 | 22px / 1.375rem | 600 | 1.4 | 0 | サブセクション |
| H4 | 18px / 1.125rem | 600 | 1.4 | 0 | カードタイトル |
| Body | 16px / 1rem | 400 | 1.7 | 0 | 本文 |
| Small | 14px / 0.875rem | 400 | 1.6 | 0 | 補助テキスト |
| Caption | 12px / 0.75rem | 400 | 1.5 | 0.01em | キャプション、ラベル |

---

## 4. Component Stylings

### ボタン

| バリアント | 背景 | テキスト | ボーダー | hover | 角丸 |
|-----------|------|---------|---------|-------|------|
| Primary | [CTA_COLOR] | white | none | opacity 0.9 | 8px |
| Secondary | transparent | [TEXT_COLOR] | 1px solid [BORDER_COLOR] | bg [BG_MUTED] | 8px |
| Ghost | transparent | [TEXT_COLOR] | none | bg [BG_MUTED] | 8px |
| Destructive | #EF4444 | white | none | #DC2626 | 8px |

**サイズ**: sm (h-8 px-3 text-sm) / default (h-10 px-4) / lg (h-12 px-6 text-lg)

### カード

```
背景: [BG_COLOR]
ボーダー: 1px solid [BORDER_COLOR]
角丸: 12px
パディング: 24px
シャドウ: 0 1px 3px rgba(0,0,0,0.1)
hover時: shadow-md, translateY(-1px)
```

### インプット

```
背景: [BG_COLOR]
ボーダー: 1px solid [BORDER_COLOR]
角丸: 8px
パディング: 8px 12px
フォーカス: ring-2 ring-[ACCENT_COLOR] border-[ACCENT_COLOR]
エラー: border-[ERROR_COLOR]
```

### ナビゲーション

```
高さ: 56px (h-14)
背景: [BG_COLOR] / backdrop-blur（スクロール時）
ボーダー: bottom 1px solid [BORDER_COLOR]
ロゴ位置: 左
アクション: 右
モバイル: Sheet（左スライド）
```

---

## 5. Layout Principles

### スペーシングスケール

| トークン | 値 | 用途 |
|---------|-----|------|
| space-1 | 4px | インライン要素間 |
| space-2 | 8px | コンパクトな要素間 |
| space-3 | 12px | フォーム要素間 |
| space-4 | 16px | カード内パディング |
| space-6 | 24px | セクション内要素間 |
| space-8 | 32px | カード間 |
| space-12 | 48px | セクション間 |
| space-16 | 64px | 大セクション間 |
| space-24 | 96px | ヒーロー上下 |

### グリッド

```
最大幅: 1280px (max-w-7xl)
サイドパディング: 16px (モバイル) / 24px (タブレット) / 32px (デスクトップ)
カラム: 1 (モバイル) / 2 (md) / 3 (lg) / 4 (xl)
ガップ: 16px (モバイル) / 24px (デスクトップ)
```

### ホワイトスペースの哲学

[デザインにおける余白の考え方を2-3文で記述 — 例: 「余白は贅沢ではなく必需品。要素を詰め込むより、一つ一つの要素が呼吸できる空間を確保する」]

---

## 6. Depth & Elevation

### シャドウシステム

| レベル | 値 | 用途 |
|--------|-----|------|
| shadow-sm | 0 1px 2px rgba(0,0,0,0.05) | ボタン、バッジ |
| shadow | 0 1px 3px rgba(0,0,0,0.1) | カード、ドロップダウン |
| shadow-md | 0 4px 6px rgba(0,0,0,0.1) | ホバー状態、モーダル |
| shadow-lg | 0 10px 15px rgba(0,0,0,0.1) | ポップオーバー、トースト |
| shadow-xl | 0 20px 25px rgba(0,0,0,0.1) | モーダル、ダイアログ |

### 表面階層

```
Level 0: ページ背景（[BG_COLOR]）
Level 1: カード、サイドバー（[BG_COLOR] + shadow）
Level 2: ドロップダウン、ポップオーバー（[BG_COLOR] + shadow-md）
Level 3: モーダル、ダイアログ（[BG_COLOR] + shadow-xl + overlay）
```

---

## 7. Do's and Don'ts

### Do's
- shadcn/ui コンポーネントをベースにカスタマイズする
- Tailwind CSS のユーティリティクラスを使う
- セマンティックカラーを用途に応じて正しく使う
- 状態（hover, focus, active, disabled）を全て実装する
- 空状態・エラー状態・ローディング状態を必ず用意する

### Don'ts
- 生CSSを書かない（Tailwind + shadcn/ui のみ）
- テーマカラー以外の色をハードコードしない
- フォントサイズを任意の値にしない（スケールに従う）
- シャドウを独自に定義しない（シャドウシステムに従う）
- アニメーションを過剰に使わない（意味のある動きだけ）
- [PROJECT_SPECIFIC_DONTS]

---

## 8. Responsive Behavior

### ブレークポイント

| 名前 | 幅 | 用途 |
|------|-----|------|
| sm | 640px | 大きめのスマートフォン |
| md | 768px | タブレット |
| lg | 1024px | 小さめのデスクトップ |
| xl | 1280px | デスクトップ |
| 2xl | 1536px | ワイドスクリーン |

### モバイルファーストの原則
- デフォルトはモバイル向けスタイル
- `md:` 以上でデスクトップレイアウトに切り替え
- タッチターゲット最小サイズ: 44x44px
- サイドバー: `md:block` / モバイルは Sheet
- テーブル: モバイルではカードビューに変換

### 折りたたみ戦略
- ナビゲーション → ハンバーガー + Sheet
- 複数カラム → 1カラムスタック
- 大きなテーブル → 横スクロール or カード化
- サイドバー → 非表示 or ドロワー

---

## 9. Agent Prompt Guide

### ページ生成プロンプト例

```
このDESIGN.mdに従って、[PAGE_NAME]ページを実装してください。
- shadcn/ui コンポーネントを使用
- Tailwind CSS でスタイリング
- カラーパレットとタイポグラフィスケールに厳密に従う
- モバイルファーストで実装
- 空状態・エラー状態・ローディング状態を含める
```

### コンポーネント生成プロンプト例

```
DESIGN.mdのComponent Stylingsセクションに従って、
[COMPONENT_NAME]コンポーネントを作成してください。
全てのバリアント（Primary/Secondary/Ghost/Destructive）と
全ての状態（default/hover/focus/active/disabled）を実装。
```

### LP セクション生成プロンプト例

```
DESIGN.mdのデザインシステムに従って、
[SECTION_TYPE — Hero/Features/Pricing/FAQ/CTA]セクションを実装してください。
Visual Themeの雰囲気を忠実に再現し、
レスポンシブ対応（モバイル/タブレット/デスクトップ）を含めてください。
```
