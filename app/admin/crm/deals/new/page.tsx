import prisma from "@/lib/prisma";
import Link from "next/link";
import DealForm from "@/components/admin/crm/DealForm";

export const dynamic = "force-dynamic";

export default async function NewDealPage({
  searchParams,
}: {
  searchParams: Promise<{ leadId?: string }>;
}) {
  const params = await searchParams;
  const leads = await prisma.lead.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, company: true },
  });

  return (
    <>
      <div className="mb-6">
        <Link
          href="/admin/crm/deals"
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          &larr; Back to pipeline
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">New Deal</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl">
        <DealForm
          leads={leads}
          initialValues={{
            leadId: params.leadId,
          }}
        />
      </div>
    </>
  );
}
