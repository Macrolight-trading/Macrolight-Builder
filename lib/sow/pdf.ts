import puppeteer, { type Browser } from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";

import { buildSowHtml, type SowData } from "./template";

/**
 * SOW PDF generator. Renders the SOW HTML via headless Chrome and returns a
 * Uint8Array of the PDF.
 *
 * Mirrors the env-aware browser launcher used by lib/audit/pdf.ts —
 * Sparticuz chromium-min on Vercel/Lambda, a local Chrome install in dev.
 */

const CHROMIUM_PACK_URL =
  "https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar";

export async function generateSowPdf(data: SowData): Promise<Uint8Array> {
  const html = buildSowHtml(data);
  let browser: Browser | null = null;
  try {
    browser = await launchBrowser();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const buffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
      preferCSSPageSize: true,
    });
    return buffer;
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch {
        // swallow — don't mask upstream failure
      }
    }
  }
}

async function launchBrowser(): Promise<Browser> {
  const isServerless =
    !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;

  if (isServerless) {
    return puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(CHROMIUM_PACK_URL),
      headless: chromium.headless,
    });
  }

  const executablePath =
    process.env.PUPPETEER_EXECUTABLE_PATH ?? findLocalChromePath();

  if (!executablePath) {
    throw new Error(
      "Could not locate a Chrome / Chromium executable for SOW PDF generation. " +
        "Set PUPPETEER_EXECUTABLE_PATH in .env.local to your local Chrome path.",
    );
  }

  return puppeteer.launch({
    headless: true,
    executablePath,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
}

function findLocalChromePath(): string | undefined {
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
  return "/usr/bin/google-chrome";
}
