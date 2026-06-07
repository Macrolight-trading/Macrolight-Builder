"use client";

/**
 * Cookie consent banner. Wired into Google Consent Mode v2:
 *
 *   - `app/layout.tsx` sets the default consent state to "denied" for
 *     ad_storage / ad_user_data / ad_personalization / analytics_storage
 *     BEFORE the Google Ads tag is configured.
 *   - When the visitor clicks "Accept", we call gtag('consent', 'update',
 *     ...) to grant those categories. The Google tag then unblocks itself.
 *   - We persist the choice in localStorage under STORAGE_KEY so we don't
 *     re-prompt on every page load.
 *
 * The banner intentionally does NOT block the page — it appears as a small
 * non-modal card so the visitor can still read the site while deciding.
 */

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "ml-cookie-consent";
type Choice = "accepted" | "rejected";

declare global {
  interface Window {
    // gtag is injected by the Google Ads tag in app/layout.tsx
    gtag?: (...args: unknown[]) => void;
  }
}

function updateConsent(choice: Choice) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }
  const value = choice === "accepted" ? "granted" : "denied";
  window.gtag("consent", "update", {
    ad_storage: value,
    ad_user_data: value,
    ad_personalization: value,
    analytics_storage: value,
  });
}

export default function CookieConsent() {
  // `null` means "we haven't checked localStorage yet" — keeps the server
  // and first client render identical (avoids a hydration mismatch).
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "accepted" || stored === "rejected") {
        // Replay the prior choice on every load so Consent Mode reflects it
        // even when the user navigates away and back.
        updateConsent(stored);
        return;
      }
      setVisible(true);
    } catch {
      // localStorage can throw in private mode / blocked-cookies contexts —
      // in that case, just show the banner and treat any click as
      // session-only.
      setVisible(true);
    }
  }, []);

  function persist(choice: Choice) {
    try {
      window.localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      // Ignore — choice still applies for this session.
    }
    updateConsent(choice);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed inset-x-4 bottom-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50"
    >
      <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl p-5 sm:p-6">
        <p className="text-sm font-semibold text-gray-900">
          We value your privacy
        </p>
        <p className="mt-2 text-sm text-gray-600 leading-relaxed">
          We use essential cookies to run this site. With your consent, we
          also use cookies to measure site usage and ad performance. See our{" "}
          <Link
            href="/privacy#cookies"
            className="text-violet-600 hover:underline font-medium"
          >
            Cookie Policy
          </Link>{" "}
          for details.
        </p>
        <div className="mt-4 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2">
          <button
            type="button"
            onClick={() => persist("rejected")}
            className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Reject non-essential
          </button>
          <button
            type="button"
            onClick={() => persist("accepted")}
            className="px-4 py-2 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
