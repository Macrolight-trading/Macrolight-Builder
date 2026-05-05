import puppeteer, { type Browser } from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";
import type { AuditRunResult } from "./types";
import type { ContentPlanWithMeta } from "./ai/content-plan";
import { buildReportHtml } from "./pdf-template";

/**
 * PDF report generator.
 *
 * Uses puppeteer-core + @sparticuz/chromium-min for serverless deployment
 * (Vercel functions, Lambda, etc.) and falls back to a local Chrome install
 * during development. Returns a Uint8Array buffer that the API route streams
 * directly to the browser — no blob storage involved (regenerates on every
 * download).
 *
 * If you want to add caching later, swap to:
 *   1. Upload buffer to Vercel Blob (or S3)
 *   2. Persist URL to AuditResult.pdfUrl
 *   3. Have the route redirect to that URL when present
 */

const CHROMIUM_PACK_URL =
  "https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar";

export interface GeneratePdfOptions {
  result: AuditRunResult;
  clientName: string;
  url: string;
  positives?: {
    technical?: string[];
    onpage?: string[];
    backlinks?: string[];
    localSeo?: string[];
    domainAnalytics?: string[];
    serpVisibility?: string[];
    localPack?: string[];
    reputation?: string[];
  };
  /** Date the audit was run; defaults to now. */
  auditDate?: Date;
  /**
   * AI-generated Content Plan from /api/audits/:id/content-plan. When
   * passed, replaces the rule-based 90-day roadmap section in the PDF.
   * Null/undefined = no plan generated yet, section omitted.
   */
  aiContentPlan?: ContentPlanWithMeta | null;
}

export async function generateAuditPdf(
  options: GeneratePdfOptions
): Promise<Uint8Array> {
  const html = buildReportHtml({
    clientName: options.clientName,
    url: options.url,
    auditDate: options.auditDate ?? new Date(),
    result: options.result,
    positives: options.positives,
    aiContentPlan: options.aiContentPlan,
  });

  let browser: Browser | null = null;
  try {
    browser = await launchBrowser();
    const page = await browser.newPage();

    // Render the HTML directly. `networkidle0` waits for any inline assets
    // (none expected — template has no external resources).
    await page.setContent(html, { waitUntil: "networkidle0" });

    const buffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "18mm", right: "18mm", bottom: "22mm", left: "18mm" },
      preferCSSPageSize: true,
    });

    return buffer;
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch {
        // Don't let cleanup errors mask a real failure upstream.
      }
    }
  }
}

/* ── Browser launch (env-aware) ─────────────────────────────────────────── */

async function launchBrowser(): Promise<Browser> {
  // Vercel sets VERCEL=1 in the function runtime. AWS_LAMBDA_FUNCTION_NAME
  // is set on Lambda. Either signals serverless — use chromium-min.
  const isServerless = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;

  if (isServerless) {
    return puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(CHROMIUM_PACK_URL),
      headless: chromium.headless,
    });
  }

  // Local dev: try to find an existing Chrome install. The user can override
  // with PUPPETEER_EXECUTABLE_PATH if their Chrome lives somewhere unusual.
  const executablePath =
    process.env.PUPPETEER_EXECUTABLE_PATH ?? findLocalChromePath();

  if (!executablePath) {
    throw new Error(
      "Could not locate a Chrome / Chromium executable for PDF generation. " +
        "Set PUPPETEER_EXECUTABLE_PATH in .env.local to point at your local " +
        "Chrome install (e.g. C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe " +
        "on Windows, /Applications/Google Chrome.app/Contents/MacOS/Google Chrome on macOS)."
    );
  }

  return puppeteer.launch({
    headless: true,
    executablePath,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
}

/**
 * Best-effort local Chrome detection. Falls back to undefined if nothing
 * obvious is present — caller will throw with an actionable message.
 */
function findLocalChromePath(): string | undefined {
  // Most common install paths per OS. We don't `fs.existsSync` here because
  // we want this file to be safe to import in edge runtimes; the launcher
  // will surface a clear error if the path is wrong.
  const platform = process.platform;
  if (platform === "win32") {
    return (
      process.env.PROGRAMFILES &&
      `${process.env.PROGRAMFILES}\\Google\\Chrome\\Application\\chrome.exe`
    );
  }
  if (platform === "darwin") {
    return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  }
  // Linux dev
  return "/usr/bin/google-chrome";
}
