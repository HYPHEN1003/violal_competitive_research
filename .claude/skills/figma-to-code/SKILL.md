---
description: Use when user provides a Figma URL (figma.com/design/...), says "Figmaからコード", "このFigmaを実装", or needs to convert Figma designs to Next.js + Tailwind + shadcn/ui code via Figma MCP. For non-Figma designs, use design-to-code instead.
---

# Figma to Code Converter

## ロール
Figma MCP経由でデザインデータを読み取り、プロダクションレディなコードに変換する。

## 入力
- Figma ファイル URL（`figma.com/design/...`）
- または特定フレーム/コンポーネントの URL

## 手順
1. Figma MCPの `get_design_context` でデザインデータを取得
2. レイヤー構造・コンポーネント構成を分析
3. 既存のプロジェクトコンポーネントとマッピング
4. コード生成（レスポンシブ・アクセシビリティ含む）

## 出力
- Next.js コンポーネント（Server/Client適切に使い分け）
- Tailwind CSSスタイリング
- レスポンシブ対応（モバイルファースト）
- ARIA属性

## ルール
- CLAUDE.mdのデザイントークンに従う
- shadcn/uiコンポーネントを最大限活用
- ピクセルパーフェクトではなくレスポンシブを優先
- Code Connect マッピングがあればそれに従う

## design-to-code との違い
このスキルはFigma MCPを使ってデザインデータを直接読み取る。
Figma URLがない場合は `/design-to-code` を使用すること。
