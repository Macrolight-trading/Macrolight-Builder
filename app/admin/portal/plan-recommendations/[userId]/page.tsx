import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import PlanBuilder from "@/components/portal/PlanBuilder";
import ClearRecommendationButton from "@/components/admin/portal/ClearRecommendationButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Recommend a plan" };

/**
 * Admin editor for a single user's plan recommendation. Reuses the
 * client-facing PlanBuilder in mode="admin" so the admin sees exactly
 * what the client will see when they open /portal/build-plan.
 */
export default async function AdminRecommendUserPage({
  params,
}: {
  params: { userId: string };
}) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "ADMIN") redirect("/admin");

  const [user, options, categories, recommendation] = await Promise.all([
    prisma.user.findUnique({
      where: { id: params.userId },
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
      },
    }),
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
    prisma.planRecommendation.findUnique({
      where: { userId: params.userId },
      include: { items: { select: { optionId: true } } },
    }),
  ]);

  if (!user) notFound();

  const initialSelectedIds = recommendation?.items.map((i) => i.optionId) ?? [];

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/portal/plan-recommendations"
            className="text-xs font-semibold text-gray-500 hover:text-gray-700"
          >
            ← All recommendations
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">
            Recommend a plan
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            For <span className="font-medium text-gray-700">{user.name ?? user.email}</span>
            {user.name && (
              <span className="text-gray-400"> · {user.email}</span>
            )}
          </p>
        </div>
        {recommendation && (
          <ClearRecommendationButton userId={user.id} />
        )}
      </div>

      {options.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-sm text-gray-500">
            No plan options available yet. Add some at{" "}
            <Link
              href="/admin/portal/plan-options"
              className="text-violet-600 font-semibold hover:underline"
            >
              Plan Options
            </Link>{" "}
            first.
          </p>
        </div>
      ) : (
        <PlanBuilder
          currentPlan={user.plan}
          options={JSON.parse(JSON.stringify(options))}
          categories={JSON.parse(JSON.stringify(categories))}
          initialBasePlan={recommendation?.basePlan ?? undefined}
          initialSelectedIds={initialSelectedIds}
          initialNotes={recommendation?.notes ?? ""}
          mode="admin"
          targetUserId={user.id}
        />
      )}
    </>
  );
}
