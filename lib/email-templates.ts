function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

interface NewLeadEmailData {
  name: string;
  email: string;
  company: string;
  message: string;
  industry: string;
  phone?: string;
}

export function newLeadEmailHtml({
  name,
  email,
  company,
  message,
  industry,
  phone,
}: NewLeadEmailData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Lead Notification</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color:#7c3aed;padding:24px 32px;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:600;">New Lead Received</h1>
              <p style="margin:8px 0 0;color:#e0d4fc;font-size:14px;">A new contact form submission has come in.</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #e4e4e7;">
                    <span style="display:block;font-size:12px;color:#71717a;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Name</span>
                    <span style="font-size:16px;color:#18181b;font-weight:500;">${escapeHtml(name)}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #e4e4e7;">
                    <span style="display:block;font-size:12px;color:#71717a;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Email</span>
                    <a href="mailto:${escapeHtml(email)}" style="font-size:16px;color:#7c3aed;text-decoration:none;font-weight:500;">${escapeHtml(email)}</a>
                  </td>
                </tr>
                ${phone ? `<tr>
                  <td style="padding:12px 0;border-bottom:1px solid #e4e4e7;">
                    <span style="display:block;font-size:12px;color:#71717a;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Phone</span>
                    <a href="tel:${escapeHtml(phone)}" style="font-size:16px;color:#7c3aed;text-decoration:none;font-weight:500;">${escapeHtml(phone)}</a>
                  </td>
                </tr>` : ""}
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #e4e4e7;">
                    <span style="display:block;font-size:12px;color:#71717a;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Company</span>
                    <span style="font-size:16px;color:#18181b;font-weight:500;">${escapeHtml(company || "Not provided")}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #e4e4e7;">
                    <span style="display:block;font-size:12px;color:#71717a;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Industry</span>
                    <span style="font-size:16px;color:#18181b;font-weight:500;">${escapeHtml(industry || "Not provided")}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0;">
                    <span style="display:block;font-size:12px;color:#71717a;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Message</span>
                    <p style="margin:0;font-size:15px;color:#3f3f46;line-height:1.6;white-space:pre-wrap;">${escapeHtml(message)}</p>
                  </td>
                </tr>
              </table>
              <!-- CTA -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
                <tr>
                  <td align="center">
                    <a href="https://macrolight-builder.com/admin/contacts" style="display:inline-block;background-color:#7c3aed;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:14px;font-weight:600;">View in Admin Dashboard</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#fafafa;padding:20px 32px;border-top:1px solid #e4e4e7;">
              <p style="margin:0;font-size:13px;color:#a1a1aa;text-align:center;">Macrolight Builder &mdash; Lead Notification</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

// ── Portal event templates ───────────────────────────────────────────────────

/** Shared layout wrapper so all emails look consistent. */
function emailLayout(headerTitle: string, headerSub: string, body: string, footerNote: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          <tr>
            <td style="background-color:#7c3aed;padding:24px 32px;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:600;">${headerTitle}</h1>
              <p style="margin:8px 0 0;color:#e0d4fc;font-size:14px;">${headerSub}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              ${body}
            </td>
          </tr>
          <tr>
            <td style="background-color:#fafafa;padding:20px 32px;border-top:1px solid #e4e4e7;">
              <p style="margin:0;font-size:13px;color:#a1a1aa;text-align:center;">${footerNote}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

function field(label: string, value: string): string {
  return `
    <div style="padding:12px 0;border-bottom:1px solid #e4e4e7;">
      <span style="display:block;font-size:12px;color:#71717a;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">${label}</span>
      <span style="font-size:15px;color:#18181b;font-weight:500;">${value}</span>
    </div>`;
}

function ctaButton(label: string, href: string): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
      <tr>
        <td align="center">
          <a href="${href}" style="display:inline-block;background-color:#7c3aed;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:14px;font-weight:600;">${label}</a>
        </td>
      </tr>
    </table>`;
}

// 1. Welcome email sent to a new user on signup
export function welcomeEmailHtml({ name }: { name: string | null }): string {
  const greeting = name ? `Hi ${escapeHtml(name)},` : "Hi there,";
  return emailLayout(
    "Welcome to Macrolight",
    "Your account is ready — let's build something great.",
    `<p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.6;">${greeting}</p>
     <p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.6;">
       Your Macrolight account is all set. Head to your portal to fill in your project details and we'll get started on your website.
     </p>
     ${ctaButton("Go to My Portal", "https://macrolight-builder.com/portal")}`,
    "Macrolight Builder &mdash; Welcome"
  );
}

// 2. Admin alert when a new user signs up
export function newSignupAdminEmailHtml({ name, email }: { name: string | null; email: string }): string {
  return emailLayout(
    "New User Signed Up",
    "A new client account has been created.",
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
       ${field("Name", escapeHtml(name ?? "Not provided"))}
       ${field("Email", `<a href="mailto:${escapeHtml(email)}" style="color:#7c3aed;text-decoration:none;">${escapeHtml(email)}</a>`)}
     </table>
     ${ctaButton("View in Admin Portal", "https://macrolight-builder.com/admin/portal/projects")}`,
    "Macrolight Builder &mdash; New Signup Alert"
  );
}

// 3. Auto-reply confirmation for a public contact form submission
export function contactAutoReplyEmailHtml({ name }: { name: string }): string {
  return emailLayout(
    "We received your message",
    "Thanks for reaching out — we'll be in touch shortly.",
    `<p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.6;">Hi ${escapeHtml(name)},</p>
     <p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.6;">
       Thanks for contacting Macrolight. We've received your message and one of our team members will get back to you within one business day.
     </p>
     <p style="margin:0;font-size:15px;color:#3f3f46;line-height:1.6;">
       In the meantime, feel free to browse our work at <a href="https://macrolight-builder.com" style="color:#7c3aed;text-decoration:none;">macrolight-builder.com</a>.
     </p>`,
    "Macrolight Builder &mdash; Contact Confirmation"
  );
}

// 4. Admin alert when a client completes onboarding
export function onboardingCompleteAdminEmailHtml({
  name,
  email,
  businessName,
}: {
  name: string | null;
  email: string;
  businessName: string | null;
}): string {
  return emailLayout(
    "Onboarding Completed",
    "A client has submitted their project brief.",
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
       ${field("Client", escapeHtml(name ?? email))}
       ${field("Email", `<a href="mailto:${escapeHtml(email)}" style="color:#7c3aed;text-decoration:none;">${escapeHtml(email)}</a>`)}
       ${businessName ? field("Business Name", escapeHtml(businessName)) : ""}
     </table>
     <p style="margin:20px 0 0;font-size:14px;color:#71717a;line-height:1.6;">
       The project stage has been automatically advanced to <strong style="color:#18181b;">Design</strong>. Review the brief and pick up where you left off.
     </p>
     ${ctaButton("View Client Brief", `https://macrolight-builder.com/admin/portal/projects`)}`,
    "Macrolight Builder &mdash; Onboarding Alert"
  );
}

// 5. Admin alert when a client uploads a media file
export function mediaUploadAdminEmailHtml({
  name,
  email,
  filename,
}: {
  name: string | null;
  email: string;
  filename: string;
}): string {
  return emailLayout(
    "New Media Upload",
    "A client uploaded a file to their project.",
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
       ${field("Client", escapeHtml(name ?? email))}
       ${field("Email", `<a href="mailto:${escapeHtml(email)}" style="color:#7c3aed;text-decoration:none;">${escapeHtml(email)}</a>`)}
       ${field("File", escapeHtml(filename))}
     </table>
     ${ctaButton("View in Admin Portal", "https://macrolight-builder.com/admin/portal/projects")}`,
    "Macrolight Builder &mdash; Media Upload Alert"
  );
}

// 6. Admin alert when a client sends a message
export function clientMessageAdminEmailHtml({
  name,
  email,
  body,
}: {
  name: string | null;
  email: string;
  body: string;
}): string {
  return emailLayout(
    "New Client Message",
    "A client sent you a message in their project portal.",
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
       ${field("From", escapeHtml(name ?? email))}
       ${field("Email", `<a href="mailto:${escapeHtml(email)}" style="color:#7c3aed;text-decoration:none;">${escapeHtml(email)}</a>`)}
     </table>
     <div style="margin-top:16px;padding:16px;background-color:#f5f3ff;border-left:3px solid #7c3aed;border-radius:0 6px 6px 0;">
       <p style="margin:0;font-size:15px;color:#3f3f46;line-height:1.6;white-space:pre-wrap;">${escapeHtml(body)}</p>
     </div>
     ${ctaButton("Reply in Admin Portal", "https://macrolight-builder.com/admin/portal/projects")}`,
    "Macrolight Builder &mdash; Message Alert"
  );
}

// 7. Client notification when an admin replies to them
export function adminMessageClientEmailHtml({
  name,
  body,
}: {
  name: string | null;
  body: string;
}): string {
  const greeting = name ? `Hi ${escapeHtml(name)},` : "Hi there,";
  return emailLayout(
    "New Message from Macrolight",
    "Your project team sent you a message.",
    `<p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.6;">${greeting}</p>
     <div style="padding:16px;background-color:#f5f3ff;border-left:3px solid #7c3aed;border-radius:0 6px 6px 0;">
       <p style="margin:0;font-size:15px;color:#3f3f46;line-height:1.6;white-space:pre-wrap;">${escapeHtml(body)}</p>
     </div>
     <p style="margin:16px 0 0;font-size:14px;color:#71717a;">Reply or view the full conversation in your portal.</p>
     ${ctaButton("Open My Portal", "https://macrolight-builder.com/portal")}`,
    "Macrolight Builder &mdash; Project Update"
  );
}

// ── Original templates ────────────────────────────────────────────────────────

interface WeeklyDigestData {
  newLeads: number;
  totalRevenue: string;
  topPages: Array<{ path: string; views: number }>;
}

export function weeklyDigestEmailHtml({
  newLeads,
  totalRevenue,
  topPages,
}: WeeklyDigestData): string {
  const topPagesRows = topPages
    .map(
      (page) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e4e4e7;font-size:14px;color:#3f3f46;">${escapeHtml(page.path)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e4e4e7;font-size:14px;color:#18181b;font-weight:600;text-align:right;">${page.views.toLocaleString()}</td>
        </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Weekly Digest</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color:#7c3aed;padding:24px 32px;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:600;">Weekly Digest</h1>
              <p style="margin:8px 0 0;color:#e0d4fc;font-size:14px;">Here's your summary for the past week.</p>
            </td>
          </tr>
          <!-- Stats -->
          <tr>
            <td style="padding:32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%" style="padding:16px;text-align:center;background-color:#f5f3ff;border-radius:8px;">
                    <span style="display:block;font-size:32px;font-weight:700;color:#7c3aed;">${newLeads}</span>
                    <span style="display:block;font-size:13px;color:#71717a;margin-top:4px;text-transform:uppercase;letter-spacing:0.05em;">New Leads</span>
                  </td>
                  <td width="16" style="padding:0;">&nbsp;</td>
                  <td width="50%" style="padding:16px;text-align:center;background-color:#f5f3ff;border-radius:8px;">
                    <span style="display:block;font-size:32px;font-weight:700;color:#7c3aed;">${escapeHtml(totalRevenue)}</span>
                    <span style="display:block;font-size:13px;color:#71717a;margin-top:4px;text-transform:uppercase;letter-spacing:0.05em;">Total Revenue</span>
                  </td>
                </tr>
              </table>
              <!-- Top Pages -->
              <h2 style="margin:28px 0 12px;font-size:16px;color:#18181b;font-weight:600;">Top Pages</h2>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e4e4e7;border-radius:6px;overflow:hidden;">
                <tr style="background-color:#fafafa;">
                  <th style="padding:10px 12px;text-align:left;font-size:12px;color:#71717a;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;">Page</th>
                  <th style="padding:10px 12px;text-align:right;font-size:12px;color:#71717a;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;">Views</th>
                </tr>
                ${topPagesRows}
              </table>
              <!-- CTA -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
                <tr>
                  <td align="center">
                    <a href="https://macrolight-builder.com/admin" style="display:inline-block;background-color:#7c3aed;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:14px;font-weight:600;">Open Admin Dashboard</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#fafafa;padding:20px 32px;border-top:1px solid #e4e4e7;">
              <p style="margin:0;font-size:13px;color:#a1a1aa;text-align:center;">Macrolight Builder &mdash; Weekly Digest</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}
