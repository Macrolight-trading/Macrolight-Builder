import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import {
  sendEmailDetailed,
  sendTemplateEmailDetailed,
  getNotificationEmails,
} from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WELCOME_TEMPLATE_ID =
  process.env.RESEND_WELCOME_TEMPLATE_ID ??
  "6d9e480c-9f79-415f-bc13-a3715e03c4d2";

/**
 * POST /api/admin/email/test
 *
 * Sends a test email via Resend and returns the raw API response so the
 * exact failure (or success) is inspectable from the browser. Admin-only.
 *
 * Body (all optional):
 *   {
 *     to?: string | string[],          // defaults to LEAD_NOTIFICATION_EMAIL
 *     subject?: string,
 *     template?: "welcome" | string,   // "welcome" sends the welcome-email
 *                                      // template; any other string is
 *                                      // treated as an explicit template ID
 *     variables?: Record<string, string | number>,
 *                                      // template variable values
 *   }
 *
 * Examples (browser console, signed in as admin):
 *
 *   // 1. Plain inline HTML test (original behavior)
 *   await fetch("/api/admin/email/test", { method: "POST" }).then(r => r.json())
 *
 *   // 2. Send the welcome-email template to yourself
 *   await fetch("/api/admin/email/test", {
 *     method: "POST",
 *     headers: { "Content-Type": "application/json" },
 *     body: JSON.stringify({
 *       to: "you@example.com",
 *       template: "welcome",
 *       variables: { first_name: "Bradley" },
 *     }),
 *   }).then(r => r.json())
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

  // Template path: caller passed `template: "welcome"` (or another template
  // ID directly). Resolve the alias and forward to sendTemplateEmailDetailed.
  if (typeof body?.template === "string" && body.template.length > 0) {
    const templateId =
      body.template === "welcome" ? WELCOME_TEMPLATE_ID : body.template;
    const variables =
      body?.variables && typeof body.variables === "object"
        ? (body.variables as Record<string, string | number>)
        : undefined;

    const result = await sendTemplateEmailDetailed({
      to,
      templateId,
      variables,
      // Only forward subject if the caller explicitly set one; otherwise let
      // the template's own subject win.
      ...(typeof body?.subject === "string" ? { subject } : {}),
    });

    return NextResponse.json(
      {
        ...result,
        mode: "template",
        templateId,
        variables,
        sentTo: to,
        fromAddress:
          process.env.RESEND_FROM_ADDRESS ??
          "Macrolight <notifications@macrolight-builder.com>",
        envCheck: {
          RESEND_API_KEY: Boolean(process.env.RESEND_API_KEY),
          RESEND_WELCOME_TEMPLATE_ID: Boolean(
            process.env.RESEND_WELCOME_TEMPLATE_ID,
          ),
        },
      },
      { status: result.ok ? 200 : 502 },
    );
  }

  // Default path: inline HTML test (unchanged).
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
      mode: "inline",
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
