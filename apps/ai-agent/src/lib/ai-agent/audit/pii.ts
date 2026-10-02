const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_RE = /(?<!\w)(?:\+?\d[\d\s().-]{7,}\d)/g;

export function maskPii(input: string | null | undefined): string | null {
  if (input == null) return null;
  return input.replace(EMAIL_RE, "[EMAIL]").replace(PHONE_RE, "[PHONE]");
}

export function maskPiiDeep(value: unknown): unknown {
  if (typeof value === "string") return maskPii(value);
  if (Array.isArray(value)) return value.map(maskPiiDeep);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const lower = k.toLowerCase();
      if (lower.includes("email") || lower.includes("phone") || lower.includes("password")) {
        out[k] = "[REDACTED]";
      } else {
        out[k] = maskPiiDeep(v);
      }
    }
    return out;
  }
  return value;
}
