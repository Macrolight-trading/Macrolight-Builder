/**
 * Shared DataForSEO HTTP client.
 *
 * Used by backlinks, domain-analytics, and serp-visibility modules so the
 * auth header construction, timeout handling, and error-detection logic live
 * in one place.
 */

export const DATAFORSEO_BASE_URL = "https://api.dataforseo.com/v3";
export const REQUEST_TIMEOUT_MS = 30_000;

// ── Response shape ────────────────────────────────────────────────────────────

export interface DataForSeoResponse {
  status_code?: number;
  status_message?: string;
  tasks_error?: number;
  tasks?: Array<{
    id?: string;
    status_code?: number;
    status_message?: string;
    result?: unknown[];
  }>;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

/**
 * Build Basic-auth headers from env vars.
 * Throws (module becomes "unavailable") when credentials are absent.
 */
export function buildAuthHeaders(): Record<string, string> {
  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;
  if (!login || !password) {
    throw new Error(
      "DataForSEO credentials not configured (DATAFORSEO_LOGIN / DATAFORSEO_PASSWORD)"
    );
  }
  const auth = Buffer.from(`${login}:${password}`).toString("base64");
  return {
    Authorization: `Basic ${auth}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

export function hasCredentials(): boolean {
  return !!(process.env.DATAFORSEO_LOGIN && process.env.DATAFORSEO_PASSWORD);
}

// ── HTTP ──────────────────────────────────────────────────────────────────────

/**
 * POST to a DataForSEO endpoint. Checks the top-level HTTP status and the
 * top-level status_code field, but NOT task-level codes (use
 * callDataForSeoWithTaskCheck for that).
 */
export async function callDataForSeo(
  path: string,
  payload: unknown[],
  headers: Record<string, string>
): Promise<DataForSeoResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${DATAFORSEO_BASE_URL}${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(
        `DataForSEO ${path} returned HTTP ${res.status}: ${body.slice(0, 200)}`
      );
    }

    const data = (await res.json()) as DataForSeoResponse;

    // DataForSEO wraps errors in a 200 with status_code >= 40000.
    if (data.status_code && data.status_code >= 40000) {
      throw new Error(
        `DataForSEO ${path} status ${data.status_code}: ${data.status_message ?? "unknown"}`
      );
    }

    return data;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Like callDataForSeo but also checks the task-level status_code.
 * DataForSEO returns HTTP 200 with tasks[0].status_code = 40204 for
 * subscription errors — the top-level check alone misses those.
 */
export async function callDataForSeoWithTaskCheck(
  path: string,
  payload: unknown[],
  headers: Record<string, string>
): Promise<DataForSeoResponse> {
  const data = await callDataForSeo(path, payload, headers);
  const task = data.tasks?.[0];
  if (task?.status_code && task.status_code >= 40000) {
    throw new Error(
      `DataForSEO task error ${task.status_code}: ${task.status_message ?? "unknown"}`
    );
  }
  return data;
}

// ── Utilities ─────────────────────────────────────────────────────────────────

export function extractDomain(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function numericOrNull(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}
