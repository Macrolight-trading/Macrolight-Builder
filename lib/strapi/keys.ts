import crypto from "crypto";

/**
 * Site API key primitives — one key per Builder site, shared by VisBoost and
 * the client site page renderer (server-side only).
 *
 * The key is a single opaque string that authenticates to a specific
 * Macrolight Builder site without a browser session. We never persist the
 * plaintext: only a sha256 hash (for verification), a lookup prefix (for an
 * indexed O(1) fetch), and the last 4 chars (for display).
 *
 * Format: `mlsk_<8-hex-prefix>_<48-hex-secret>`
 *   - "mlsk" = MacroLight Strapi Key.
 *   - The prefix is the unique, non-secret lookup handle stored on the record.
 *   - The secret half is what actually authenticates and is hashed before storage.
 */

const KEY_NS = "mlsk";

export type GeneratedPairingKey = {
  /** Full plaintext key — show to the admin exactly once, never stored. */
  token: string;
  /** Non-secret lookup handle, e.g. "mlsk_ab12cd34". Stored + indexed. */
  prefix: string;
  /** sha256(token) as hex. Stored for constant-time verification. */
  hash: string;
  /** Last 4 chars of the token, for non-sensitive display. */
  last4: string;
};

export function hashPairingKey(token: string): string {
  return crypto.createHash("sha256").update(token, "utf8").digest("hex");
}

/** Generate a fresh pairing key and the derived values to persist. */
export function generatePairingKey(): GeneratedPairingKey {
  const prefixId = crypto.randomBytes(4).toString("hex"); // 8 hex chars
  const secret = crypto.randomBytes(24).toString("hex"); // 48 hex chars
  const prefix = `${KEY_NS}_${prefixId}`;
  const token = `${prefix}_${secret}`;
  return {
    token,
    prefix,
    hash: hashPairingKey(token),
    last4: token.slice(-4),
  };
}

/**
 * Extract the non-secret lookup prefix ("mlsk_<id>") from a presented token.
 * Returns null when the token is absent or malformed.
 */
export function parsePairingPrefix(token: string | null | undefined): string | null {
  if (!token) return null;
  const parts = token.split("_");
  if (parts.length < 3 || parts[0] !== KEY_NS) return null;
  if (!/^[0-9a-f]{8}$/i.test(parts[1])) return null;
  return `${KEY_NS}_${parts[1]}`;
}

/**
 * Constant-time comparison of two sha256 hex digests. Falls back to `false`
 * on any length mismatch or decode error rather than throwing.
 */
export function safeEqualHex(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, "hex");
    const bufB = Buffer.from(b, "hex");
    if (bufA.length !== bufB.length || bufA.length === 0) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

/** Read a pairing key off an inbound request (header or Bearer token). */
export function readPairingKey(req: {
  headers: { get(name: string): string | null };
}): string | null {
  const header = req.headers.get("x-macrolight-key");
  if (header) return header.trim();
  const auth = req.headers.get("authorization");
  if (auth && /^Bearer\s+/i.test(auth)) {
    return auth.replace(/^Bearer\s+/i, "").trim();
  }
  return null;
}
