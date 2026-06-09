import Link from "next/link";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lead = await prisma.lead.findUnique({
    where: { id },
    select: { name: true },
  });

  return {
    title: lead ? `${lead.name} Lead` : "Lead",
  };
}

export default async function PortalLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return null;

  const { id } = await params;

  const lead = await prisma.lead.findFirst({
    where: { id, ownerId: userId },
    include: {
      contact: true,
      deals: { orderBy: { createdAt: "desc" } },
      activities: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!lead) notFound();

  return (
    <>
      <div className="mb-6">
        <Link href="/portal/leads" className="text-xs text-gray-500 hover:text-gray-700">
          ← Back to leads
        </Link>
      </div>

      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-xl font-bold text-violet-700">
            {lead.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{lead.name}</h1>
            <p className="mt-1 text-sm text-gray-500">
              {lead.jobTitle ? `${lead.jobTitle} · ` : ""}
              {lead.company || lead.email}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_STYLES[lead.status]}`}
              >
                {lead.status}
              </span>
              {lead.source ? (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                  {lead.source}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <aside className="space-y-6">
          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Contact
            </h2>
            <dl className="space-y-2 text-sm">
              <DetailRow label="Email">
                <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">
                  {lead.email}
                </a>
              </DetailRow>
              <DetailRow label="Phone">
                {lead.phone ? (
                  <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline">
                    {lead.phone}
                  </a>
                ) : (
                  "—"
                )}
              </DetailRow>
              <DetailRow label="Website">
                {lead.website ? (
                  <a
                    href={lead.website}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="break-all text-blue-600 hover:underline"
                  >
                    {lead.website}
                  </a>
                ) : (
                  "—"
                )}
              </DetailRow>
              <DetailRow label="Industry">{lead.industry || "—"}</DetailRow>
              <DetailRow label="Estimated value">
                {lead.value != null
                  ? `$${(lead.value / 100).toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}`
                  : "—"}
              </DetailRow>
              <DetailRow label="Added">
                {new Date(lead.createdAt).toLocaleString()}
              </DetailRow>
              {lead.lastContactedAt ? (
                <DetailRow label="Last contacted">
                  {new Date(lead.lastContactedAt).toLocaleString()}
                </DetailRow>
              ) : null}
            </dl>
          </section>

          {lead.contact ? (
            <section className="rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Original submission
              </h2>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                {lead.contact.message}
              </p>
              <p className="mt-3 text-xs text-gray-400">
                Submitted {new Date(lead.contact.createdAt).toLocaleString()}
              </p>
            </section>
          ) : null}
        </aside>

        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Notes
            </h2>
            <p className="whitespace-pre-wrap text-sm text-gray-700">
              {lead.description || "No notes have been added yet."}
            </p>
          </section>

          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-gray-900">Deals</h2>
            </div>
            {lead.deals.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-gray-400">
                No deals have been linked to this lead yet.
              </p>
            ) : (
              <div className="divide-y divide-gray-50">
                {lead.deals.map((deal) => (
                  <div key={deal.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{deal.title}</p>
                      <p className="text-xs text-gray-400">
                        ${(deal.value / 100).toLocaleString()} · {deal.probability}% confidence
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STAGE_STYLES[deal.stage]}`}
                    >
                      {deal.stage}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-gray-900">Activity log</h2>
            </div>
            {lead.activities.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-gray-400">
                No activity has been logged yet.
              </p>
            ) : (
              <div className="divide-y divide-gray-50">
                {lead.activities.map((activity) => (
                  <div key={activity.id} className="px-5 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">{activity.subject}</p>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                        {activity.type}
                      </span>
                      {activity.completedAt ? (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                          Completed
                        </span>
                      ) : null}
                    </div>
                    {activity.description ? (
                      <p className="mt-1 text-sm text-gray-600">{activity.description}</p>
                    ) : null}
                    <p className="mt-2 text-xs text-gray-400">
                      {new Date(activity.createdAt).toLocaleString()}
                      {activity.dueDate
                        ? ` · Due ${new Date(activity.dueDate).toLocaleDateString()}`
                        : ""}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-right text-gray-900">{children}</dd>
    </div>
  );
}
