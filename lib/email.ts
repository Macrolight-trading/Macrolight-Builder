const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_ADDRESS =
  process.env.RESEND_FROM_ADDRESS ??
  "Macrolight <notifications@macrolight-builder.com>";

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

export type SendResult =
  | { ok: true; id?: string; raw: unknown }
  | { ok: false; status: number; error: string; raw?: unknown };

async function sendOnce({
  to,
  subject,
  html,
  replyTo,
}: EmailOptions): Promise<SendResult> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to,
      subject,
      html,
      // Resend's REST API expects snake_case. The previous camelCase
      // version was silently dropping the reply-to header.
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });

  // Parse the body either way — Resend returns JSON for both success
  // and error responses, and the error message is the most useful
  // signal we have.
  const text = await res.text();
  let parsed: unknown = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = text;
  }

  if (!res.ok) {
    const error =
      (parsed && typeof parsed === "object" && "message" in parsed
        ? String((parsed as { message: unknown }).message)
        : text) || `HTTP ${res.status}`;
    console.error(
      `Email send failed (${res.status}): ${error}`,
      parsed,
    );
    return { ok: false, status: res.status, error, raw: parsed };
  }

  const id =
    parsed && typeof parsed === "object" && "id" in parsed
      ? String((parsed as { id: unknown }).id)
      : undefined;
  return { ok: true, id, raw: parsed };
}

/**
 * Parses the LEAD_NOTIFICATION_EMAIL env var into a clean array of addresses.
 * Supports comma, semicolon, or newline-separated lists and trims whitespace.
 * Returns an empty array if the variable is unset or empty.
 */
export function getNotificationEmails(): string[] {
  const value = process.env.LEAD_NOTIFICATION_EMAIL;
  if (!value) return [];
  return Array.from(
    new Set(
      value
        .split(/[;,\n]/)
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  );
}

/**
 * Backward-compatible send: returns the raw parsed response on success,
 * null on failure. Existing callers don't need to change.
 *
 * For new code that needs to inspect failures, call sendEmailDetailed.
 */
export async function sendEmail(
  options: EmailOptions,
): Promise<unknown | null> {
  const result = await sendEmailDetailed(options);
  return result.ok ? result.raw : null;
}

/**
 * Like sendEmail but returns a discriminated result so the caller can
 * inspect status and error text. Use this from new diagnostic routes.
 */
export async function sendEmailDetailed(
  options: EmailOptions,
): Promise<SendResult> {
  if (!RESEND_API_KEY) {
    const error =
      "RESEND_API_KEY not set — email skipped. Add it to .env.local / Vercel env.";
    console.warn(error);
    return { ok: false, status: 0, error };
  }

  const first = await sendOnce(options);
  if (first.ok) return first;

  // Only retry transient failures (5xx, network). 4xx is configuration —
  // retrying won't help.
  if (first.status < 500) return first;

  console.warn("Retrying email send (transient failure)…");
  return sendOnce(options);
}
