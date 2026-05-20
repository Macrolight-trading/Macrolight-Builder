import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import PlanBuilder from "@/components/portal/PlanBuilder";

export const dynamic = "force-dynamic";
export const metadata = { title: "Default Plan Template" };

/**
 * Admin editor for the default plan recommendation template.
 * This template is automatically seeded as the PlanRecommendation for every
 * new user that signs up, giving the admin a starting point to customise
 * after the intro call.
 *
 * Uses the same PlanBuilder as per-user recommendations with targetUserId="default",
 * which routes saves to /api/admin/portal/plan-recommendations/default.
 */
export default async function DefaultPlanTemplatePage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "ADMIN") redirect("/admin");

  const [options, categories, template] = await Promise.all([
    prisma.planOption.findMany({
      where: { active: true },
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
    }),
    prisma.planCategory.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        name: true,
        label: true,
        bundleDiscountPct: true,
        includedFromTier: true,
        sortOrder: true,
      },
    }),
    prisma.defaultPlanTemplate.findUnique({
      where: { id: "default" },
      include: { items: { select: { optionId: true } } },
    }),
  ]);

  const initialSelectedIds = template?.items.map((i) => i.optionId) ?? [];
  const initialBasePlan = template?.basePlan ?? "STARTER";
  const initialNotes = template?.notes ?? "";

  return (
    <>
      <div className="mb-6">
        <Link
          href="/admin/portal/plan-recommendations"
          className="text-xs font-semibold text-gray-500 hover:text-gray-700"
        >
          ← All recommendations
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          Default plan template
        </h1>
        <p className="mt-1 text-sm text-gray-500 max-w-2xl">
          This template is applied automatically when a new user signs up. Their{" "}
          <span className="font-medium text-gray-700">Build a Plan</span> page
          will be pre-populated with this base plan and add-ons. You can then
          customise each client&apos;s recommendation individually from the{" "}
          <Link
            href="/admin/portal/plan-recommendations"
            className="text-violet-600 hover:underline"
          >
            recommendations list
          </Link>
          .
        </p>
      </div>

      <PlanBuilder
        currentPlan="NONE"
        options={options}
        categories={categories}
        initialBasePlan={initialBasePlan}
        initialSelectedIds={initialSelectedIds}
        initialNotes={initialNotes}
        mode="admin"
        targetUserId="default"
      />
    </>
  );
}
