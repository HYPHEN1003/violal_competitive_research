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
