import { createHmac, timingSafeEqual } from "node:crypto";

/** Verify Meta WhatsApp Cloud webhook signature (X-Hub-Signature-256). */
export function verifyWhatsAppSignature(
  rawBody: string,
  signatureHeader: string | null,
  appSecret?: string,
): boolean {
  if (!appSecret) return true;
  if (!signatureHeader?.startsWith("sha256=")) return false;
  const provided = signatureHeader.slice("sha256=".length);
  const expected = createHmac("sha256", appSecret).update(rawBody).digest("hex");
  try {
    const a = Buffer.from(expected);
    const b = Buffer.from(provided);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/** Verify Telegram secret token header when TELEGRAM_WEBHOOK_SECRET is set. */
export function verifyTelegramSecret(
  headerToken: string | null,
  expectedSecret?: string,
): boolean {
  if (!expectedSecret) return true;
  if (!headerToken) return false;
  try {
    const a = Buffer.from(headerToken);
    const b = Buffer.from(expectedSecret);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
