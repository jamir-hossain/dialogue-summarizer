// Command-line usage:
//   node src/cli.js path/to/dialogue.txt
//   cat dialogue.txt | node src/cli.js
import fs from "node:fs";
import { summarize, MODEL_ID } from "./summarizer.js";

const file = process.argv[2];
const text = file ? fs.readFileSync(file, "utf8") : fs.readFileSync(0, "utf8");

if (!text.trim()) {
  console.error("Usage: node src/cli.js <file.txt>   (or pipe text through stdin)");
  process.exit(1);
}

const { summary, ms } = await summarize(text.trim());
console.log(`Model   : ${MODEL_ID}`);
console.log(`Time    : ${ms} ms`);
console.log(`Summary : ${summary}`);
