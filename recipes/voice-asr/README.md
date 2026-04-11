# Recipe: voice-asr (optional)

商談録音・取材音声・会議音声など、**長時間の音声**を高精度に文字起こしするレシピ。

> **Optional**: このレシピは **サーバーサイドオプション** です。GPU推論が必要で、core への組み込みは推奨しません。案件で音声処理が中心になる場合のみ導入してください。

## 目的

60分以上の連続音声を **単発パス** で文字起こしし、**話者分離 + タイムスタンプ + 内容** の構造化出力を得る。

## 採用技術: VibeVoice ASR (Microsoft)

[VibeVoice](https://github.com/microsoft/VibeVoice) — Microsoft 製のオープンソース音声AIファミリー。ICLR 2026 Oral 採択。

### 特徴

| 項目 | 内容 |
|------|------|
| **入力長** | 最大60分（64K token）単発処理、チャンク分割不要 |
| **出力構造** | Who（話者）/ When（タイムスタンプ）/ What（内容） |
| **言語** | 50+ 言語対応（日本語含む） |
| **カスタムホットワード** | 固有名詞・専門用語の認識強化 |
| **統合** | Hugging Face Transformers に統合済み、vLLM 推論対応 |
| **ライセンス** | MIT（商用OK） |

### 従来ASRとの比較

| 項目 | 従来ASR（Whisper等） | VibeVoice ASR |
|------|---------------------|---------------|
| 音声分割 | 30秒チャンク | 60分単発 |
| 文脈保持 | チャンク境界で喪失 | 全体を通して保持 |
| 話者追跡 | 別ツール必要 | 内蔵 |

## 想定ユースケース

- **商談録音 → 議事録** 自動生成
- **マーケティング取材音声 → 記事** 下書き
- **ポッドキャスト → 全文文字起こし**（[mkt-podcast-ops](https://github.com/HYPHEN1003/hyphen-marketing-skills) の強化）
- **カスタマーサポート通話分析**

## 重要な注意点・制約

### ⚠️ 商用利用の注意

VibeVoice の公式READMEに **「商用・実運用は追加検証なしでは非推奨」** との記載があります。

- **推奨**: 社内用・PoC・検証目的で使用
- **注意**: 本番のクライアント向けサービスに直接組み込む前に、法務・セキュリティ評価を実施
- **代替案**: 軽量用途なら markitdown の音声対応で十分

### GPU要件

- **ASRモデル**: 約 **17.3GB**
- **公式推奨**: vLLM 推論（メモリ不足時は `--tp 2` テンソル並列）
- **最小構成**: 24GB VRAM 以上のGPU推奨
- **クラウド選択肢**: AWS g5 / Azure NC / RunPod 等

### 代替の検討

以下の場合は VibeVoice ではなく **markitdown の音声対応** で十分：
- 短い音声（数分以内）
- 話者分離不要
- GPUを用意したくない

## 統合方針（サーバーサイドオプション）

starter の core には **組み込まない**。以下のいずれかの形式で導入：

1. **独立したマイクロサービス**: VibeVoice を動かすサーバを別建てし、starter アプリはHTTP経由で呼び出す
2. **バッチ処理ジョブ**: S3等の音声ファイルをトリガーにバッチ処理してMarkdown出力
3. **hyphen-marketing-skills の mkt-podcast-ops の optional dependency**: ポッドキャスト処理パイプラインの一部として導入

## セットアップ

[SETUP.md](./SETUP.md) を参照してください。

## 関連Recipe

- [document-ingest](../document-ingest/) — 軽量音声は markitdown で処理可能
- [hyphen-marketing-skills/mkt-podcast-ops](https://github.com/HYPHEN1003/hyphen-marketing-skills) — ポッドキャスト処理パイプライン
