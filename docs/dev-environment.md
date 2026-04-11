# 開発環境セットアップ

`hyphen-project-starter` を快適に使うための推奨開発環境。

> **任意**: このドキュメントは推奨設定のカタログです。好みに応じて取捨選択してください。

## 推奨ターミナル: Ghostty

[Ghostty](https://ghostty.org) — @mitchellh (HashiCorp 共同創業者) 作の高速ターミナル。macOS / Linux 対応。

### なぜ Ghostty か

- **AIスケール出力に耐える**: VSCode や iTerm2 の内蔵ターミナルは長い Claude Code セッションで不安定になることがある
- **GPU レンダリング**: 大量のテキスト出力でも高速
- **コミュニティドリブン**: HashiCorp 共同創業者が主導、長期メンテナンスの信頼性

### インストール

```bash
# macOS
brew install --cask ghostty

# または公式サイトからダウンロード
# https://ghostty.org
```

### 設定ファイル

`~/.config/ghostty/config` に配置：

```
# フォント
font-family = JetBrains Mono
font-size = 14

# テーマ
theme = tokyonight-storm

# ウィンドウ
window-padding-x = 12
window-padding-y = 12
window-decoration = true

# パネル操作（SANDキーバインド対応）
keybind = cmd+d=new_split:right
keybind = cmd+shift+d=new_split:down
keybind = cmd+alt+left=goto_split:left
keybind = cmd+alt+right=goto_split:right
keybind = cmd+alt+up=goto_split:up
keybind = cmd+alt+down=goto_split:down
keybind = cmd+shift+e=equalize_splits
keybind = cmd+shift+f=toggle_split_zoom
```

---

## パネル管理: SAND キーバインド

Ghostty のパネル操作を **覚えやすい4文字の頭文字** に整理した運用規約。

### SAND = 4つのカテゴリ

| 文字 | 意味 | 操作 |
|------|------|------|
| **S** | **S**plit | パネル分割 |
| **A** | **A**cross | タブ間移動 |
| **N** | **N**avigate | 分割パネル間移動 |
| **D** | **D**estroy | パネル・タブを閉じる |

### キーバインド一覧

#### S - Split（分割）
```
Cmd + D          → 右に分割（垂直）
Cmd + Shift + D  → 下に分割（水平）
```

#### A - Across（タブ横断）
```
Cmd + T                 → 新しいタブ
Cmd + Shift + ← / →    → タブ間移動
```

#### N - Navigate（パネル間移動）
```
Cmd + Alt + ↑/↓/←/→   → 各方向のパネルにフォーカス
Cmd + Shift + E         → 全パネル均等化
Cmd + Shift + F         → パネルズーム（再押下で解除）
```

#### D - Destroy（閉じる）
```
Cmd + W  → 現在のパネル / タブを閉じる
```

### 覚え方のコツ

> 付箋に **SAND** と書いてディスプレイの横に貼る。
> 1週間見続けるとキーバインドが体に入る。

忘れたら `Cmd + Shift + P` でコマンドパレットから全コマンドを検索可能。

---

## 推奨ツールセット

Claude Code と組み合わせると威力を発揮するCLIツール群。

### lazygit — Git TUI

Claude Code が作るコミット・ディフをリアルタイム監視できる。

```bash
brew install lazygit
lazygit
```

**役割**: Claude Code がコードを書いている間、別パネルで `lazygit` を開いて変更を即座に確認。

### yazi — ファイルブラウザ TUI

ファイルツリーをキーボードで高速に行き来できる。

```bash
brew install yazi
yazi
```

**役割**: プロジェクトのファイル構造を把握する時、AIエージェントとは別パネルで使う。

### Git Worktrees — 並列エージェント運用

1つのリポジトリで **複数のブランチを同時に作業** できる Git 標準機能。Claude Code を複数インスタンス走らせる時に必須。

```bash
# 新しい worktree を作成
git worktree add ../myproject-feature-a feat/feature-a

# worktree の一覧
git worktree list

# 不要になった worktree を削除
git worktree remove ../myproject-feature-a
```

**役割**: 複数の機能開発を同時進行する時、Claude Code の独立インスタンスを各 worktree に割り当てる。

---

## 推奨ワークフローレイアウト

### 最小構成（1 Claude Code）

```
┌─────────────┬─────────────┐
│             │   lazygit   │
│  Claude     ├─────────────┤
│  Code       │    yazi     │
│             │             │
└─────────────┴─────────────┘
```

1. 左: Claude Code（メイン作業）
2. 右上: lazygit（変更監視）
3. 右下: yazi（ファイル検索）

### マルチエージェント構成（3 Claude Code）

```
┌──────────┬──────────┬─────────┐
│ Claude   │ Claude   │ lazygit │
│ worktree1│ worktree2├─────────┤
├──────────┼──────────┤  yazi   │
│ Claude   │          │         │
│ worktree3│          │         │
└──────────┴──────────┴─────────┘
```

それぞれのClaude Codeは独立したGit worktreeで動く → コンフリクトなしで3機能を並列開発。

### パネル操作のコツ

- **レイアウトが崩れたら** `Cmd + Shift + E` で全パネル均等化
- **特定パネルに集中したい時** `Cmd + Shift + F` でズーム
- **コンテキストを失わない** — 各Claude Codeは独立したセッションなのでメモリ汚染しない

---

## Claude Code 監視ツール（任意）

### cc-lens — ローカル分析ダッシュボード

[cc-lens](https://github.com/Arindam200/cc-lens) — `~/.claude/` を読んでClaude Codeのトークン使用量・コスト・セッションを可視化するダッシュボード。

```bash
# インストール不要、npx で即起動
npx cc-lens
```

> ⚠️ **注意**: cc-lens は 2026-04-11 時点で **ライセンス未明示** です。
> 内部ツールとしての使用は OK ですが、**HYPHEN プロダクトへの組み込みや再配布は避けてください**。
> ライセンスが追加されるまでは「参考実装」扱いが安全です。

---

## まとめ：推奨セットアップ

### 必須
- **Ghostty** + SAND キーバインド設定
- **Git Worktrees** の使い方を覚える

### 強く推奨
- **lazygit**: 変更監視
- **yazi**: ファイル検索

### 任意
- **cc-lens**: Claude Code 使用状況の可視化（ライセンス注意）

このセットアップにより、**1エージェント → 3エージェント並列** へのスケールをターミナルから出ることなく実現できます。
