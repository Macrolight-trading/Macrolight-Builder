import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import DealForm from "@/components/admin/crm/DealForm";

export const dynamic = "force-dynamic";

export default async function EditDealPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [deal, leads] = await Promise.all([
    prisma.deal.findUnique({ where: { id } }),
    prisma.lead.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, company: true },
    }),
  ]);

  if (!deal) notFound();

  return (
    <>
      <div className="mb-6">
        <Link
          href={`/admin/crm/deals/${deal.id}`}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          &larr; Back to deal
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Edit Deal</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl">
        <DealForm
          leads={leads}
          initialValues={{
            id: deal.id,
            title: deal.title,
            value: deal.value,
            stage: deal.stage,
            probability: deal.probability,
            expectedCloseDate: deal.expectedCloseDate
              ? deal.expectedCloseDate.toISOString().slice(0, 10)
              : null,
            leadId: deal.leadId,
          }}
        />
      </div>
    </>
  );
}
