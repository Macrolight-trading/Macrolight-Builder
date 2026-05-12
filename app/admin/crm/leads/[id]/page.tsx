import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import LeadStatusControl from "@/components/admin/crm/LeadStatusControl";
import LeadActivityComposer from "@/components/admin/crm/LeadActivityComposer";
import LeadNoteComposer from "@/components/admin/crm/LeadNoteComposer";
import ActivityToggle from "@/components/admin/crm/ActivityToggle";
import DeleteLeadButton from "@/components/admin/crm/DeleteLeadButton";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  NEW: "bg-blue-50 text-blue-700",
  CONTACTED: "bg-amber-50 text-amber-700",
  QUALIFIED: "bg-violet-50 text-violet-700",
  CONVERTED: "bg-emerald-50 text-emerald-700",
  UNQUALIFIED: "bg-gray-100 text-gray-500",
  LOST: "bg-red-50 text-red-700",
};

const STAGE_STYLES: Record<string, string> = {
  PROSPECT: "bg-gray-100 text-gray-700",
  QUALIFIED: "bg-blue-50 text-blue-700",
  PROPOSAL: "bg-violet-50 text-violet-700",
  NEGOTIATION: "bg-amber-50 text-amber-700",
  WON: "bg-emerald-50 text-emerald-700",
  LOST: "bg-red-50 text-red-700",
};

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      contact: true,
      deals: { orderBy: { createdAt: "desc" } },
      activities: { orderBy: { createdAt: "desc" } },
      noteRecords: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!lead) notFound();

  return (
    <>
      <div className="mb-6">
        <Link
          href="/admin/crm/leads"
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          &larr; Back to leads
        </Link>
      </div>

      <div className="flex items-start justify-between gap-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-2xl bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-xl">
            {lead.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{lead.name}</h1>
            <p className="mt-1 text-sm text-gray-500">
              {lead.jobTitle && <span>{lead.jobTitle} &middot; </span>}
              {lead.company || lead.email}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_STYLES[lead.status]}`}
              >
                {lead.status}
              </span>
              {lead.source && (
                <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  {lead.source}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/crm/leads/${lead.id}/edit`}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Edit
          </Link>
          <DeleteLeadButton leadId={lead.id} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: facts */}
        <aside className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
              Contact
            </h2>
            <dl className="space-y-2 text-sm">
              <Row label="Email">
                <a
                  href={`mailto:${lead.email}`}
                  className="text-blue-600 hover:underline"
                >
                  {lead.email}
                </a>
              </Row>
              <Row label="Phone">
                {lead.phone ? (
                  <a
                    href={`tel:${lead.phone}`}
                    className="text-blue-600 hover:underline"
                  >
                    {lead.phone}
                  </a>
                ) : (
                  "—"
                )}
              </Row>
              <Row label="Website">
                {lead.website ? (
                  <a
                    href={lead.website}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {lead.website}
                  </a>
                ) : (
                  "—"
                )}
              </Row>
              <Row label="Industry">{lead.industry || "—"}</Row>
              <Row label="Value">
                {lead.value != null
                  ? `$${(lead.value / 100).toLocaleString()}`
                  : "—"}
              </Row>
              <Row label="Added">
                {new Date(lead.createdAt).toLocaleDateString()}
              </Row>
              {lead.lastContactedAt && (
                <Row label="Last contact">
                  {new Date(lead.lastContactedAt).toLocaleDateString()}
                </Row>
              )}
            </dl>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
              Update Status
            </h2>
            <LeadStatusControl leadId={lead.id} status={lead.status} />
          </div>

          {lead.contact && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                Original Submission
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                {lead.contact.message}
              </p>
              <p className="mt-3 text-xs text-gray-400">
                Submitted {new Date(lead.contact.createdAt).toLocaleString()}
              </p>
            </div>
          )}
        </aside>

        {/* Right columns */}
        <div className="lg:col-span-2 space-y-6">
          {lead.description && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                Notes
              </h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {lead.description}
              </p>
            </div>
          )}

          {/* Deals */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Deals</h2>
              <Link
                href={`/admin/crm/deals/new?leadId=${lead.id}`}
                className="text-xs font-semibold text-violet-600 hover:text-violet-700"
              >
                + New deal
              </Link>
            </div>
            {lead.deals.length === 0 ? (
              <p className="px-5 py-8 text-sm text-gray-400 text-center">
                No deals yet.
              </p>
            ) : (
              <div className="divide-y divide-gray-50">
                {lead.deals.map((d) => (
                  <Link
                    key={d.id}
                    href={`/admin/crm/deals/${d.id}`}
                    className="px-5 py-3 flex items-center justify-between hover:bg-gray-50/60"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {d.title}
                      </p>
                      <p className="text-xs text-gray-400">
                        ${(d.value / 100).toLocaleString()} &middot;{" "}
                        {d.probability}% confidence
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STAGE_STYLES[d.stage]}`}
                    >
                      {d.stage}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Activities */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Activities</h2>
            </div>
            <div className="px-5 py-4">
              <LeadActivityComposer leadId={lead.id} />
            </div>
            <div className="divide-y divide-gray-50">
              {lead.activities.length === 0 ? (
                <p className="px-5 py-8 text-sm text-gray-400 text-center">
                  No activities logged yet.
                </p>
              ) : (
                lead.activities.map((a) => (
                  <div key={a.id} className="px-5 py-3 flex items-start gap-3">
                    <ActivityToggle
                      activityId={a.id}
                      completed={Boolean(a.completedAt)}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium ${a.completedAt ? "line-through text-gray-400" : "text-gray-900"}`}
                      >
                        {a.subject}
                      </p>
                      {a.description && (
                        <p className="mt-0.5 text-xs text-gray-500">
                          {a.description}
                        </p>
                      )}
                      <p className="mt-1 text-[11px] text-gray-400">
                        {a.type}
                        {a.dueDate && (
                          <>
                            {" "}&middot; due {new Date(a.dueDate).toLocaleDateString()}
                          </>
                        )}
                        {a.completedAt && (
                          <>
                            {" "}&middot; done {new Date(a.completedAt).toLocaleDateString()}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Notes</h2>
            </div>
            <div className="px-5 py-4">
              <LeadNoteComposer leadId={lead.id} />
            </div>
            <div className="divide-y divide-gray-50">
              {lead.noteRecords.length === 0 ? (
                <p className="px-5 py-8 text-sm text-gray-400 text-center">
                  No notes yet.
                </p>
              ) : (
                lead.noteRecords.map((n) => (
                  <div key={n.id} className="px-5 py-3">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {n.body}
                    </p>
                    <p className="mt-1 text-[11px] text-gray-400">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-xs text-gray-400">{label}</dt>
      <dd className="text-right text-gray-700">{children}</dd>
    </div>
  );
}
