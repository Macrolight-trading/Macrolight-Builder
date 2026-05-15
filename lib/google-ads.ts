/**
 * Google Ads Conversion API — server-side offline click conversion upload.
 *
 * Required environment variables:
 *   GOOGLE_ADS_DEVELOPER_TOKEN      — your Google Ads API developer token
 *   GOOGLE_ADS_CUSTOMER_ID          — 10-digit Google Ads customer ID (no dashes)
 *   GOOGLE_ADS_CONVERSION_ACTION_ID — numeric ID of the conversion action
 *   GOOGLE_ADS_OAUTH_CLIENT_ID      — OAuth2 client ID (from Google Cloud Console)
 *   GOOGLE_ADS_OAUTH_CLIENT_SECRET  — OAuth2 client secret
 *   GOOGLE_ADS_OAUTH_REFRESH_TOKEN  — long-lived refresh token from OAuth flow
 *
 * Optional:
 *   GOOGLE_ADS_MANAGER_CUSTOMER_ID  — manager (MCC) account ID if applicable
 */

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const ADS_API_VERSION = "v19";

/** Exchange the refresh token for a short-lived access token. */
async function getAccessToken(): Promise<string> {
  const clientId = process.env.GOOGLE_ADS_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_ADS_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_ADS_OAUTH_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Missing Google Ads OAuth environment variables.");
  }

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google token refresh failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  return data.access_token as string;
}

export interface ConversionPayload {
  /** The gclid query param captured from the landing page URL. */
  gclid: string;
  /** ISO 8601 string — defaults to now. */
  conversionDateTime?: string;
  /** Optional revenue value (e.g. estimated lead value in USD). */
  conversionValue?: number;
  currencyCode?: string;
}

/**
 * Upload a click conversion to Google Ads.
 * Returns true on success, false (with a console.error) on failure so
 * callers don't need try/catch — a conversion ping failing must never
 * break the main request.
 */
export async function uploadGoogleAdsConversion(
  payload: ConversionPayload
): Promise<boolean> {
  const devToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
  const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID;
  const conversionActionId = process.env.GOOGLE_ADS_CONVERSION_ACTION_ID;
  const managerCustomerId = process.env.GOOGLE_ADS_MANAGER_CUSTOMER_ID;

  if (!devToken || !customerId || !conversionActionId) {
    console.warn(
      "[google-ads] Skipping conversion upload — required env vars not set."
    );
    return false;
  }

  try {
    const accessToken = await getAccessToken();

    const conversionDateTime =
      payload.conversionDateTime ??
      new Date()
        .toISOString()
        .replace("T", " ")
        .replace(/\.\d{3}Z$/, "+00:00");

    const conversionAction = `customers/${customerId}/conversionActions/${conversionActionId}`;

    const body = {
      conversions: [
        {
          gclid: payload.gclid,
          conversionAction,
          conversionDateTime,
          ...(payload.conversionValue !== undefined && {
            conversionValue: payload.conversionValue,
            currencyCode: payload.currencyCode ?? "USD",
          }),
        },
      ],
      partialFailure: true,
    };

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      "developer-token": devToken,
    };
    if (managerCustomerId) {
      headers["login-customer-id"] = managerCustomerId;
    }

    const url = `https://googleads.googleapis.com/${ADS_API_VERSION}/customers/${customerId}/conversions:uploadClickConversions`;
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(
        `[google-ads] Conversion upload failed (${res.status}): ${text}`
      );
      return false;
    }

    const data = await res.json();

    // partialFailure errors live in data.partialFailureError
    if (data.partialFailureError) {
      console.error(
        "[google-ads] Partial failure:",
        JSON.stringify(data.partialFailureError)
      );
      return false;
    }

    return true;
  } catch (err) {
    console.error("[google-ads] Conversion upload exception:", err);
    return false;
  }
}
