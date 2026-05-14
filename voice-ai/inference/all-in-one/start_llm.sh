#!/usr/bin/env bash
set -euo pipefail

model="${LLM_MODEL:-${MODEL:-Qwen/Qwen3-14B}}"
served_model_name="${LLM_SERVED_MODEL_NAME:-$model}"
host="${VLLM_HOST:-0.0.0.0}"
port="${VLLM_PORT:-8000}"
token="${API_TOKEN:-${VLLM_API_KEY:-}}"

if [[ -n "${VLLM_CUDA_VISIBLE_DEVICES:-}" ]]; then
  export CUDA_VISIBLE_DEVICES="${VLLM_CUDA_VISIBLE_DEVICES}"
fi

if [[ -n "${HUGGING_FACE_HUB_TOKEN:-}" && -z "${HF_TOKEN:-}" ]]; then
  export HF_TOKEN="${HUGGING_FACE_HUB_TOKEN}"
fi

args=(
  "serve" "$model"
  "--host" "$host"
  "--port" "$port"
  "--served-model-name" "$served_model_name"
)

if [[ -n "${token}" ]]; then
  args+=("--api-key" "$token")
fi

if [[ -n "${GPU_MEMORY_UTILIZATION:-}" ]]; then
  args+=("--gpu-memory-utilization" "${GPU_MEMORY_UTILIZATION}")
fi

if [[ -n "${TENSOR_PARALLEL_SIZE:-}" ]]; then
  args+=("--tensor-parallel-size" "${TENSOR_PARALLEL_SIZE}")
fi

if [[ -n "${PIPELINE_PARALLEL_SIZE:-}" ]]; then
  args+=("--pipeline-parallel-size" "${PIPELINE_PARALLEL_SIZE}")
fi

if [[ -n "${DTYPE:-}" ]]; then
  args+=("--dtype" "${DTYPE}")
fi

if [[ -n "${QUANTIZATION:-}" ]]; then
  args+=("--quantization" "${QUANTIZATION}")
fi

if [[ -n "${MAX_MODEL_LEN:-}" ]]; then
  args+=("--max-model-len" "${MAX_MODEL_LEN}")
fi

if [[ -n "${MAX_NUM_SEQS:-}" ]]; then
  args+=("--max-num-seqs" "${MAX_NUM_SEQS}")
fi

if [[ -n "${MAX_NUM_BATCHED_TOKENS:-}" ]]; then
  args+=("--max-num-batched-tokens" "${MAX_NUM_BATCHED_TOKENS}")
fi

if [[ -n "${VLLM_DOWNLOAD_DIR:-}" ]]; then
  args+=("--download-dir" "${VLLM_DOWNLOAD_DIR}")
fi

if [[ "${TRUST_REMOTE_CODE:-0}" == "1" || "${TRUST_REMOTE_CODE:-}" == "true" ]]; then
  args+=("--trust-remote-code")
fi

if [[ -n "${VLLM_EXTRA_ARGS:-}" ]]; then
  # shellcheck disable=SC2086
  exec vllm "${args[@]}" ${VLLM_EXTRA_ARGS}
fi

exec vllm "${args[@]}"
