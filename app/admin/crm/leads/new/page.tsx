import LeadForm from "@/components/admin/crm/LeadForm";
import Link from "next/link";

export default function NewLeadPage() {
  return (
    <>
      <div className="mb-6">
        <Link
          href="/admin/crm/leads"
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          &larr; Back to leads
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">New Lead</h1>
        <p className="mt-1 text-sm text-gray-500">
          Capture a new prospect manually.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl">
        <LeadForm />
      </div>
    </>
  );
}
