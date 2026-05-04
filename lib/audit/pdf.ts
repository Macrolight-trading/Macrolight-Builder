import type { AuditRunResult } from "./types";

/**
 * PDF report generator.
 *
 * STATUS: Scaffolding stub.
 *
 * Production implementation (per plan section 8) will:
 *   - Render the printable report at /admin/audits/[id]/report
 *   - Use Puppeteer (or `@sparticuz/chromium` for Vercel) to convert that
 *     route to PDF — keeps the report's HTML/CSS as the single source of
 *     truth for design
 *   - Upload the resulting PDF to Vercel Blob (or S3) and return its public URL
 *   - Persist the URL to AuditResult.pdfUrl
 *
 * The branded PDF includes:
 *   1. Cover page (logo, client, URL, date, overall score)
 *   2. Executive summary + score chart
 *   3. Top 3-5 critical issues
 *   4. Module sections
 *   5. "What's working" positives
 *   6. Next-steps / CTA pitching Macrolight
 */

export interface GeneratePdfOptions {
  /** Audit job ID — used to construct the report URL Puppeteer will render. */
  jobId: string;
  result: AuditRunResult;
  clientName: string;
  url: string;
  /**
   * Base URL of the running app (e.g. https://macrolightbuilders.com).
   * Required because Puppeteer needs to load the report page over HTTP.
   */
  appBaseUrl: string;
}

export interface GeneratePdfResult {
  /** Public URL of the uploaded PDF. */
  pdfUrl: string;
  /** Size in bytes (for logging / display). */
  sizeBytes: number;
}

/**
 * STUB: Generate a branded PDF audit report.
 *
 * Throws on call so we don't silently store a fake URL.
 */
export async function generateAuditPdf(
  options: GeneratePdfOptions
): Promise<GeneratePdfResult> {
  void options;

  // TODO(milestone-4): real implementation using Puppeteer to render
  // `${appBaseUrl}/admin/audits/${jobId}/report` and upload the buffer.
  throw new Error(
    "PDF generation is not yet implemented. " +
      "Wire up Puppeteer + blob storage in Milestone 4."
  );
}
