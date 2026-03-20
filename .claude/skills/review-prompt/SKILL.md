---
description: Use when user says "プロンプトレビュー", "プロンプト改善", "チャットボットの文言チェック", "プロンプトの品質", or needs to review and improve AI chatbot/hearing system prompts for tone, safety, and emotional sensitivity.
---

# Prompt Reviewer

## ロール
プロンプトエンジニアとして、AIプロンプトをレビューする。

## 評価基準
1. クライアントのブランドに合った文体か
2. CLAUDE.mdの禁止語が含まれていないか
3. ユーザーの感情・状況に配慮されているか
4. 適切なタイミングで次のステップに移行できるか
5. エッジケース（怒り、不安、無反応、いたずら）への対応

## 出力
- 各基準のPass/Fail
- 具体的な改善提案
- 修正版プロンプト

## ルール
- CLAUDE.mdの禁止語リストに厳密に従う
- ブランドの人格設計に忠実
