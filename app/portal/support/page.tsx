import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SupportForm from "@/components/portal/SupportForm";

export const dynamic = "force-dynamic";

export default async function SupportPage() {
  const session = await getServerSession(authOptions);
  const name = session?.user?.name ?? "";
  const email = session?.user?.email ?? "";

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Support</h1>
        <p className="mt-1 text-sm text-gray-500">
          Need a change, fix, or feature? Tell us and we&apos;ll get to work.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <SupportForm initialName={name} initialEmail={email} />
        </div>

        <aside className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Direct contact
            </h2>
            <p className="text-sm text-gray-700">
              <a
                href="mailto:bbayley50@gmail.com"
                className="text-violet-600 hover:underline"
              >
                bbayley50@gmail.com
              </a>
            </p>
            <p className="mt-1 text-xs text-gray-500">
              We reply within one business day.
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              What to include
            </h2>
            <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
              <li>A short description of the change</li>
              <li>Which page or section it affects</li>
              <li>Screenshots or links if helpful</li>
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}
