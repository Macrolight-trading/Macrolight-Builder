import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import PlanRequestsReview from "@/components/admin/PlanRequestsReview";

export const dynamic = "force-dynamic";
export const metadata = { title: "Custom Plan Requests" };

export default async function PlanRequestsPage({
  searchParams,
}: {
  searchParams?: { status?: string };
}) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "ADMIN") redirect("/admin");

  const statusFilter = searchParams?.status?.toUpperCase();
  const validStatuses = ["PENDING", "APPROVED", "REJECTED", "CANCELED"];
  const where =
    statusFilter && validStatuses.includes(statusFilter)
      ? { status: statusFilter as "PENDING" | "APPROVED" | "REJECTED" | "CANCELED" }
      : {};

  const requests = await prisma.customPlanRequest.findMany({
    where,
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: { orderBy: { category: "asc" } },
    },
  });

  const rawCounts = await prisma.customPlanRequest.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  const counts = rawCounts as Array<{ status: string; _count: { _all: number } }>;
  const countMap = Object.fromEntries(
    counts.map((c) => [c.status, c._count._all] as const),
  );

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Custom Plan Requests</h1>
        <p className="mt-1 text-sm text-gray-500">
          Quotes submitted by clients from the build-your-plan page. Approve
          to convert into a payable invoice (manual for now).
        </p>
      </div>

      <PlanRequestsReview
        initialRequests={JSON.parse(JSON.stringify(requests))}
        counts={countMap}
        activeFilter={statusFilter ?? "ALL"}
      />
    </>
  );
}

