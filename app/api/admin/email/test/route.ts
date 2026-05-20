import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { sendEmailDetailed, getNotificationEmails } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/email/test
 *
 * Sends a test email via Resend and returns the raw API response so the
 * exact failure (or success) is inspectable from the browser. Admin-only.
 *
 * Body (optional):
 *   { to?: string | string[], subject?: string }
 *
 * If `to` is omitted, the LEAD_NOTIFICATION_EMAIL env var is used.
 *
 * Example from the browser console while signed in as admin:
 *   await fetch("/api/admin/email/test", { method: "POST" })
 *     .then(r => r.json())
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));

  const explicitTo: string | string[] | undefined = body?.to;
  const fallback = getNotificationEmails();
  const to = explicitTo ?? (fallback.length > 0 ? fallback : null);

  if (!to || (Array.isArray(to) && to.length === 0)) {
    return NextResponse.json(
      {
        error:
          "No recipient. Pass { to } in the body or set LEAD_NOTIFICATION_EMAIL.",
        envCheck: {
          RESEND_API_KEY: Boolean(process.env.RESEND_API_KEY),
          LEAD_NOTIFICATION_EMAIL: Boolean(process.env.LEAD_NOTIFICATION_EMAIL),
          RESEND_FROM_ADDRESS:
            process.env.RESEND_FROM_ADDRESS ??
            "Macrolight <notifications@macrolight-builder.com> (default)",
        },
      },
      { status: 400 },
    );
  }

  const subject =
    typeof body?.subject === "string"
      ? body.subject
      : `Test email · ${new Date().toISOString()}`;

  const result = await sendEmailDetailed({
    to,
    subject,
    html: `
      <div style="font-family:Arial,sans-serif;padding:16px;color:#1f2937">
        <h2 style="margin:0 0 8px">Resend test email</h2>
        <p style="margin:0;color:#6b7280">Sent at ${new Date().toISOString()}</p>
        <p style="margin-top:12px">If you can read this, Resend is working.</p>
      </div>
    `.trim(),
  });

  return NextResponse.json(
    {
      ...result,
      sentTo: to,
      fromAddress:
        process.env.RESEND_FROM_ADDRESS ??
        "Macrolight <notifications@macrolight-builder.com>",
      envCheck: {
        RESEND_API_KEY: Boolean(process.env.RESEND_API_KEY),
        LEAD_NOTIFICATION_EMAIL: Boolean(process.env.LEAD_NOTIFICATION_EMAIL),
      },
    },
    { status: result.ok ? 200 : 502 },
  );
}
