# HYPHEN Project Template

HYPHEN CO., LTD. のクライアントプロジェクト用テンプレートリポジトリ。
Claude Code + Skills + Agents の構成が即座に使える状態で整備されています。

## 使い方

### 1. GitHubで「Use this template」をクリック
- Repository name: クライアントのプロジェクト名（例: `genmyoji`, `yokota-dental`）
- Private を選択
- 「Create repository」

### 2. ローカルにクローン
```bash
git clone https://github.com/HYPHEN1003/[プロジェクト名].git
cd [プロジェクト名]
```

### 3. CLAUDE.md をカスタマイズ
CLAUDE.md内の `[PLACEHOLDER]` をすべてプロジェクト固有の情報に置き換える。
検索: `\[` で全プレースホルダーを確認できる。

### 4. Claude Codeで作業開始
```bash
claude
```
CLAUDE.mdが自動で読み込まれ、Skills・Agentsが使える状態になる。

## 含まれるもの

| カテゴリ | 内容 |
|---------|------|
| CLAUDE.md | プロジェクト設定テンプレート（技術スタック・デザイントークン・ルール） |
| Skills（14個） | デザイン系9個 + 実装系5個 |
| Agents（3個） | designer / ux-writer / prompt-engineer |
| docs/ | 提案書・設計書テンプレート |
| tasks/ | タスク管理・教訓記録 |
| prompts/ | AIプロンプト設計テンプレート |

## カスタマイズのポイント

- **技術スタックの変更**: CLAUDE.mdの「技術スタック」と「自作禁止リスト」を案件に合わせて調整
- **デザイントークンの変更**: CLAUDE.mdの「デザイン方針」をクライアントのブランドに合わせる
- **Skillsの追加**: `.claude/skills/` に案件固有のSkillを追加
- **Agentsの調整**: `.claude/agents/` の各エージェントをプロジェクトに最適化

## ディレクトリ構造

```
├── CLAUDE.md          ← プロジェクトの脳（Claude Codeが自動読み込み）
├── .claude/
│   ├── skills/        ← タスクの手順書（/コマンド名 で呼び出し）
│   └── agents/        ← 専門家の人格定義
├── docs/              ← 設計書・提案資料
├── prompts/           ← AIプロンプト設計
├── design/            ← デザイン関連リンク・メモ
├── tasks/             ← タスク管理・教訓記録
└── src/               ← ソースコード
```
