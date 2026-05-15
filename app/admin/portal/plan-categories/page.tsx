import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import PlanCategoriesManager from "@/components/admin/PlanCategoriesManager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Plan Categories" };

export default async function PlanCategoriesPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "ADMIN") redirect("/admin");

  const [categories, optionCountsRaw] = await Promise.all([
    prisma.planCategory.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    prisma.planOption.groupBy({
      by: ["category"],
      _count: { _all: true },
    }),
  ]);

  const optionCounts: Record<string, number> = {};
  for (const row of optionCountsRaw as Array<{ category: string; _count: { _all: number } }>) {
    optionCounts[row.category] = row._count._all;
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Plan Categories</h1>
        <p className="mt-1 text-sm text-gray-500">
          Group plan options and offer a bundle discount when clients select
          every option in a category. The discount appears automatically in the
          client&apos;s plan builder when they tick all items in the group.
        </p>
      </div>

      <PlanCategoriesManager
        initialCategories={JSON.parse(JSON.stringify(categories))}
        optionCounts={optionCounts}
      />
    </>
  );
}
