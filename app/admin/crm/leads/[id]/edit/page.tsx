import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import LeadForm from "@/components/admin/crm/LeadForm";

export const dynamic = "force-dynamic";

export default async function EditLeadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) notFound();

  return (
    <>
      <div className="mb-6">
        <Link
          href={`/admin/crm/leads/${lead.id}`}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          &larr; Back to lead
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Edit Lead</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl">
        <LeadForm
          initialValues={{
            id: lead.id,
            name: lead.name,
            email: lead.email,
            phone: lead.phone ?? "",
            company: lead.company ?? "",
            jobTitle: lead.jobTitle ?? "",
            industry: lead.industry ?? "",
            website: lead.website ?? "",
            source: lead.source ?? "",
            status: lead.status,
            value: lead.value,
            description: lead.description ?? "",
          }}
        />
      </div>
    </>
  );
}
