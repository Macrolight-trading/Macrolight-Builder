"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import Button from "./Button";

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

  async function go() {
    setError(null);

    // Not signed in → bounce to signup, then resume checkout.
    if (status !== "authenticated") {
      const next = signupRedirect
        ? signupRedirect
        : `/checkout/start?plan=${encodeURIComponent(basePlan)}${
            optionIds && optionIds.length > 0
              ? `&options=${encodeURIComponent(optionIds.join(","))}`
              : ""
          }`;
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
      if (!res.ok || !data?.url) {
        throw new Error(data?.error || "Checkout failed");
      }
      window.location.href = data.url as string;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        className={className}
        onClick={go}
        disabled={loading || status === "loading"}
      >
        {loading ? "Redirecting…" : children}
      </Button>
      {error && (
        <p className="mt-2 text-xs text-red-600 text-center">{error}</p>
      )}
    </>
  );
}
