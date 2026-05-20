"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import Button from "./Button";
import CheckoutTosModal from "./CheckoutTosModal";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

interface CheckoutButtonProps {
  /** Plan enum key — "STARTER" | "GROWTH" | "PRO". */
  basePlan: string;
  /** Add-on PlanOption IDs to include in the checkout (optional). */
  optionIds?: string[];
  /** Label shown on the button. */
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
  /** Override the path users land on after a successful checkout. Defaults
   *  to /portal/billing?checkout=success. */
  successUrl?: string;
  /** Where to send logged-out users. Defaults to /signup with a query
   *  param that the post-signup handoff page reads. */
  signupRedirect?: string;
}

/**
 * Smart "subscribe / checkout" button used on /pricing and the plan
 * builder. Routes based on auth state:
 *   - Logged-in: POSTs the selection to /api/stripe/checkout and
 *     redirects to the returned Stripe URL.
 *   - Logged-out: redirects to /signup with ?plan and ?next so the user
 *     can create an account and finish checkout in one flow.
 */
export default function CheckoutButton({
  basePlan,
  optionIds,
  children,
  variant = "primary",
  size = "lg",
  fullWidth,
  className,
  successUrl,
  signupRedirect,
}: CheckoutButtonProps) {
  const router = useRouter();
  const { status } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tosOpen, setTosOpen] = useState(false);

  function openTos() {
    setError(null);
    setTosOpen(true);
  }

  async function confirm() {
    // Not signed in → bounce to signup, then resume checkout. The TOS
    // checkbox here covers the intent to subscribe; the user will see
    // the signup form next and complete payment via Stripe afterwards.
    if (status !== "authenticated") {
      const next = signupRedirect
        ? signupRedirect
        : `/checkout/start?plan=${encodeURIComponent(basePlan)}${
            optionIds && optionIds.length > 0
              ? `&options=${encodeURIComponent(optionIds.join(","))}`
              : ""
          }`;
      // Mark TOS as accepted so the post-signup /checkout/start handoff
      // doesn't re-prompt the user.
      sessionStorage.setItem("checkoutTosAccepted", "1");
      router.push(
        `/signup?plan=${encodeURIComponent(basePlan)}&next=${encodeURIComponent(next)}`,
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          basePlan,
          optionIds: optionIds ?? [],
          successUrl,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || "Checkout failed");
      }
      if (!data?.url) {
        throw new Error("Checkout failed: no redirect URL returned");
      }
      window.location.href = data.url as string;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
      setLoading(false);
      setTosOpen(false);
    }
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        className={className}
        onClick={openTos}
        disabled={loading || status === "loading"}
      >
        {loading ? "Redirecting…" : children}
      </Button>
      {error && (
        <p className="mt-2 text-xs text-red-600 text-center">{error}</p>
      )}
      <CheckoutTosModal
        open={tosOpen}
        onCancel={() => !loading && setTosOpen(false)}
        onConfirm={confirm}
        busy={loading}
        title="Confirm your subscription"
        description={
          status === "authenticated"
            ? "By continuing, you authorize Macrolight Builder to charge your payment method via Stripe and confirm you've read and accepted our Terms and Privacy Policy."
            : "Tick to agree, then you'll create an account and finish payment through Stripe's secure checkout."
        }
        confirmLabel={
          status === "authenticated" ? "Continue to checkout" : "Agree and sign up"
        }
      />
    </>
  );
}
