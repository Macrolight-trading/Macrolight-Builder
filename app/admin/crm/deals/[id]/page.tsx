import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import DealStageMover from "@/components/admin/crm/DealStageMover";
import LeadActivityComposer from "@/components/admin/crm/LeadActivityComposer";
import LeadNoteComposer from "@/components/admin/crm/LeadNoteComposer";
import ActivityToggle from "@/components/admin/crm/ActivityToggle";
import DeleteDealButton from "@/components/admin/crm/DeleteDealButton";

export const dynamic = "force-dynamic";

const STAGE_STYLES: Record<string, string> = {
  PROSPECT: "bg-gray-100 text-gray-700",
  QUALIFIED: "bg-blue-50 text-blue-700",
  PROPOSAL: "bg-violet-50 text-violet-700",
  NEGOTIATION: "bg-amber-50 text-amber-700",
  WON: "bg-emerald-50 text-emerald-700",
  LOST: "bg-red-50 text-red-700",
};

export default async function DealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const deal = await prisma.deal.findUnique({
    where: { id },
    include: {
      lead: true,
      activities: { orderBy: { createdAt: "desc" } },
      noteRecords: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!deal) notFound();

  return (
    <>
      <div className="mb-6">
        <Link
          href="/admin/crm/deals"
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          &larr; Back to pipeline
        </Link>
      </div>

      <div className="flex items-start justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{deal.title}</h1>
          <p className="mt-1 text-3xl font-extrabold text-emerald-600">
            ${(deal.value / 100).toLocaleString()}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STAGE_STYLES[deal.stage]}`}
            >
              {deal.stage}
            </span>
            <span className="text-xs text-gray-500">
              {deal.probability}% confidence
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/crm/deals/${deal.id}/edit`}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Edit
          </Link>
          <DeleteDealButton dealId={deal.id} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <aside className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
              Details
            </h2>
            <dl className="space-y-2 text-sm">
              <Row label="Stage">{deal.stage}</Row>
              <Row label="Value">
                ${(deal.value / 100).toLocaleString()} {deal.currency.toUpperCase()}
              </Row>
              <Row label="Probability">{deal.probability}%</Row>
              <Row label="Expected close">
                {deal.expectedCloseDate
                  ? new Date(deal.expectedCloseDate).toLocaleDateString()
                  : "—"}
              </Row>
              {deal.closedAt && (
                <Row label="Closed">
                  {new Date(deal.closedAt).toLocaleDateString()}
                </Row>
              )}
              {deal.lostReason && (
                <Row label="Lost reason">{deal.lostReason}</Row>
              )}
              <Row label="Created">
                {new Date(deal.createdAt).toLocaleDateString()}
              </Row>
            </dl>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
              Stage
            </h2>
            <DealStageMover dealId={deal.id} stage={deal.stage} />
          </div>

          {deal.lead && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                Lead
              </h2>
              <Link
                href={`/admin/crm/leads/${deal.lead.id}`}
                className="block group"
              >
                <p className="text-sm font-medium text-gray-900 group-hover:text-violet-700">
                  {deal.lead.name}
                </p>
                {deal.lead.company && (
                  <p className="text-xs text-gray-500">{deal.lead.company}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">{deal.lead.email}</p>
              </Link>
            </div>
          )}
        </aside>

        <div className="lg:col-span-2 space-y-6">
          {/* Activities */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Activities</h2>
            </div>
            <div className="px-5 py-4">
              <LeadActivityComposer dealId={deal.id} />
            </div>
            <div className="divide-y divide-gray-50">
              {deal.activities.length === 0 ? (
                <p className="px-5 py-8 text-sm text-gray-400 text-center">
                  No activities yet.
                </p>
              ) : (
                deal.activities.map((a) => (
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
              <LeadNoteComposer dealId={deal.id} />
            </div>
            <div className="divide-y divide-gray-50">
              {deal.noteRecords.length === 0 ? (
                <p className="px-5 py-8 text-sm text-gray-400 text-center">
                  No notes yet.
                </p>
              ) : (
                deal.noteRecords.map((n) => (
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
