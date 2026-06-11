import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { listSites } from "@/lib/strapi/sites";
import { listContentEntriesForAdmin } from "@/lib/strapi/content";
import StrapiSiteManager from "@/components/admin/portal/StrapiSiteManager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Strapi CMS" };

export default async function AdminStrapiPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "ADMIN") redirect("/admin");

  const [sites, contentEntries] = await Promise.all([
    listSites(),
    listContentEntriesForAdmin({ limit: 20 }),
  ]);
  // Normalize Date fields to ISO strings for the client component.
  const serialized = JSON.parse(JSON.stringify(sites));

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Strapi CMS</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage each client site&apos;s Strapi connection and the single site API key
          shared by VisBoost and the client site page renderer.
        </p>
      </div>

      <StrapiSiteManager initialSites={serialized} />

      <section className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-900">Recent shared content</h2>
          <p className="mt-1 text-xs text-gray-500">
            Internal shared content currently readable only by Builder admins and paired
            VisBoost clients. Future site repos are not reading this yet.
          </p>
        </div>
        {contentEntries.length === 0 ? (
          <p className="px-5 py-8 text-sm text-gray-400">No shared content has been pushed yet.</p>
        ) : (
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-5 py-3">Title</th>
                  <th className="px-5 py-3">Site</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Source</th>
                  <th className="px-5 py-3">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {contentEntries.map((entry) => (
                  <tr key={entry.id} className="align-top hover:bg-gray-50/50">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-900">{entry.title}</p>
                      <p className="text-xs text-gray-400">/{entry.slug}</p>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">
                      <p>{entry.siteName}</p>
                      <p className="text-gray-400">{entry.siteSlug}</p>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">{entry.entryType}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">{entry.sourceProvider}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">
                      {new Date(entry.updatedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
