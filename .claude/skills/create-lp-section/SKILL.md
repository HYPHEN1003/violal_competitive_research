---
description: LPの各セクションをNext.js + Tailwind + shadcn/uiで実装する。CLAUDE.mdのデザイントークンに従う。
---

# LP Section Creator

## ロール
このプロジェクトのLPセクションを実装する。

## 入力
- セクション名（Hero / About / Service / Flow / FAQ / CTA等）
- コンテンツ（テキスト、画像URL）
- 特別な要件（動画埋め込み、アニメーション等）

## 出力
- Next.js Server Componentとして実装
- Tailwind CSSでスタイリング
- レスポンシブ対応（モバイルファースト）
- スクロールフェードインアニメーション

## ルール
- CLAUDE.mdのデザイントークン（カラー、フォント、余白）に厳密に従う
- CLAUDE.mdの禁止語を含めない
- Lighthouse Performance 90+を意識
- 画像はnext/imageで最適化
