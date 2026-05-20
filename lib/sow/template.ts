/**
 * Statement of Work HTML template for client SOW PDFs.
 *
 * Rendered to PDF by lib/sow/pdf.ts via puppeteer. All styling is inline
 * so the rendered HTML doesn't depend on any external stylesheet.
 */

export type SowLineItem = {
  name: string;
  category: string | null;
  billing: "ONE_TIME" | "MONTHLY";
  priceCents: number;
  /** True for items bundled free into the base plan. Rendered as "Included". */
  included: boolean;
};

export type SowData = {
  /** Plan request id, used as the SOW reference number. */
  requestId: string;
  /** Client info. */
  client: {
    name: string;
    email: string;
  };
  /** Base plan key (STARTER | GROWTH | PRO) + display name + pricing. */
  basePlan: {
    key: string;
    label: string;
    buildCents: number;
    monthlyCents: number;
  };
  /** All selected and included items. */
  items: SowLineItem[];
  /** Totals as computed at checkout time. */
  totals: {
    monthlyCents: number;
    oneTimeCents: number;
    bundleDiscountCents: number;
  };
  /** Optional notes the client submitted with the plan. */
  notes: string | null;
  /** When the SOW was issued. */
  issuedAt: Date;
  /** Stripe subscription id, for reference. */
  stripeSubscriptionId: string | null;
};

const COMPANY = {
  legalName: "Macrolight Builder LLC",
  brand: "Macrolight Builder",
  address: "1902 Villa Rd, Birmingham, MI 48009",
  phone: "(248) 214-5877",
  email: "bbayley50@gmail.com",
  website: "macrolight-builder.com",
};

function money(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildSowHtml(data: SowData): string {
  const monthlyAddons = data.items.filter(
    (i) => !i.included && i.billing === "MONTHLY",
  );
  const oneTimeAddons = data.items.filter(
    (i) => !i.included && i.billing === "ONE_TIME",
  );
  const includedItems = data.items.filter((i) => i.included);

  const issued = fmtDate(data.issuedAt);
  const refShort = data.requestId.slice(-10).toUpperCase();

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Statement of Work — ${esc(COMPANY.brand)}</title>
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #1f2937;
    margin: 0;
    padding: 0;
    -webkit-font-smoothing: antialiased;
  }
  .page { padding: 56px 56px 64px; }
  .hdr { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 24px; border-bottom: 2px solid #7c3aed; }
  .hdr .brand { font-size: 22px; font-weight: 800; color: #111827; letter-spacing: -0.01em; }
  .hdr .brand-sub { font-size: 11px; color: #6b7280; margin-top: 2px; }
  .hdr .ref { text-align: right; font-size: 11px; color: #6b7280; }
  .hdr .ref strong { display: block; color: #111827; font-size: 13px; margin-top: 2px; }
  h1 { font-size: 28px; font-weight: 800; margin: 32px 0 4px; color: #111827; letter-spacing: -0.01em; }
  .sub { font-size: 12px; color: #6b7280; margin-bottom: 28px; }
  h2 { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #7c3aed; margin: 28px 0 10px; }
  .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 8px; }
  .meta-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px 16px; }
  .meta-card .lbl { font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #9ca3af; font-weight: 600; }
  .meta-card .val { font-size: 13px; color: #111827; margin-top: 4px; line-height: 1.45; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
  thead th { text-align: left; padding: 10px 12px; background: #f9fafb; font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: #6b7280; border-bottom: 1px solid #e5e7eb; }
  thead th.num { text-align: right; }
  tbody td { padding: 10px 12px; border-bottom: 1px solid #f3f4f6; vertical-align: top; }
  tbody td.num { text-align: right; font-variant-numeric: tabular-nums; }
  tbody tr.section td { background: #faf5ff; color: #6b21a8; font-weight: 700; text-transform: uppercase; font-size: 10px; letter-spacing: 0.06em; padding: 8px 12px; }
  tbody tr.included td { color: #6b7280; }
  .totals { margin-top: 20px; padding: 18px 20px; background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 10px; }
  .totals .row { display: flex; justify-content: space-between; align-items: baseline; padding: 4px 0; font-size: 13px; color: #4b5563; }
  .totals .row.savings { color: #047857; }
  .totals .row.total { padding-top: 14px; margin-top: 8px; border-top: 1px solid #e9d5ff; font-size: 15px; font-weight: 700; color: #111827; }
  .totals .row.total .amt { color: #6d28d9; font-size: 18px; }
  .notes { margin-top: 24px; padding: 14px 18px; background: #fefce8; border: 1px solid #fde68a; border-radius: 8px; font-size: 12px; color: #713f12; line-height: 1.55; }
  .notes .lbl { font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #b45309; font-weight: 700; margin-bottom: 4px; }
  .terms { margin-top: 28px; font-size: 10.5px; color: #4b5563; line-height: 1.55; }
  .terms p { margin: 0 0 8px; }
  .accept { margin-top: 28px; padding: 18px 20px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 11.5px; color: #1f2937; line-height: 1.55; }
  .accept .lbl { font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #6b7280; font-weight: 700; }
  .footer { margin-top: 36px; padding-top: 18px; border-top: 1px solid #e5e7eb; font-size: 10px; color: #9ca3af; display: flex; justify-content: space-between; }
</style>
</head>
<body>
<div class="page">

  <div class="hdr">
    <div>
      <div class="brand">${esc(COMPANY.brand)}</div>
      <div class="brand-sub">${esc(COMPANY.address)} · ${esc(COMPANY.phone)}</div>
    </div>
    <div class="ref">
      Statement of Work
      <strong>SOW-${esc(refShort)}</strong>
    </div>
  </div>

  <h1>Statement of Work</h1>
  <div class="sub">Issued ${esc(issued)} · Reference SOW-${esc(refShort)}</div>

  <h2>Parties</h2>
  <div class="meta-grid">
    <div class="meta-card">
      <div class="lbl">Service Provider</div>
      <div class="val">
        <strong>${esc(COMPANY.legalName)}</strong><br/>
        ${esc(COMPANY.address)}<br/>
        ${esc(COMPANY.phone)} · ${esc(COMPANY.email)}
      </div>
    </div>
    <div class="meta-card">
      <div class="lbl">Client</div>
      <div class="val">
        <strong>${esc(data.client.name || data.client.email)}</strong><br/>
        ${esc(data.client.email)}
      </div>
    </div>
  </div>

  <h2>Engagement Summary</h2>
  <div class="meta-grid">
    <div class="meta-card">
      <div class="lbl">Base Plan</div>
      <div class="val"><strong>${esc(data.basePlan.label)}</strong></div>
    </div>
    <div class="meta-card">
      <div class="lbl">Stripe Subscription</div>
      <div class="val">${data.stripeSubscriptionId ? esc(data.stripeSubscriptionId) : "<em>Pending activation</em>"}</div>
    </div>
  </div>

  <h2>Services &amp; Deliverables</h2>
  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th>Category</th>
        <th>Billing</th>
        <th class="num">Price</th>
      </tr>
    </thead>
    <tbody>
      <tr class="section"><td colspan="4">Base plan</td></tr>
      <tr>
        <td><strong>${esc(data.basePlan.label)} website build</strong><br/><span style="color:#6b7280">One-time build fee for the ${esc(data.basePlan.label)} plan.</span></td>
        <td>Base</td>
        <td>One-time</td>
        <td class="num">${money(data.basePlan.buildCents)}</td>
      </tr>
      <tr>
        <td><strong>${esc(data.basePlan.label)} plan — monthly</strong><br/><span style="color:#6b7280">Hosting, support, and ongoing improvements.</span></td>
        <td>Base</td>
        <td>Recurring</td>
        <td class="num">${money(data.basePlan.monthlyCents)}/mo</td>
      </tr>

      ${monthlyAddons.length > 0 ? `<tr class="section"><td colspan="4">Recurring add-ons</td></tr>` : ""}
      ${monthlyAddons.map((it) => `
        <tr>
          <td>${esc(it.name)}</td>
          <td>${esc(it.category ?? "")}</td>
          <td>Recurring</td>
          <td class="num">${money(it.priceCents)}/mo</td>
        </tr>`).join("")}

      ${oneTimeAddons.length > 0 ? `<tr class="section"><td colspan="4">One-time add-ons</td></tr>` : ""}
      ${oneTimeAddons.map((it) => `
        <tr>
          <td>${esc(it.name)}</td>
          <td>${esc(it.category ?? "")}</td>
          <td>One-time</td>
          <td class="num">${money(it.priceCents)}</td>
        </tr>`).join("")}

      ${includedItems.length > 0 ? `<tr class="section"><td colspan="4">Included with base plan (no charge)</td></tr>` : ""}
      ${includedItems.map((it) => `
        <tr class="included">
          <td>${esc(it.name)}</td>
          <td>${esc(it.category ?? "")}</td>
          <td>Included</td>
          <td class="num">Included</td>
        </tr>`).join("")}
    </tbody>
  </table>

  <div class="totals">
    <div class="row"><span>Total monthly recurring</span><span>${money(data.totals.monthlyCents)}/mo</span></div>
    <div class="row"><span>Total one-time</span><span>${money(data.totals.oneTimeCents)}</span></div>
    ${data.totals.bundleDiscountCents > 0 ? `<div class="row savings"><span>Bundle savings</span><span>−${money(data.totals.bundleDiscountCents)}</span></div>` : ""}
    <div class="row total"><span>Due at signing (one-time + first month)</span><span class="amt">${money(data.totals.oneTimeCents + data.totals.monthlyCents)}</span></div>
  </div>

  ${data.notes ? `<div class="notes"><div class="lbl">Client Notes</div>${esc(data.notes).replace(/\n/g, "<br/>")}</div>` : ""}

  <h2>Terms Summary</h2>
  <div class="terms">
    <p><strong>Term &amp; cancellation.</strong> Recurring monthly services require an initial minimum commitment of three (3) consecutive billing months. After the initial term services continue month-to-month and may be terminated by either Party on thirty (30) days written notice.</p>
    <p><strong>Payment.</strong> One-time fees are due upfront. Recurring services are billed monthly in advance via Stripe using the payment method on file. Payments more than five (5) days past due may result in suspension of services.</p>
    <p><strong>Refunds.</strong> All payments are non-refundable once work has commenced, including deposits, setup fees, and billed recurring services.</p>
    <p><strong>Ownership.</strong> Client retains all original content and supplied materials. Company retains source code, frameworks, and reusable assets, and grants Client a non-exclusive license to use completed deliverables during the active term. Codebase transfer (Next.js project export) is available on request after the initial term and payment of all outstanding balances.</p>
    <p><strong>No guarantees.</strong> Company does not guarantee specific marketing, SEO, advertising, lead, ranking, or revenue outcomes.</p>
    <p>This SOW is governed by and incorporated into the Macrolight Builder Master Services Agreement available at https://${esc(COMPANY.website)}/terms. In the event of any conflict, the Master Services Agreement controls.</p>
  </div>

  <div class="accept">
    <div class="lbl">Acceptance</div>
    <p style="margin: 6px 0 0">
      Client accepted the Master Services Agreement and authorized this Statement of Work
      via the Macrolight Builder portal on <strong>${esc(issued)}</strong>. Acceptance was
      recorded as the Client&#39;s electronic signature pursuant to the Electronic Signatures
      clause of the Master Services Agreement.
    </p>
  </div>

  <div class="footer">
    <span>${esc(COMPANY.legalName)} · ${esc(COMPANY.website)}</span>
    <span>SOW-${esc(refShort)} · ${esc(issued)}</span>
  </div>

</div>
</body>
</html>`;
}
