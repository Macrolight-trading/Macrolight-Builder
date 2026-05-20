"use client";

import Script from "next/script";

/**
 * Microsoft Clarity — session recordings, heatmaps, and rage/dead-click
 * detection. Free and unlimited.
 *
 * Setup:
 *   1. Sign up at https://clarity.microsoft.com and create a project.
 *   2. Copy the Project ID (it's the short alphanumeric token in the
 *      install snippet, NOT the full snippet).
 *   3. Add to .env.local (and your hosting provider's env vars):
 *        NEXT_PUBLIC_CLARITY_PROJECT_ID=xxxxxxxxxx
 *   4. Redeploy. Recordings begin within a few minutes.
 *
 * If the env var is missing this component renders nothing — safe to ship
 * before you've created the Clarity project.
 *
 * Privacy: Clarity masks form inputs, sensitive text, and PII by default.
 * If you later want to gate it behind your CookieConsent flow, call
 * `window.clarity('consent')` after the visitor accepts analytics cookies.
 */
export default function Clarity() {
  const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
  if (!projectId) return null;

  // Project ID is interpolated into a string literal in the official
  // snippet, so we validate it's a simple alphanumeric token to avoid
  // any chance of script injection from a misconfigured env var.
  if (!/^[a-z0-9]+$/i.test(projectId)) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn(
        "[Clarity] NEXT_PUBLIC_CLARITY_PROJECT_ID is set but does not look " +
          "like a valid project ID (expected alphanumeric).",
      );
    }
    return null;
  }

  return (
    <Script
      id="ms-clarity"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `(function(c,l,a,r,i,t,y){
  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "${projectId}");`,
      }}
    />
  );
}
