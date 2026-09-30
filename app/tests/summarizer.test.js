// Integration test — needs a model in app/models/ (or MODEL_ID pointing to the Hub).
// Skips automatically when no model is available.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const modelsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "models");
const modelId = process.env.MODEL_ID || "dialogue-summarizer-onnx";
const hasModel = modelId.includes("/") || fs.existsSync(path.join(modelsDir, modelId));

test("summarizes a short dialogue", { skip: !hasModel && "no model found in app/models/" }, async () => {
  const { summarize } = await import("../src/summarizer.js");
  const dialogue = [
    "#Person1#: Did you finish the report for the client?",
    "#Person2#: Almost. I need the sales numbers from Nadia first.",
    "#Person1#: She is on leave today. Ask Karim, he has a copy.",
    "#Person2#: Great, I'll call him now and send the report by evening.",
  ].join("\n");

  const { summary, ms } = await summarize(dialogue, { maxTokens: 64 });
  assert.ok(summary.length > 10, "summary should not be empty");
  assert.ok(ms > 0);
});
