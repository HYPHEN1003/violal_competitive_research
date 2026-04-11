# document-rag セットアップ

## PoC段階: MCP 統合（推奨：まず検証）

### 1. Claude Code に PageIndex MCP を追加

```bash
# PageIndex 公式MCP（Vectify AIホスト）を接続
claude mcp add pageindex \
  --env PAGEINDEX_API_KEY=your_key_here \
  -- npx pageindex-mcp
```

APIキーは [https://pageindex.ai/developer](https://pageindex.ai/developer) で取得。

### 2. 動作確認

Claude Code から：
```
pageindex で contract.pdf を読み込んで、解約条項について教えて
```

### 3. PoC評価チェックリスト

- [ ] 検索精度は業務要件を満たすか
- [ ] 応答時間は許容範囲か
- [ ] データ送信先（Vectify クラウド）が契約上許容されるか
- [ ] LLM API費用は予算内か
- [ ] 案件で継続使用が見込まれるか

→ すべて Yes なら **本番段階**（self-host）へ移行

---

## 本番段階: self-host（OSS）

### 前提条件

- Python 3.10+
- LLM APIキー（OpenAI / Anthropic / LiteLLM経由で任意のプロバイダ）

### インストール

```bash
# クローン
git clone https://github.com/VectifyAI/PageIndex.git
cd PageIndex

# 仮想環境
python -m venv .venv
source .venv/bin/activate

# 依存インストール
pip install -r requirements.txt
```

### 環境変数

```bash
# .env ファイルを作成
cat > .env <<EOF
OPENAI_API_KEY=your_openai_key_here
# または
ANTHROPIC_API_KEY=your_anthropic_key_here
EOF
```

### PDFからツリー生成

```bash
python run_pageindex.py --pdf_path /path/to/document.pdf
```

#### オプションパラメータ

```bash
python run_pageindex.py \
  --pdf_path document.pdf \
  --model gpt-4o-2024-11-20 \
  --toc-check-pages 20 \
  --max-pages-per-node 10 \
  --max-tokens-per-node 20000
```

### Agentic Vectorless RAG の例

```bash
pip install openai-agents

# examples/agentic_vectorless_rag_demo.py を実行
python examples/agentic_vectorless_rag_demo.py
```

### Markdown対応

PDFではなくMarkdownから階層ツリーを作る場合：

```bash
python run_pageindex.py --md_path /path/to/document.md
```

> 注意: MarkdownのセクションはH1/H2/H3（#/##/###）の階層で認識される。
> PDFからMarkdownに変換する場合は、階層を保持する変換ツール（opendataloader-pdf等）を使うこと。

---

## 複雑PDFへの対応（document-ingest との連携）

スキャンPDF・複雑な表・多段組みPDFには、前段で [document-ingest](../document-ingest/) の opendataloader-pdf を使う：

```
PDF (複雑)
  ↓ opendataloader-pdf（構造抽出 + OCR）
Markdown（階層保持）
  ↓ PageIndex（階層ツリー化）
検索可能な階層index
```

---

## トラブルシュート

| 症状 | 原因 | 対処 |
|------|------|------|
| MCPが起動しない | APIキー未設定 | `PAGEINDEX_API_KEY` を環境変数に設定 |
| LLM呼び出しが多すぎる | 高精度モード | `--max-pages-per-node` を増やして呼び出し削減 |
| ツリーが浅い | TOC検出失敗 | `--toc-check-pages` を増やす |
| 検索結果が不正確 | 文書構造が複雑 | document-ingest の opendataloader-pdf で前処理 |
