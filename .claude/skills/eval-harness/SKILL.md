---
name: eval-harness
description: Eval-Driven Development（EDD）のための形式的評価フレームワーク。pass@k / pass^k メトリクスでエージェント信頼性を測定、capability/regression eval を定義しPR前にリリース判定する。「eval」「EDD」「eval-driven」「pass@k」「リリースゲート」「能力評価」と言われた時に使用。
origin: ECC (affaan-m/everything-claude-code, MIT)
tools: Read, Write, Edit, Bash, Grep, Glob
---

# Eval Harness — 評価駆動開発

「コードが正しい」ことはテストで検証できる。しかし「エージェントの振る舞いが信頼できる」かは、eval（評価）で測る必要がある。

## 哲学: Eval-Driven Development (EDD)

> **Eval は AI開発におけるユニットテスト**

- **実装の前に**期待される振る舞いを定義する
- 開発中に継続的に eval を実行する
- 変更ごとに regression を追跡する
- 確率的な振る舞いには `pass@k` メトリクスで信頼性を測る

---

## When to Use

- EDD を開始する時（プロンプトやエージェントの信頼性を測る必要が出た時）
- Claude Code タスク完了の pass/fail 基準を定義する時
- pass@k メトリクスでエージェントの信頼性を計測する時
- プロンプト・エージェント変更の regression テストスイートを作る時
- モデルバージョン横断のベンチマーク時
- **リリースゲート**を設ける時（本番デプロイ前の最終確認）

---

## Eval の種類

### 1. Capability Eval（能力評価）

「このエージェントは X ができるか？」を問う。新機能追加時に使う。

```markdown
[CAPABILITY EVAL: feature-name]

Task: Claude が達成すべき具体的なタスクの説明

Success Criteria:
  - [ ] 基準 1
  - [ ] 基準 2
  - [ ] 基準 3

Expected Output: 期待される結果の記述
```

### 2. Regression Eval（退行テスト）

「既存の振る舞いが壊れていないか？」を問う。変更時に必ず実行。

```markdown
[REGRESSION EVAL: feature-name]

Baseline: commit SHA またはチェックポイント名

Tests:
  - existing-test-1: PASS/FAIL
  - existing-test-2: PASS/FAIL

Result: X/Y passed (previously Y/Y)
```

---

## Grader（評価者）の種類

### 1. Code Grader（決定論的）

```bash
# ファイルに期待するパターンが含まれているか
grep -q "export function handleAuth" src/auth.ts && echo "PASS" || echo "FAIL"

# テストが通るか
cd src && npm run test:run -- --run auth && echo "PASS" || echo "FAIL"

# ビルドが通るか
cd src && npm run build && echo "PASS" || echo "FAIL"
```

**推奨度: 最高**。確実・再現可能・高速。

### 2. Model Grader（LLM-as-judge）

オープンエンドな出力には Claude 自身に評価させる：

```markdown
[MODEL GRADER PROMPT]

以下のコード変更を評価してください:
1. 問題を解決しているか？
2. 構造は適切か？
3. エッジケースは処理されているか？
4. エラーハンドリングは適切か？

Score: 1-5（1=poor, 5=excellent）
Reasoning: [説明]
```

**推奨度: 中**。曖昧な品質評価に必要。ただしブレがあるので複数回実行して平均を取る。

### 3. Human Grader（人間による評価）

```markdown
[HUMAN REVIEW REQUIRED]

Change: 何が変わったか
Reason: なぜ人間レビューが必要か
Risk Level: LOW / MEDIUM / HIGH
```

**推奨度: セキュリティ・業界規制領域では必須**。歯科・保険・造船等の HYPHEN 案件では CL (Critical Legal) 領域に必ず人間ゲートを置く。

---

## メトリクス

### pass@k —「k回試行で少なくとも1回成功」

- `pass@1`: 初回成功率
- `pass@3`: 3回以内に成功する確率
- **HYPHEN 標準**: capability eval は `pass@3 >= 0.90`

### pass^k —「k回すべて成功」

- 高い信頼性基準
- `pass^3`: 3連続成功
- **HYPHEN 標準**: regression eval は `pass^3 = 1.00`（リリースクリティカル）

---

## Eval ワークフロー

### Step 1: Define（実装前）

```markdown
## EVAL DEFINITION: feature-xyz

### Capability Evals
1. 新規ユーザーアカウントを作成できる
2. メール形式を検証できる
3. パスワードを安全にハッシュ化できる

### Regression Evals
1. 既存ログインフローが動作する
2. セッション管理は変わらない
3. ログアウトフローは維持される

### Success Metrics
- Capability: pass@3 > 90%
- Regression: pass^3 = 100%
```

### Step 2: Implement

Eval を通すためのコードを書く。TDD と相性が良い（HYPHEN の `tdd` スキルと併用）。

### Step 3: Evaluate

```bash
# Capability eval を実行（各基準を個別にチェック）
# Regression eval を実行
cd src && npm run test:run -- --run existing
```

### Step 4: Report

```markdown
EVAL REPORT: feature-xyz
========================

Capability Evals:
  create-user:     PASS (pass@1)
  validate-email:  PASS (pass@2)
  hash-password:   PASS (pass@1)
  Overall:         3/3 passed

Regression Evals:
  login-flow:      PASS
  session-mgmt:    PASS
  logout-flow:     PASS
  Overall:         3/3 passed

Metrics:
  pass@1: 67% (2/3)
  pass@3: 100% (3/3)

Status: READY FOR REVIEW
```

---

## HYPHEN プロジェクトでの eval 保管

```
.claude/
  evals/
    <feature-name>.md       # Eval定義
    <feature-name>.log      # 実行履歴
    baseline.json           # Regression baseline
docs/
  releases/
    v4.3/
      eval-summary.md       # リリース時の eval スナップショット
```

Eval はコードと一緒にバージョン管理する。**Eval は first-class artifact**。

---

## Anti-Patterns（やってはいけないこと）

❌ **既知のeval例にプロンプトを過剰適合させる**
→ 本番でしか出ないケースを見逃す

❌ **ハッピーパスだけ測定する**
→ エラー・エッジケースが落ちる

❌ **pass rate を追い求めてコスト・レイテンシの drift を無視する**
→ 信頼性と引き換えに性能が劣化する

❌ **Flaky な grader をリリースゲートに置く**
→ 通ったり通らなかったりでゲートが機能しない

---

## HYPHEN既存スキルとの連携

| スキル/Agent | 役割 | eval-harness との関係 |
|-------------|------|---------------------|
| `tdd` skill | TDD実装 | Eval定義後の実装フェーズで使用 |
| `verification-loop` skill | 6フェーズ品質検証 | Code grader として Phase 1-5 を利用 |
| `pre-pr-review` skill | MCO 3AIレビュー | Model grader として活用可能 |
| `silent-failure-hunter` agent | エラーハンドリング検証 | Capability eval のエッジケース部分 |
| `database-reviewer` agent | Supabase/RLS検証 | Regression eval（セキュリティ退行）|

---

## Example: 歯科ダッシュボードの新機能追加

```markdown
## EVAL: add-patient-notes-feature

### Capability Evals
- [ ] 患者IDで notes を作成できる
- [ ] 権限がないユーザは notes を読めない（RLS）
- [ ] 画像添付が Supabase Storage に保存される
- [ ] 通知が Sentry に送信される

### Regression Evals
- [ ] 既存の患者一覧画面が動作する
- [ ] 予約機能が影響を受けない
- [ ] Row Level Security が既存テーブルで有効

### Metrics
- Capability: pass@3 >= 0.90
- Regression: pass^3 = 1.00

### Graders
- Code grader: playwright E2E でフロー全体検証
- Model grader: notes の UX を Claude に 1-5 で評価させる
- Human grader: 医療情報を扱うため最終チェックは人間（HIGH risk）
```

---

## Origin

本スキルは [Everything Claude Code](https://github.com/affaan-m/everything-claude-code)（MIT）の `eval-harness` スキルを HYPHEN の技術スタック・案件特性（歯科・保険・造船等の業界規制領域を含む）に適応したもの。

Codex 独立レビュー（2026-04-11）で「eccで最優先すべきスキル」として `verification-loop` とともに推奨された（continuous-learning は独自作法の汚染リスクがあるため採用見送り）。
