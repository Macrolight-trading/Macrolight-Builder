import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Client Projects" };

const STAGE_LABELS: Record<string, string> = {
  ONBOARDING: "Onboarding",
  DESIGN: "Design",
  DEVELOPMENT: "Development",
  REVIEW: "Review",
  LAUNCHED: "Launched",
};

const STAGE_COLORS: Record<string, string> = {
  ONBOARDING: "bg-gray-100 text-gray-700",
  DESIGN: "bg-blue-50 text-blue-700",
  DEVELOPMENT: "bg-amber-50 text-amber-700",
  REVIEW: "bg-violet-50 text-violet-700",
  LAUNCHED: "bg-emerald-50 text-emerald-700",
};

export default async function AdminProjectsPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "ADMIN") redirect("/admin");

  // Get all users (clients) with their project and onboarding status
  const users = await prisma.user.findMany({
    where: { role: "USER" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      plan: true,
      createdAt: true,
      project: { select: { stage: true, liveUrl: true, updatedAt: true } },
      onboarding: { select: { completedAt: true, businessName: true } },
    },
  });

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Client Projects</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage build stages and leave notes for each client.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {users.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-16">No clients yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Client</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Business</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Plan</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Stage</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Onboarding</th>
                <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => {
                const stage = user.project?.stage ?? "ONBOARDING";
                return (
                  <tr key={user.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-900">{user.name ?? "—"}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </td>
                    <td className="px-5 py-3.5 text-gray-700">
                      {user.onboarding?.businessName ?? <span className="text-gray-400">Not set</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-semibold uppercase text-gray-500">
                        {user.plan}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STAGE_COLORS[stage] ?? ""}`}>
                        {STAGE_LABELS[stage] ?? stage}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {user.onboarding?.completedAt ? (
                        <span className="text-xs text-emerald-600 font-medium">✓ Complete</span>
                      ) : (
                        <span className="text-xs text-amber-600">Pending</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/admin/portal/projects/${user.id}`}
                        className="text-xs font-semibold text-violet-600 hover:text-violet-700"
                      >
                        Manage →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
