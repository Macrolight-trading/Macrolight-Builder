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

/**
 * Options for sending an email using a Resend-hosted template (created in
 * the Resend dashboard). Variable keys must match the {{placeholders}} in
 * the template body. Subject is optional — if omitted, Resend uses the
 * template's default subject.
 */
interface TemplateEmailOptions {
  to: string | string[];
  templateId: string;
  variables?: Record<string, string | number>;
  subject?: string;
  replyTo?: string;
}

export type SendResult =
  | { ok: true; id?: string; raw: unknown }
  | { ok: false; status: number; error: string; raw?: unknown };

/**
 * Single POST to Resend's /emails endpoint. Shared by sendOnce and
 * sendTemplateOnce so the response-parsing and error-reporting logic
 * lives in exactly one place.
 */
async function postToResend(payload: Record<string, unknown>): Promise<SendResult> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

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

async function sendOnce({
  to,
  subject,
  html,
  replyTo,
}: EmailOptions): Promise<SendResult> {
  return postToResend({
    from: FROM_ADDRESS,
    to,
    subject,
    html,
    ...(replyTo ? { reply_to: replyTo } : {}),
  });
}

async function sendTemplateOnce({
  to,
  templateId,
  variables,
  subject,
  replyTo,
}: TemplateEmailOptions): Promise<SendResult> {
  return postToResend({
    from: FROM_ADDRESS,
    to,
    ...(subject ? { subject } : {}),
    template: {
      id: templateId,
      ...(variables ? { variables } : {}),
    },
    ...(replyTo ? { reply_to: replyTo } : {}),
  });
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

  if (first.status < 500) return first;

  console.warn("Retrying email send (transient failure)…");
  return sendOnce(options);
}

/**
 * Send an email rendered from a Resend-hosted template. The template is
 * created in Resend's dashboard and referenced by its `templateId` (UUID
 * or alias of a published template). Variable keys must match the
 * {{placeholders}} declared in the template body.
 *
 * Returns a discriminated SendResult so callers can detect failure and
 * fall back to an inline HTML send if needed.
 */
export async function sendTemplateEmailDetailed(
  options: TemplateEmailOptions,
): Promise<SendResult> {
  if (!RESEND_API_KEY) {
    const error =
      "RESEND_API_KEY not set — email skipped. Add it to .env.local / Vercel env.";
    console.warn(error);
    return { ok: false, status: 0, error };
  }

  const first = await sendTemplateOnce(options);
  if (first.ok) return first;

  if (first.status < 500) return first;

  console.warn("Retrying template email send (transient failure)…");
  return sendTemplateOnce(options);
}

/**
 * Backward-compatible wrapper around sendTemplateEmailDetailed: returns
 * the raw response on success, null on failure. Use the *Detailed variant
 * when the caller wants to fall back to a different send on failure.
 */
export async function sendTemplateEmail(
  options: TemplateEmailOptions,
): Promise<unknown | null> {
  const result = await sendTemplateEmailDetailed(options);
  return result.ok ? result.raw : null;
}
