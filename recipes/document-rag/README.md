# Recipe: document-rag

長文業務文書に対する **Vectorless RAG**（ベクトルDB不要、階層ツリー + LLM推論検索）を実現するレシピ。

## 目的

保険約款・作業マニュアル・規制文書・契約書など、**長い専門文書** に対する高精度な検索を、ベクトルDBやチャンキングなしで実現する。

## 採用技術: PageIndex

[PageIndex](https://github.com/VectifyAI/PageIndex) — Vectify AI 製の Vectorless RAG フレームワーク。

### なぜ Vectorless か

| 項目 | 従来のベクトルRAG | PageIndex |
|------|------------------|-----------|
| 検索方式 | 類似度（similarity） | 推論（reasoning） |
| インデックス | ベクトルDB + chunking | 階層ツリー（目次） |
| 長文対応 | チャンク境界で文脈ロス | セクション全体を保持 |
| 説明可能性 | 不透明（"vibe retrieval"） | 検索理由が追跡可能 |
| FinanceBench精度 | 低い | **98.7% SOTA** |

### 仕組み

1. PDF/文書 → **階層ツリーindex** 生成（目次 + セクション + 要約）
2. LLMが**ツリーを推論で探索**して該当セクションを特定
3. 引用は **ページ番号・セクションID 付き**で返却

## 想定ユースケース

- **InsureVault**（保険営業ポータル）: 保険約款の質問応答
- **shimabara-dock-app**（造船）: 作業マニュアル・安全規程の検索
- **sugishine-dental-system**（歯科技工）: 発注仕様書の検索
- **marketing-results-and-forecast**: 長い分析レポートのナビゲーション

## 2段階統合戦略

Codexレビュー（2026-04-11）に基づき、段階的な導入を推奨：

| 段階 | 形式 | 用途 |
|------|------|------|
| **PoC** | MCP 経由（公式サーバ） | 検証・案件適合性の評価 |
| **本番** | self-host（OSS） | データ境界・監査性・ベンダーロック回避 |

### PoC → 本番の判断基準

以下を満たしたら self-host に移行：
- 案件で継続的に使うことが確定
- データが社外送信を許容しない性質（機微情報）
- 応答時間・精度の要件が明確

## 重要な注意点

### データ送信先の確認

PageIndex の各モード（OSS / MCP / Enterprise）で**データの流れが異なる**：

- **OSS自ホスト**: LLM API（OpenAI/Anthropic/ローカルLLM）にのみ送信
- **MCP**: Vectify AI のクラウドサービス経由（外部送信）
- **Enterprise**: オンプレ / プライベートクラウド

**契約書・保険約款・医療情報** を扱う場合は self-host 一択。

### LLM API費用

推論ベース検索のため、従来のベクトル検索よりLLM呼び出し回数が多い。
- 1クエリあたり複数のツリー探索呼び出しが発生
- 高精度 vs コストのトレードオフ

### ライセンス

MIT（商用OK）

## セットアップ

[SETUP.md](./SETUP.md) を参照してください。

## 関連Recipe

- [document-ingest](../document-ingest/) — PageIndexの前段として、PDFの構造化（特に複雑PDFは opendataloader-pdf 経由で前処理）
