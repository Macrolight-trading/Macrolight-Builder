import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  const contacts = await prisma.contact.findMany({
    orderBy: { createdAt: "desc" },
  });

  const statusCounts = await prisma.contact.groupBy({
    by: ["status"],
    _count: true,
  });

  const statusStyles: Record<string, string> = {
    NEW: "bg-blue-50 text-blue-700",
    READ: "bg-amber-50 text-amber-700",
    REPLIED: "bg-emerald-50 text-emerald-700",
    ARCHIVED: "bg-gray-100 text-gray-500",
  };

  const newCount =
    statusCounts.find((s: { status: string; _count: number }) => s.status === "NEW")?._count || 0;

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
        <p className="mt-1 text-sm text-gray-500">
          {contacts.length} submission{contacts.length !== 1 ? "s" : ""}
          {newCount > 0 && (
            <>
              {" "}
              &middot;{" "}
              <span className="text-blue-600 font-medium">
                {newCount} new
              </span>
            </>
          )}
        </p>
      </div>

      {/* Status filter pills */}
      <div className="flex gap-2 mb-6">
        {(["NEW", "READ", "REPLIED", "ARCHIVED"] as const).map((status) => {
          const count =
            statusCounts.find((s: { status: string; _count: number }) => s.status === status)?._count || 0;
          return (
            <span
              key={status}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[status]}`}
            >
              {status}
              <span className="opacity-60">{count}</span>
            </span>
          );
        })}
      </div>

      <div className="space-y-3">
        {contacts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 px-5 py-12 text-center">
            <p className="text-sm text-gray-400">
              No contact submissions yet.
            </p>
          </div>
        ) : (
          contacts.map((c: {
            id: string;
            name: string;
            email: string;
            phone: string | null;
            company: string | null;
            industry: string | null;
            message: string;
            status: string;
            createdAt: Date;
          }) => (
            <div
              key={c.id}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-sm font-semibold text-gray-900">
                      {c.name}
                    </h3>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                        statusStyles[c.status]
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 mb-3">
                    <span>{c.email}</span>
                    {c.phone && <span>{c.phone}</span>}
                    {c.company && <span>{c.company}</span>}
                    {c.industry && (
                      <span className="capitalize">{c.industry}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                    {c.message}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs text-gray-400">
                    {new Date(c.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-[10px] text-gray-300 mt-0.5">
                    {new Date(c.createdAt).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
