const RESEND_API_KEY = process.env.RESEND_API_KEY;

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

async function sendOnce({ to, subject, html, replyTo }: EmailOptions): Promise<unknown | null> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Macrolight <notifications@macrolight-builder.com>",
      to,
      subject,
      html,
      ...(replyTo ? { replyTo } : {}),
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    console.error("Email send failed:", error);
    return null;
  }

  return res.json();
}

export async function sendEmail(options: EmailOptions): Promise<unknown | null> {
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set — skipping email send");
    return null;
  }

  const result = await sendOnce(options);
  if (result !== null) return result;

  // One retry on failure
  console.warn("Retrying email send…");
  return sendOnce(options);
}
