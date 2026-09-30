// Loads the fine-tuned dialogue summarization model (ONNX) with Transformers.js and summarizes text.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pipeline, env } from "@huggingface/transformers";

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// MODEL_ID can be either
//   - a folder name inside app/models/   (e.g. "dialogue-summarizer-onnx", downloaded from Colab), or
//   - a Hugging Face Hub repo id          (e.g. "your-username/dialogue-summarizer-onnx").
export const MODEL_ID = process.env.MODEL_ID || "dialogue-summarizer-onnx";
export const DTYPE = process.env.DTYPE || "q8";          // "q8" = quantized (small, fast), "fp32" = full precision
const PREFIX = process.env.INPUT_PREFIX ?? "summarize: "; // must match the prefix used during fine-tuning

env.localModelPath = path.join(appDir, "models");
env.allowLocalModels = true;
if (process.env.MODEL_CACHE_DIR) env.cacheDir = process.env.MODEL_CACHE_DIR; // where Hub downloads are cached

let summarizerPromise = null;

export function loadSummarizer() {
  if (!summarizerPromise) {
    summarizerPromise = pipeline("summarization", MODEL_ID, { dtype: DTYPE }).catch((err) => {
      summarizerPromise = null; // allow a retry on the next request
      throw new Error(
        `Could not load model "${MODEL_ID}". Put the exported folder in app/models/ ` +
          `or set MODEL_ID to your Hugging Face repo. Original error: ${err.message}`,
      );
    });
  }
  return summarizerPromise;
}

export async function summarize(text, { maxTokens = 96 } = {}) {
  const summarizer = await loadSummarizer();
  const started = performance.now();
  const [result] = await summarizer(PREFIX + text, { max_new_tokens: maxTokens });
  return {
    summary: result.summary_text.trim(),
    ms: Math.round(performance.now() - started),
  };
}
