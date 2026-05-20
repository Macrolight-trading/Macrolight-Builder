import prisma from "@/lib/prisma";
import { basePlanCents } from "@/lib/pricing";
import { generateSowPdf } from "./pdf";

/**
 * Build a SOW PDF for an existing CustomPlanRequest, upload to Vercel Blob,
 * and persist the URL back to the request. Returns the URL on success and
 * null on failure (caller decides whether to surface the error to the user).
 *
 * Used by /api/stripe/checkout to generate the SOW before redirecting the
 * user to Stripe — so the document exists at the moment of acceptance, not
 * after.
 */
export async function generateAndStoreSowForRequest(
  planRequestId: string,
): Promise<string | null> {
  const req = await prisma.customPlanRequest.findUnique({
    where: { id: planRequestId },
    include: {
      items: true,
      user: { select: { name: true, email: true } },
    },
  });
  if (!req) {
    console.warn("SOW: plan request not found", planRequestId);
    return null;
  }

  const base = basePlanCents(req.basePlan);
  if (!base) {
    console.warn("SOW: unknown base plan", req.basePlan);
    return null;
  }

  const pdfBuffer = await generateSowPdf({
    requestId: req.id,
    client: {
      name: req.user.name ?? "",
      email: req.user.email,
    },
    basePlan: {
      key: req.basePlan,
      label: base.name,
      buildCents: base.buildCents,
      monthlyCents: base.monthlyCents,
    },
    items: req.items.map((i) => ({
      name: i.nameSnapshot,
      category: i.category,
      billing: i.billingType,
      priceCents: i.priceCents,
      included: i.includedInBasePlan,
    })),
    totals: {
      monthlyCents: req.monthlyCents,
      oneTimeCents: req.oneTimeCents,
      bundleDiscountCents: req.bundleDiscountCents,
    },
    notes: req.notes,
    issuedAt: new Date(),
    stripeSubscriptionId: req.stripeSubscriptionId,
  });

  // Dynamic import so @vercel/blob isn't pulled into bundles that don't
  // need it. Store is configured "private" — Vercel still returns a long
  // unguessable URL that we share with the customer; it just doesn't
  // appear in any public listing.
  const { put } = await import("@vercel/blob");
  const blob = await put(`sows/${req.id}.pdf`, Buffer.from(pdfBuffer), {
    access: "private",
    contentType: "application/pdf",
  });

  await prisma.customPlanRequest.update({
    where: { id: req.id },
    data: {
      sowPdfUrl: blob.url,
      sowGeneratedAt: new Date(),
    },
  });

  return blob.url;
}
