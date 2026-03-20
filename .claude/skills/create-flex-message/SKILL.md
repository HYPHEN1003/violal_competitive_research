---
description: Use when user says "Flex Message", "LINE メッセージ", "LINEのカード", "リッチメッセージ", or needs to create LINE Flex Message JSON for chatbot or notification flows.
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
