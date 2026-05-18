import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Plan Recommendations" };

/**
 * Index of every client and the plan recommendation (if any) we've put
 * together for them after the intro meeting. Clicking through opens an
 * editor that pre-fills the same plan builder UI clients see.
 */
export default async function AdminPlanRecommendationsPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "ADMIN") redirect("/admin");

  const users = await prisma.user.findMany({
    where: { role: "USER" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      plan: true,
      createdAt: true,
      planRecommendation: {
        select: {
          basePlan: true,
          updatedAt: true,
          _count: { select: { items: true } },
        },
      },
    },
  });

  const withRec = users.filter((u) => u.planRecommendation).length;

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Plan Recommendations</h1>
        <p className="mt-1 text-sm text-gray-500">
          Build a recommended base plan and add-on bundle for each client
          after their intro meeting. The recommendation pre-populates their{" "}
          <span className="text-gray-700 font-medium">Build a Plan</span>{" "}
          page so they can review, adjust, and submit it back as a quote
          request.
        </p>
        <p className="mt-3 text-xs text-gray-400">
          {withRec} of {users.length} client{users.length === 1 ? "" : "s"} have a recommendation.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {users.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-16">No clients yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Client</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Current plan</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Recommendation</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Add-ons</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Updated</th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => {
                  const rec = user.planRecommendation;
                  return (
                    <tr key={user.id} className="hover:bg-gray-50/50">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-gray-900">{user.name ?? "—"}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          {user.plan}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {rec ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-700">
                            {rec.basePlan}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">Not set</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-gray-700">
                        {rec ? (
                          <span className="text-sm">{rec._count.items}</span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-400">
                        {rec
                          ? new Date(rec.updatedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <Link
                          href={`/admin/portal/plan-recommendations/${user.id}`}
                          className="text-xs font-semibold text-violet-600 hover:text-violet-700"
                        >
                          {rec ? "Edit →" : "Recommend →"}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
