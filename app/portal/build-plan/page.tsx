import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import PlanBuilder from "@/components/portal/PlanBuilder";
import { getUserSubscriptionState } from "@/lib/plan-selection";

export const dynamic = "force-dynamic";
export const metadata = { title: "Build your plan" };

export default async function BuildPlanPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) redirect("/login?callbackUrl=/portal/build-plan");

  const [user, options, latestPending, categories, recommendation, subState] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { plan: true },
      }),
      prisma.planOption.findMany({
        where: { active: true },
        orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
      }),
      prisma.customPlanRequest.findFirst({
        where: { userId, status: "PENDING" },
        orderBy: { createdAt: "desc" },
        select: { id: true, createdAt: true },
      }),
      prisma.planCategory.findMany({
        where: { active: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        select: { name: true, label: true, bundleDiscountPct: true, includedFromTier: true, sortOrder: true },
      }),
      // Admin-built recommendation produced after the intro meeting. When
      // present we pre-fill the builder so the client can review, adjust,
      // then submit it back as a plan request.
      prisma.planRecommendation.findUnique({
        where: { userId },
        include: {
          items: { select: { optionId: true } },
        },
      }),
      // Current subscription state — used to pre-check items the user is
      // already paying for and to render the "Update subscription" mode
      // (rather than "Checkout now") when one exists.
      getUserSubscriptionState(userId),
    ]);

  const recommendedIds = recommendation?.items.map((i) => i.optionId) ?? [];
  const hasRecommendation = Boolean(recommendation);
  // "Active" = the fallback in getUserSubscriptionState set a basePlan.
  // We can't rely on subscriptionId being non-null because the canonical
  // Subscription row only exists after customer.subscription.* webhooks
  // fire — most users will be on the User.plan fallback.
  const hasActiveSubscription = Boolean(subState.basePlan);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {hasActiveSubscription ? "Manage your plan" : "Build your plan"}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {hasActiveSubscription
            ? "Add or remove services. We'll prorate the difference and charge or credit your card immediately."
            : hasRecommendation
              ? "We've pre-filled the plan we recommended after our meeting. Review, adjust anything you'd like, and send it back to confirm."
              : "Pick a base plan and tick the services you want. We'll send back a quote — no charges happen here."}
        </p>
      </div>

      {hasRecommendation && (
        <div className="mb-6 bg-violet-50 border border-violet-200 rounded-xl px-4 py-3.5 flex items-start gap-3">
          <div className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-violet-600 text-white flex items-center justify-center">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex-1 text-sm text-violet-900">
            <p className="font-semibold">Your recommended plan is ready</p>
            <p className="mt-0.5 text-violet-800/80">
              Based on our intro call, we&apos;ve put together the base plan and
              add-ons below. Feel free to adjust anything — when you&apos;re happy
              with it, hit{" "}
              <span className="font-semibold">Request quote</span> and we&apos;ll
              confirm the final pricing.
            </p>
            {recommendation?.notes && (
              <p className="mt-2 italic text-violet-900/90">
                &ldquo;{recommendation.notes}&rdquo;
              </p>
            )}
          </div>
        </div>
      )}

      {latestPending && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-900">
          You already have a pending plan request from{" "}
          {new Date(latestPending.createdAt).toLocaleDateString()}.{" "}
          {hasRecommendation ? (
            <>
              The recommendation above is newer and supersedes that earlier
              request — feel free to adjust and submit it as your updated plan.
              We&apos;ll review them together.
            </>
          ) : (
            <>
              Submitting another will not replace it — we&apos;ll review them
              together.
            </>
          )}
        </div>
      )}

      {options.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-sm text-gray-500">
            No plan options are available yet. Please check back soon.
          </p>
        </div>
      ) : (
        <PlanBuilder
          currentPlan={user?.plan ?? "NONE"}
          options={JSON.parse(JSON.stringify(options))}
          categories={JSON.parse(JSON.stringify(categories))}
          initialBasePlan={
            recommendation?.basePlan ?? subState.basePlan ?? undefined
          }
          initialSelectedIds={
            hasRecommendation ? recommendedIds : subState.subscribedOptionIds
          }
          hasActiveSubscription={hasActiveSubscription}
          currentSubscribedOptionIds={subState.subscribedOptionIds}
          currentBasePlan={subState.basePlan ?? undefined}
        />
      )}

      <p className="mt-8 text-xs text-gray-400 max-w-2xl leading-relaxed">
        Standard domain registration is included in every plan. Premium
        domains — short, branded, or specialty TLDs (.io, .ai, .co, etc.) —
        may carry an additional one-time or annual fee at cost. We&apos;ll
        confirm the exact amount with you before purchase.
      </p>
    </>
  );
}

