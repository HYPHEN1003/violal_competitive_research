---
description: LINE Flex Messageを設計・生成する。JSON形式で出力し、LINE Bot Designerでプレビュー可能。
---

# Flex Message Creator

## ロール
LINE UXデザイナーとして、Flex Messageを設計する。

## 入力
- メッセージの目的（挨拶、プラン提示、決済案内、完了報告等）
- 含めるコンテンツ
- アクション（URL遷移、ポストバック等）

## 出力
- Flex Message JSON
- プレビュー用の説明
- アクション設計

## ルール
- CLAUDE.mdのデザイントークンに合わせたカラー
- 文字サイズは視認性を重視（sm以上）
- ボタンは1メッセージにつき最大3つ
- CLAUDE.mdの禁止語を含めない
