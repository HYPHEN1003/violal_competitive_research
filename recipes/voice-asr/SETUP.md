# voice-asr セットアップ

> **前提**: GPU（24GB VRAM以上推奨）と Python 3.10+ が必要です。

## 1. 環境準備

```bash
# 仮想環境作成
python -m venv .venv
source .venv/bin/activate

# Transformers + vLLM インストール
pip install transformers>=5.3.0
pip install vllm
```

## 2. モデルダウンロード

```bash
# Hugging Face CLI でログイン
huggingface-cli login

# モデル取得（約17.3GB）
huggingface-cli download microsoft/VibeVoice-ASR
```

## 3. 基本使用例（Transformers）

```python
from transformers import AutoProcessor, AutoModelForSpeechSeq2Seq
import torch

processor = AutoProcessor.from_pretrained("microsoft/VibeVoice-ASR")
model = AutoModelForSpeechSeq2Seq.from_pretrained(
    "microsoft/VibeVoice-ASR",
    torch_dtype=torch.bfloat16,
    device_map="auto"
)

# 60分の音声を単発処理
inputs = processor(audio_file="meeting_60min.wav", return_tensors="pt")
outputs = model.generate(**inputs)
transcript = processor.batch_decode(outputs, skip_special_tokens=True)
```

出力は Who（話者）/ When（タイムスタンプ）/ What（内容）の構造化形式。

## 4. vLLM 推論（高速化）

```bash
# vLLMサーバー起動
vllm serve microsoft/VibeVoice-ASR \
  --tensor-parallel-size 2 \
  --max-model-len 65536
```

> メモリ不足時は `--tp 2` でテンソル並列（2GPU必要）

## 5. カスタムホットワード

固有名詞・専門用語を事前登録して認識精度を上げる：

```python
hotwords = ["HYPHEN", "Supabase", "Next.js", "InsureVault"]
outputs = model.generate(
    **inputs,
    prompt_ids=processor.tokenizer.encode(",".join(hotwords))
)
```

---

## クラウド選択肢（GPU用意したくない場合）

| サービス | GPU | 料金目安 |
|---------|-----|---------|
| RunPod | A100 40GB | $1.5/h |
| AWS g5.xlarge | A10G 24GB | $1.0/h |
| Azure NC24ads A100 | A100 80GB | $3.6/h |
| Modal Labs | A100 | 従量課金 |

**推奨**: Modal Labs — サーバーレスでコールド起動、アイドル時0円。

## Modal Labs サンプル

```python
# modal_vibevoice.py
import modal

app = modal.App("vibevoice-asr")

@app.function(
    gpu="A100",
    image=modal.Image.debian_slim().pip_install("transformers>=5.3.0", "torch"),
    timeout=600
)
def transcribe(audio_bytes: bytes) -> dict:
    from transformers import AutoProcessor, AutoModelForSpeechSeq2Seq
    import torch
    import io

    processor = AutoProcessor.from_pretrained("microsoft/VibeVoice-ASR")
    model = AutoModelForSpeechSeq2Seq.from_pretrained(
        "microsoft/VibeVoice-ASR",
        torch_dtype=torch.bfloat16,
        device_map="auto"
    )

    inputs = processor(audio_file=io.BytesIO(audio_bytes), return_tensors="pt")
    outputs = model.generate(**inputs)
    return {"transcript": processor.batch_decode(outputs, skip_special_tokens=True)}
```

デプロイ：
```bash
modal deploy modal_vibevoice.py
```

---

## starter への統合パターン

### パターンA: 外部マイクロサービス

```
Next.js (starter)
  ↓ POST /api/transcribe
外部 VibeVoice サーバ（Modal / Runpod 等）
  ↓ 結果返却
Next.js → DB保存
```

### パターンB: バッチジョブ

```
S3/Supabase Storage 音声アップロード
  ↓ Trigger
Lambda/Cloud Functions
  ↓ Modal 呼び出し
Supabase に文字起こし保存
```

---

## 代替案: markitdown で十分なケース

短い音声・話者分離不要なら、starter の core で既に対応可能：

```bash
# markitdown の音声対応を使う
pip install 'markitdown[all]'
markitdown short_audio.mp3
```

VibeVoice を導入する前に、以下を確認：
- [ ] 音声が10分以上ある
- [ ] 話者分離が必要
- [ ] GPUインフラを用意できる
- [ ] 法務が商用利用を承認している（⚠️ VibeVoice公式は商用未検証と明記）

**すべて Yes** でない場合は markitdown で十分。

---

## トラブルシュート

| 症状 | 原因 | 対処 |
|------|------|------|
| CUDA out of memory | VRAM不足 | `--tp 2` でテンソル並列 or bf16 量子化 |
| モデルDLが遅い | ネットワーク | `huggingface-cli` で事前DL |
| 日本語精度が低い | ホットワード未使用 | カスタムホットワードで固有名詞を登録 |
| 応答が遅い | 推論エンジン | vLLM に切替 |
