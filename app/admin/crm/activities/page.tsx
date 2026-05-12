import prisma from "@/lib/prisma";
import Link from "next/link";
import ActivityToggle from "@/components/admin/crm/ActivityToggle";

export const dynamic = "force-dynamic";

const TYPE_STYLES: Record<string, string> = {
  CALL: "bg-emerald-50 text-emerald-700",
  EMAIL: "bg-blue-50 text-blue-700",
  MEETING: "bg-violet-50 text-violet-700",
  TASK: "bg-amber-50 text-amber-700",
  NOTE: "bg-gray-100 text-gray-700",
};

export default async function ActivitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const params = await searchParams;
  const filter = params.filter || "open";

  const where: Record<string, unknown> = {};
  if (filter === "open") where.completedAt = null;
  if (filter === "done") where.completedAt = { not: null };
  if (filter === "overdue") {
    where.completedAt = null;
    where.dueDate = { lt: new Date() };
  }

  const activities = await prisma.activity.findMany({
    where,
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    include: {
      lead: { select: { id: true, name: true, company: true } },
      deal: { select: { id: true, title: true } },
    },
  });

  const filters = [
    { id: "open", label: "Open" },
    { id: "overdue", label: "Overdue" },
    { id: "done", label: "Done" },
    { id: "all", label: "All" },
  ];

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Activities</h1>
        <p className="mt-1 text-sm text-gray-500">
          {activities.length} activit{activities.length !== 1 ? "ies" : "y"}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((f) => (
          <Link
            key={f.id}
            href={`/admin/crm/activities?filter=${f.id}`}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              filter === f.id
                ? "bg-gray-900 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {activities.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-gray-400">
            Nothing here. Go relax for a minute.
          </p>
        ) : (
          <div className="divide-y divide-gray-50">
            {activities.map((a) => {
              const overdue =
                !a.completedAt && a.dueDate && new Date(a.dueDate) < new Date();
              return (
                <div
                  key={a.id}
                  className="px-5 py-4 flex items-start gap-3 hover:bg-gray-50/40"
                >
                  <ActivityToggle
                    activityId={a.id}
                    completed={Boolean(a.completedAt)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${TYPE_STYLES[a.type] || "bg-gray-100 text-gray-700"}`}
                      >
                        {a.type}
                      </span>
                      <p
                        className={`text-sm font-medium ${a.completedAt ? "line-through text-gray-400" : "text-gray-900"}`}
                      >
                        {a.subject}
                      </p>
                      {overdue && (
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                          Overdue
                        </span>
                      )}
                    </div>
                    {a.description && (
                      <p className="mt-1 text-xs text-gray-500">
                        {a.description}
                      </p>
                    )}
                    <p className="mt-1 text-[11px] text-gray-400">
                      {a.lead && (
                        <Link
                          href={`/admin/crm/leads/${a.lead.id}`}
                          className="text-violet-600 hover:underline"
                        >
                          {a.lead.name}
                          {a.lead.company ? ` (${a.lead.company})` : ""}
                        </Link>
                      )}
                      {a.lead && a.deal && " · "}
                      {a.deal && (
                        <Link
                          href={`/admin/crm/deals/${a.deal.id}`}
                          className="text-violet-600 hover:underline"
                        >
                          {a.deal.title}
                        </Link>
                      )}
                      {a.dueDate && (
                        <>
                          {(a.lead || a.deal) && " · "}
                          due {new Date(a.dueDate).toLocaleDateString()}
                        </>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
