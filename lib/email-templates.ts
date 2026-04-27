interface NewLeadEmailData {
  name: string;
  email: string;
  company: string;
  message: string;
  industry: string;
}

export function newLeadEmailHtml({
  name,
  email,
  company,
  message,
  industry,
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
                    <a href="https://macrolightbuilders.com/admin/contacts" style="display:inline-block;background-color:#7c3aed;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:14px;font-weight:600;">View in Admin Dashboard</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#fafafa;padding:20px 32px;border-top:1px solid #e4e4e7;">
              <p style="margin:0;font-size:13px;color:#a1a1aa;text-align:center;">Macrolight Builders &mdash; Lead Notification</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

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
                    <a href="https://macrolightbuilders.com/admin" style="display:inline-block;background-color:#7c3aed;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:14px;font-weight:600;">Open Admin Dashboard</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#fafafa;padding:20px 32px;border-top:1px solid #e4e4e7;">
              <p style="margin:0;font-size:13px;color:#a1a1aa;text-align:center;">Macrolight Builders &mdash; Weekly Digest</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
