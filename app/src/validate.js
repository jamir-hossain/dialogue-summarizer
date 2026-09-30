// Input validation for the summarize API — kept separate so it can be unit-tested without loading a model.

export const LIMITS = {
  minChars: 20,
  maxChars: 8000,
  minTokens: 16,
  maxTokens: 256,
  defaultTokens: 96,
};

export function validateSummarizeRequest(body) {
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  if (text.length < LIMITS.minChars) {
    return { ok: false, error: `Please provide at least ${LIMITS.minChars} characters of text.` };
  }
  if (text.length > LIMITS.maxChars) {
    return { ok: false, error: `Text is too long (max ${LIMITS.maxChars} characters).` };
  }

  let maxTokens = Number(body?.maxTokens ?? LIMITS.defaultTokens);
  if (!Number.isFinite(maxTokens)) maxTokens = LIMITS.defaultTokens;
  maxTokens = Math.min(LIMITS.maxTokens, Math.max(LIMITS.minTokens, Math.round(maxTokens)));

  return { ok: true, text, maxTokens };
}
