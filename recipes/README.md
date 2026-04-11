# Recipes

`hyphen-project-starter` の **オプション機能**（recipes）を集めたディレクトリ。

## Recipesとは

`recipes/` は、特定の案件で必要になる重い機能や、外部ツール連携を **オプトイン** で取り込むためのレシピ集です。

プロジェクトのコアを薄く保ちつつ、必要に応じて選択的に有効化できます。

### coreとrecipesの違い

| 区分 | 配置 | 特徴 |
|------|------|------|
| **core** | `src/`, `.claude/`, `docs/` | 全プロジェクトで標準搭載 |
| **recipes** | `recipes/<name>/` | 案件ごとにオプトインで有効化 |

## 利用可能なRecipe一覧

| Recipe | 用途 | 依存 | 案件例 |
|--------|------|------|--------|
| [document-ingest](./document-ingest/) | 任意のファイルをMarkdown/構造化データに変換 | markitdown + opendataloader-pdf | クライアント資料取り込み、契約書・マニュアルの構造化 |
| [document-rag](./document-rag/) | 長文書のベクトルDB不要な推論検索 | PageIndex | 保険約款、技工指示書、作業マニュアル検索 |
| [voice-asr](./voice-asr/) | 60分単発の音声認識（多言語） | VibeVoice ASR | 商談録音→議事録、取材音声→記事 |

## Recipeの使い方

1. 該当Recipeのディレクトリを開く
2. `README.md` で目的と使い方を確認
3. `SETUP.md` のセットアップ手順に従ってインストール
4. プロジェクト固有のカスタマイズを適用

## Recipeを追加する時の基準

新しいRecipeを追加する前に以下を満たすか確認：

- **2件以上の利用実績が見込める**（1案件専用は core や個別プロジェクトへ）
- **重い依存（Python/Java/GPU等）がある**（軽ければ core へ）
- **オプショナルで無効化可能**（core を阻害しない）
- **ライセンスが商用OK**（MIT / Apache-2.0 等）

## 背景

Recipeの仕組みは「core を薄く保ちつつ、重い機能は必要な時だけ読み込む」という設計思想に基づきます。

参考: Codex独立レビュー（2026-04-11）で指摘された **「コンテキスト汚染と保守分岐が本当のコスト」** という警告に対応し、`hyphen-project-starter` の core 肥大化を防ぐための分離機構として導入しました。
