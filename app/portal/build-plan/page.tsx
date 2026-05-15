import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import PlanBuilder from "@/components/portal/PlanBuilder";

export const dynamic = "force-dynamic";
export const metadata = { title: "Build your plan" };

export default async function BuildPlanPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) redirect("/login?callbackUrl=/portal/build-plan");

  const [user, options, latestPending, categories] = await Promise.all([
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
  ]);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Build your plan</h1>
        <p className="mt-1 text-sm text-gray-500">
          Pick a base plan and tick the services you want. We&apos;ll send back a quote — no charges happen here.
        </p>
      </div>

      {latestPending && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-900">
          You already have a pending plan request from{" "}
          {new Date(latestPending.createdAt).toLocaleDateString()}. Submitting another will not replace it — we&apos;ll review them together.
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
          currentPlan={user?.plan ?? "STARTER"}
          options={JSON.parse(JSON.stringify(options))}
          categories={JSON.parse(JSON.stringify(categories))}
        />
      )}
    </>
  );
}

