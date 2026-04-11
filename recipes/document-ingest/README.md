# Recipe: document-ingest

クライアント資料（PDF / Word / Excel / PPT / 画像 / 音声 等）を **Markdown や構造化データに変換** するためのレシピ。

## 目的

プロジェクトに持ち込まれる多様なドキュメントを、AI（Claude / Codex 等）が処理できる形式に変換する統一パイプラインを提供します。

## 2層構成

本レシピは**標準入口**と**PDF特化層**の2つのツールを組み合わせます：

| 層 | ツール | 守備範囲 | 出力 |
|----|--------|---------|------|
| **標準入口** | [markitdown](https://github.com/microsoft/markitdown) (Microsoft) | PDF / Word / Excel / PPT / 画像 / 音声 / HTML / YouTube / EPub | Markdown |
| **PDF特化層** | [opendataloader-pdf](https://github.com/opendataloader-project/opendataloader-pdf) | 複雑な表・スキャンPDF・座標付き引用が必要なPDF | Markdown / JSON (bounding box付き) / HTML |

### 使い分けの推奨

- **まずは markitdown** — 幅広いファイル対応、MCP統合済みでClaude Codeから即使える
- **PDFで精度・表・座標が必要なら opendataloader-pdf** — ベンチマーク #1（0.907）、表精度0.928、OCR内蔵
- **両方使うケース** — markitdown を Office/HTML/音声の入口、opendataloader-pdf を複雑PDFに特化投入

## 想定ユースケース

- **保険営業ポータル**: 保険約款・規約PDFの取り込み
- **歯科技工**: 発注仕様書・技工指示書の構造化
- **造船**: 作業マニュアル・安全規程の検索可能化
- **マーケティング**: 業界レポートPDFの要約・引用抽出

## 重要な注意点

### markitdown MCPの制約

markitdown MCP版は `convert_to_markdown(uri)` でローカルファイル読取が可能ですが、**公式READMEがlocalhost以外にbindしないよう警告**しています。

- **推奨**: ローカル限定オプションとして設置
- **避ける**: 公開サーバへの無防備な公開

### opendataloader-pdf の依存

**Java 11+ が必須** です。Node.js中心のHYPHEN環境では追加導入が必要。

- インストール: `brew install --cask temurin` (macOS) or Adoptium から
- 検証: `java -version`

### ライセンス
- markitdown: MIT（商用OK）
- opendataloader-pdf: **Apache 2.0**（商用OK、帰属表示必須）

## セットアップ

[SETUP.md](./SETUP.md) を参照してください。

## 関連Recipe

- [document-rag](../document-rag/) — 変換後のドキュメントに対する推論ベース検索
- [voice-asr](../voice-asr/) — markitdownの音声対応を超える長時間音声処理が必要な場合
