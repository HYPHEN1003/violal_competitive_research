---
paths:
  - "src/components/**/*.tsx"
  - "src/app/**/*.tsx"
---

# UIコンポーネントルール

- UIはshadcn/ui + Tailwind CSSで構築する（生CSS禁止）
- Server ComponentsとClient Componentsを適切に使い分ける
- 全ページで空状態・エラー状態・ローディング状態を実装する
- モバイルファーストでレスポンシブ対応する
- 画像は`next/image`を使用し、適切なサイズを指定する
- WCAG 2.2 AA準拠のアクセシビリティを確保する
- CLAUDE.mdのデザイントークン（カラー・フォント）に従う

## Tailwind CSS 注意点
- Tailwind クラスを定数ファイル（constants.ts等）に移動すると CSS が生成されない → `tailwind.config` の `content` パスにそのファイルを追加すること

## 日付フォーマット
- `toLocaleDateString('ja-JP')` はゼロパディングされない（例: 2026/4/1）
- 統一フォーマットが必要な場合は `padStart(2, '0')` で手動フォーマットする

## Vercel 静的 HTML
- 相対パスの画像が表示されない場合は `next.config` の `trailingSlash: true` を設定する
