# document-ingest セットアップ

## markitdown（標準入口）

### 方法1: MCP 統合（推奨）

Claude Code から即使える形で統合。ローカル限定で安全運用。

```bash
# markitdown-mcp をClaude Codeに追加
claude mcp add markitdown \
  --env BIND_HOST=127.0.0.1 \
  -- uvx markitdown-mcp
```

> 公式警告: `BIND_HOST=0.0.0.0` にしない。必ず localhost 限定で運用すること。

### 方法2: Python CLI

```bash
# 仮想環境を作成
python -m venv .venv
source .venv/bin/activate

# インストール
pip install 'markitdown[all]'

# 変換
markitdown input.pdf > output.md
markitdown presentation.pptx > output.md
markitdown audio.mp3 > output.md
```

### 対応ファイル形式

- PDF / Word / Excel / PowerPoint
- 画像（EXIF + OCR）
- 音声（ASR）
- HTML / CSV / JSON / XML / ZIP
- YouTube URL / EPub

---

## opendataloader-pdf（PDF特化層）

### 前提条件

Java 11+ が必要：

```bash
# macOS
brew install --cask temurin

# 検証
java -version
```

### Python SDK

```bash
pip install -U opendataloader-pdf
```

使用例：

```python
import opendataloader_pdf

opendataloader_pdf.convert(
    input_path=["contract.pdf", "manual.pdf"],
    output_dir="output/",
    format="markdown,json"  # bounding box付きJSON
)
```

> 注意: `convert()` ごとにJVMプロセスが起動するため、**ファイルはバッチでまとめて渡す**こと。

### Node.js SDK

```bash
npm install @opendataloader/pdf
```

### ハイブリッドモード（AI活用）

複雑な表・スキャンPDF・LaTeX 数式・チャート説明が必要な場合：

```python
opendataloader_pdf.convert(
    input_path="complex.pdf",
    output_dir="output/",
    hybrid=True,  # 複雑ページを AI バックエンドに委譲
    api_key="YOUR_API_KEY"
)
```

---

## 動作確認

```bash
# markitdown 動作確認
echo "hello" > test.txt && markitdown test.txt

# opendataloader-pdf 動作確認
python -c "import opendataloader_pdf; print(opendataloader_pdf.__version__)"
```

## トラブルシュート

| 症状 | 原因 | 対処 |
|------|------|------|
| `java not found` | Java未インストール | `brew install --cask temurin` |
| MCPが起動しない | BIND_HOST未設定 | `BIND_HOST=127.0.0.1` を環境変数に追加 |
| PDFの表が崩れる | markitdown標準では精度不足 | opendataloader-pdf の `hybrid=True` に切替 |
| スキャンPDFが読めない | OCR未有効化 | opendataloader-pdf の hybrid mode を使用（OCR内蔵） |
