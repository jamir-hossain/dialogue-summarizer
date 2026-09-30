// Express server: serves the web UI and a JSON API for summarization.
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { summarize, loadSummarizer, MODEL_ID, DTYPE } from "./summarizer.js";
import { validateSummarizeRequest } from "./validate.js";

const app = express();
const PORT = Number(process.env.PORT || 3000);
const publicDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public");

app.use(express.json({ limit: "64kb" }));
app.use(express.static(publicDir));

let modelReady = false;

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", model: MODEL_ID, dtype: DTYPE, modelReady });
});

app.post("/api/summarize", async (req, res) => {
  const input = validateSummarizeRequest(req.body);
  if (!input.ok) return res.status(400).json({ error: input.error });

  try {
    const { summary, ms } = await summarize(input.text, { maxTokens: input.maxTokens });
    res.json({ summary, ms, model: MODEL_ID });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Dialogue Summarizer running at http://localhost:${PORT}`);
  console.log(`Loading model "${MODEL_ID}" (${DTYPE}) ...`);
  loadSummarizer()
    .then(() => {
      modelReady = true;
      console.log("Model loaded. Ready!");
    })
    .catch((err) => console.error(err.message));
});
