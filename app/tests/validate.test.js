import { test } from "node:test";
import assert from "node:assert/strict";
import { validateSummarizeRequest, LIMITS } from "../src/validate.js";

const longEnough = "#Person1#: Are we still meeting at five? #Person2#: Yes, see you then.";

test("rejects missing or too-short text", () => {
  assert.equal(validateSummarizeRequest({}).ok, false);
  assert.equal(validateSummarizeRequest({ text: "hi" }).ok, false);
});

test("rejects text over the character limit", () => {
  const result = validateSummarizeRequest({ text: "a".repeat(LIMITS.maxChars + 1) });
  assert.equal(result.ok, false);
});

test("trims text and applies the default token budget", () => {
  const result = validateSummarizeRequest({ text: `  ${longEnough}  ` });
  assert.equal(result.ok, true);
  assert.equal(result.text, longEnough);
  assert.equal(result.maxTokens, LIMITS.defaultTokens);
});

test("clamps maxTokens into the allowed range", () => {
  assert.equal(validateSummarizeRequest({ text: longEnough, maxTokens: 5 }).maxTokens, LIMITS.minTokens);
  assert.equal(validateSummarizeRequest({ text: longEnough, maxTokens: 9999 }).maxTokens, LIMITS.maxTokens);
  assert.equal(validateSummarizeRequest({ text: longEnough, maxTokens: "abc" }).maxTokens, LIMITS.defaultTokens);
});
