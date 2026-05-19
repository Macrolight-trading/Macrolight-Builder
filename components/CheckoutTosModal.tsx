"use client";

import { useEffect, useState } from "react";

/**
 * Pre-checkout confirmation modal. Gates every path that ends in either a
 * Stripe Checkout redirect or an in-place subscription modification —
 * pricing CTAs, the plan builder's "Checkout now" / "Update subscription"
 * button, and the post-signup /checkout/start auto-redirect.
 *
 * The modal forces the user to tick an agreement checkbox before the
 * primary action becomes clickable. Body copy is customizable so callers
 * can tailor it for "new subscription" vs "modify existing".
 */
export default function CheckoutTosModal({
  open,
  onConfirm,
  onCancel,
  title = "Confirm your order",
  description = "By continuing, you'll be sent to Stripe's secure checkout to enter your payment details.",
  confirmLabel = "Continue to checkout",
  busy = false,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  /** Parent can set this while the post-confirm action is in flight so the
   *  user can't double-click. */
  busy?: boolean;
}) {
  const [agreed, setAgreed] = useState(false);

  // Reset the checkbox every time the modal is opened so a previous
  // session's agreement doesn't bleed into the next checkout.
  useEffect(() => {
    if (open) setAgreed(false);
  }, [open]);

  // Esc closes the modal (unless we're busy mid-request).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tos-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
        onClick={() => !busy && onCancel()}
        aria-hidden
      />

      {/* Card */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 sm:p-7 animate-fade-in-up">
        <h2
          id="tos-modal-title"
          className="text-lg font-bold text-gray-900"
        >
          {title}
        </h2>
        <p className="mt-2 text-sm text-gray-500 leading-relaxed">
          {description}
        </p>

        <label className="mt-5 flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            disabled={busy}
            className="mt-0.5 rounded text-violet-600 focus:ring-violet-500"
          />
          <span className="text-sm text-gray-700 leading-snug">
            I agree to the{" "}
            <a
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-violet-700 hover:text-violet-800 underline"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-violet-700 hover:text-violet-800 underline"
            >
              Privacy Policy
            </a>
            .
          </span>
        </label>

        <div className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="px-4 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!agreed || busy}
            className="px-4 py-2.5 text-sm font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? "Processing…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
