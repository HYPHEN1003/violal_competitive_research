---
name: verification-loop
description: Claude Codeセッションの包括的な検証サイクル。ビルド・型・Lint・テスト・セキュリティ・diffの6フェーズを通して「動くことを証明」する。「検証」「verify」「検証ループ」「PR前チェック」「quality gate」と言われた時に使用。
origin: ECC (affaan-m/everything-claude-code, MIT)
---

# Verification Loop — 検証ループ

「動くことを証明」してからタスク完了とする HYPHEN の原則を、機械的に再現可能な6フェーズに落とし込んだスキル。

## 哲学

**"PASS" と宣言する前に、すべての検証を通過していなければならない。**

- 型チェックやテストは「コードが正しい」ことを証明するが、**「機能が正しい」ことまでは証明しない**
- このスキルは両方の層をカバーする: 静的検証（ビルド・型・Lint）と動的検証（テスト）+ セキュリティ + diff レビュー
- 問題があれば **STOP して修正** — 先に進まない

## When to Use

- 機能実装やリファクタ完了後
- PR作成前（pre-pr-review と併用推奨）
- 大規模な変更後の品質ゲート
- `quality-gate` リマインドが出た時

## 6フェーズの検証

### Phase 1: Build Verification

```bash
cd src
npm run build 2>&1 | tail -30
```

**失敗時**: STOP。ビルドが通らないコードは他のフェーズの意味がない。エラー内容を `build-error-resolver` agent に渡して修正。

### Phase 2: Type Check

```bash
cd src
npx tsc --noEmit 2>&1 | head -30
```

TypeScript 厳密設定で全エラーを報告。`any` の増加や `@ts-ignore` の濫用は **critical な警告サイン**。

### Phase 3: Lint Check

```bash
cd src
npm run lint 2>&1 | head -30
```

HYPHEN 標準の ESLint flat config。フックで auto-lint が走っているはずだが、明示的に全体を走らせて見落としを潰す。

### Phase 4: Test Suite

```bash
# ユニットテスト (Vitest)
cd src
npm run test:run 2>&1 | tail -50

# E2Eテスト (Playwright)
npm run test:e2e 2>&1 | tail -30
```

**報告項目**:
- Total tests: X
- Passed: X / Failed: X
- Coverage: X%（80% 以上が HYPHEN 基準）

### Phase 5: Security Scan

```bash
# シークレット検出（フックの detect-secret-leak.sh と同じ観点）
grep -rEn "sk-|sk_live_|sk_test_|xoxb-|ghp_|hf_|AKIA|anthropic-|sk-ant-" \
  --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" \
  --exclude-dir="node_modules" --exclude-dir=".next" src/ 2>/dev/null | head -10

# console.log 残存チェック
grep -rn "console\.log" --include="*.ts" --include="*.tsx" src/ 2>/dev/null | head -10

# Supabase RLS 未適用マイグレーション検出
grep -L "ENABLE ROW LEVEL SECURITY" src/supabase/migrations/*.sql 2>/dev/null | head -10
```

**重要**: Supabase のマイグレーションで RLS 未有効化は HYPHEN では **critical** 扱い。必ず修正。

### Phase 6: Diff Review

```bash
git diff --stat
git diff HEAD~1 --name-only
```

変更ファイルごとに以下を確認：
- 意図しない変更がないか
- エラーハンドリングの欠落
- エッジケースの考慮漏れ
- 不要な `any` や `as` の混入

---

## 出力フォーマット

全フェーズ実行後、以下の形式でレポートを出力：

```
VERIFICATION REPORT
==================
Build:     [PASS/FAIL]
Types:     [PASS/FAIL] (X errors)
Lint:      [PASS/FAIL] (X warnings)
Tests:     [PASS/FAIL] (unit: X/Y, e2e: X/Y, coverage: Z%)
Security:  [PASS/FAIL] (X issues)
Diff:      [X files changed]

Overall:   [READY / NOT READY] for PR

Issues to Fix:
1. ...
2. ...

Recommended Actions:
- build-error-resolver: ...
- silent-failure-hunter: ...
- database-reviewer: ...
```

---

## Continuous Mode（長時間セッション）

15分ごと、または以下のタイミングで定期実行：

- 関数・コンポーネント完成後
- サブタスク完了時
- 次のサブタスクに移る前

HYPHEN では `/verify` 相当の明示的な検証を、セッション内で **最低3回** 実行することを推奨。

---

## HYPHEN既存ツールとの連携

| ツール | 役割 | verification-loop との関係 |
|--------|------|-------------------------|
| PostToolUse hooks（auto-format, auto-lint） | 即時チェック | 書きながら修正 |
| `detect-secret-leak.sh` hook | シークレット漏洩ブロック | Phase 5 の自動版 |
| `build-error-resolver` agent | ビルドエラー解決 | Phase 1 の失敗時に呼ぶ |
| `silent-failure-hunter` agent | サイレント失敗検出 | Phase 6 の深掘り |
| `database-reviewer` agent | Supabase/RLS レビュー | Phase 5 の深掘り |
| `pre-pr-review` skill | MCO 3AIレビュー | verification-loop 通過後に実行 |

---

## 失敗時の対応フロー

```
検証失敗
  ↓
STOP — 先に進まない
  ↓
エラー分類
  ├── ビルド/型エラー → build-error-resolver agent
  ├── テスト失敗 → e2e-runner agent (E2E) or 手動修正（Unit）
  ├── Lint警告 → auto-lint hook にお任せ or 手動
  ├── セキュリティ → silent-failure-hunter or database-reviewer
  └── Diff異常 → 差分を見直して意図と一致するか確認
  ↓
再検証（全フェーズ再実行）
  ↓
PASS → pre-pr-review 実行 → PR作成
```

---

## Origin

本スキルは [Everything Claude Code](https://github.com/affaan-m/everything-claude-code)（MIT、150k+ stars）の `verification-loop` スキルを HYPHEN の技術スタック（Next.js 16 / Vitest / Playwright / Supabase）に適応したもの。

Codex 独立レビュー（2026-04-11）で「eccで最優先すべきスキル」として推奨された `verification-loop` / `eval-harness` / AgentShield 安全運用思想のうちの1つ。
