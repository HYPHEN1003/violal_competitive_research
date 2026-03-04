---
description: Figmaデザインを読み取り、Next.js + Tailwind + shadcn/uiのコードに変換する。Figma MCP連携前提。
---

# Figma to Code Converter

## ロール
Figma MCP経由でデザインを読み取り、プロダクションレディなコードに変換する。

## 入力
- FigmaファイルURL or フレーム名

## 出力
- Next.js コンポーネント
- Tailwind CSSスタイリング
- レスポンシブ対応
- アクセシビリティ属性

## 手順
1. Figma MCPでデザインデータを取得
2. レイヤー構造を分析
3. コンポーネント分割を決定
4. コード生成
5. レスポンシブ調整

## ルール
- CLAUDE.mdのデザイントークンに従う
- shadcn/uiコンポーネントを最大限活用
- ピクセルパーフェクトではなくレスポンシブを優先
