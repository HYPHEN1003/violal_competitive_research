---
name: mlops-pipeline
description: "[OPTIONAL] ML自動再学習パイプライン設計。前提: Python環境。「MLOps」「再学習」「パイプライン」と言われた時に使用。"
---

# ML 自動再学習パイプライン

GitHub Actions で月次自動再学習を構築する。実質0円で運用可能。

## アーキテクチャ

```
GitHub Actions (cron: 毎月1日)
  ↓
データ取得 (Supabase → CSV)
  ↓
前処理 (Python)
  ↓
学習 (LightGBM / XGBoost / CatBoost)
  ↓
評価 (前月モデルとの比較)
  ↓
モデル保存 (GitHub Release or Supabase Storage)
  ↓
通知 (Slack / LINE)
```

## GitHub Actions ワークフロー雛形

```yaml
name: Monthly Model Retrain
on:
  schedule:
    - cron: '0 0 1 * *'  # 毎月1日 0:00 UTC
  workflow_dispatch:       # 手動実行も可能

jobs:
  retrain:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - name: Install dependencies
        run: pip install -r requirements-ml.txt
      - name: Fetch data
        run: python scripts/fetch_data.py
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
      - name: Train models
        run: python scripts/train.py
      - name: Evaluate
        run: python scripts/evaluate.py
      - name: Upload model
        if: success()
        run: python scripts/upload_model.py
```

## モデル比較フレームワーク

3モデルを同時学習し、最良モデルを採用:

| モデル | 特徴 | 適用場面 |
|--------|------|----------|
| **LightGBM** | 高速、メモリ効率良 | デフォルト選択 |
| **XGBoost** | 安定性高い | 精度重視 |
| **CatBoost** | カテゴリ変数に強い | カテゴリが多い場合 |

評価指標: RMSE, MAE, R2 スコア

## 精度監視

- 前月モデルとの精度比較（5%以上の劣化でアラート）
- 予測値と実績値のドリフト検出
- 特徴量の重要度変化追跡

## コスト見積もり
- GitHub Actions: 無料枠 2,000分/月で十分（学習は10-30分程度）
- Supabase Storage: 1GBまで無料
- **実質0円で運用可能**
