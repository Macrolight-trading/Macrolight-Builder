/**
 * Google Ads conversion helper — client-side only.
 *
 * Fires the "Submit lead form" conversion event (AW-18165743878/lvlNCP6h4K0cEIaCjdZD).
 * Safe to call even if gtag hasn't loaded yet (no-ops gracefully).
 *
 * @param redirectUrl Optional URL to navigate to after the conversion ping
 *                    is acknowledged by Google.
 */
export function reportAdConversion(redirectUrl?: string): void {
  if (typeof window === "undefined") return;

  const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof gtag !== "function") return;

  const callback = redirectUrl
    ? () => { window.location.href = redirectUrl; }
    : undefined;

  gtag("event", "conversion", {
    send_to: "AW-18165743878/lvlNCP6h4K0cEIaCjdZD",
    value: 1.0,
    currency: "USD",
    ...(callback ? { event_callback: callback } : {}),
  });
}
