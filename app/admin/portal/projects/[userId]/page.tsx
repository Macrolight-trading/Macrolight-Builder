import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import ProjectEditor from "@/components/admin/portal/ProjectEditor";
import MessageThread from "@/components/portal/MessageThread";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminProjectDetailPage({
  params,
}: {
  params: { userId: string };
}) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "ADMIN") redirect("/admin");

  type OnboardingRow = {
    id: string;
    userId: string;
    businessName: string | null;
    tagline: string | null;
    primaryColor: string | null;
    secondaryColor: string | null;
    targetAudience: string | null;
    keyServices: string | null;
    competitors: string | null;
    tone: string | null;
    themePicks: string | null;
    inspirationUrls: string | null;
    additionalNotes: string | null;
    completedAt: Date | null;
  };

  const [user, project, onboardingRows, messages, mediaFiles] = await Promise.all([
    prisma.user.findUnique({
      where: { id: params.userId },
      select: { id: true, name: true, email: true, plan: true },
    }),
    prisma.project.findUnique({ where: { userId: params.userId } }),
    prisma.$queryRaw<OnboardingRow[]>`
      SELECT * FROM onboarding_data WHERE "userId" = ${params.userId} LIMIT 1
    `,
    prisma.message.findMany({
      where: { userId: params.userId },
      orderBy: { createdAt: "asc" },
    }),
    prisma.mediaFile.findMany({
      where: { userId: params.userId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const onboarding = onboardingRows[0] ?? null;

  if (!user) notFound();

  return (
    <>
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/portal/projects" className="text-sm text-gray-500 hover:text-gray-700">
          ← Projects
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-bold text-gray-900">
          {user.name ?? user.email}
        </h1>
        <span className="text-xs font-semibold uppercase tracking-wider bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
          {user.plan}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project stage editor */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Build Stage</h2>
          <ProjectEditor
            userId={user.id}
            initialStage={project?.stage ?? "ONBOARDING"}
            initialLiveUrl={project?.liveUrl ?? ""}
            initialPreviewUrl={(project as { previewUrl?: string | null } | null)?.previewUrl ?? ""}
            initialNotes={project?.notes ?? ""}
          />
        </div>

        {/* Onboarding brief */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Onboarding Brief</h2>
          {!onboarding ? (
            <p className="text-sm text-gray-400">Client hasn&apos;t submitted onboarding yet.</p>
          ) : (() => {
            const THEME_LABELS: Record<string, { name: string; swatches: string[] }> = {
              "bold-trade":      { name: "Bold & Professional", swatches: ["#0f4f90", "#1a6fc4", "#e85d04"] },
              "clean-welcoming": { name: "Clean & Welcoming",  swatches: ["#00574f", "#00897b", "#ff6b35"] },
            };
            const themePicks: string[] = (() => {
              try { return JSON.parse(onboarding.themePicks ?? "[]"); } catch { return []; }
            })();
            const inspirationLinks = (onboarding.inspirationUrls ?? "")
              .split("\n")
              .map((u) => u.trim())
              .filter(Boolean);

            return (
              <dl className="space-y-4 text-sm">
                {/* Text fields */}
                {[
                  ["Business Name", onboarding.businessName],
                  ["Tagline", onboarding.tagline],
                  ["Target Audience", onboarding.targetAudience],
                  ["Key Services", onboarding.keyServices],
                  ["Competitors", onboarding.competitors],
                  ["Brand Voice", onboarding.tone],
                  ["Additional Notes", onboarding.additionalNotes],
                ]
                  .filter(([, v]) => v)
                  .map(([label, value]) => (
                    <div key={label as string}>
                      <dt className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">
                        {label}
                      </dt>
                      <dd className="text-gray-800 whitespace-pre-line">{value}</dd>
                    </div>
                  ))}

                {/* Brand colours */}
                {(onboarding.primaryColor || onboarding.secondaryColor) && (
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                      Brand Colors
                    </dt>
                    <dd className="flex items-center gap-3">
                      {[
                        { label: "Primary",   color: onboarding.primaryColor },
                        { label: "Secondary", color: onboarding.secondaryColor },
                      ].filter((c) => c.color).map((c) => (
                        <div key={c.label} className="flex items-center gap-2">
                          <span
                            className="inline-block w-6 h-6 rounded border border-gray-200 shrink-0"
                            style={{ backgroundColor: c.color! }}
                          />
                          <span className="text-xs text-gray-600 font-mono">{c.color}</span>
                          <span className="text-xs text-gray-400">{c.label}</span>
                        </div>
                      ))}
                    </dd>
                  </div>
                )}

                {/* Theme picks */}
                {themePicks.length > 0 && (
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                      Theme Style Picks
                    </dt>
                    <dd className="space-y-2">
                      {themePicks.map((id) => {
                        const theme = THEME_LABELS[id];
                        if (!theme) return <span key={id} className="text-gray-700">{id}</span>;
                        return (
                          <div key={id} className="flex items-center gap-2.5">
                            <div className="flex rounded overflow-hidden border border-gray-200 shrink-0">
                              {theme.swatches.map((c) => (
                                <span key={c} className="w-4 h-4 block" style={{ backgroundColor: c }} />
                              ))}
                            </div>
                            <span className="text-sm text-gray-800 font-medium">{theme.name}</span>
                            <a
                              href={id === "bold-trade" ? "/samples/hvac.html" : "/samples/dentist.html"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-violet-600 hover:text-violet-700"
                            >
                              Preview →
                            </a>
                          </div>
                        );
                      })}
                    </dd>
                  </div>
                )}

                {/* Inspiration URLs */}
                {inspirationLinks.length > 0 && (
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                      Inspiration Sites
                    </dt>
                    <dd className="space-y-1">
                      {inspirationLinks.map((url) => (
                        <a
                          key={url}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-sm text-violet-600 hover:text-violet-700 truncate"
                        >
                          {url}
                        </a>
                      ))}
                    </dd>
                  </div>
                )}

                {onboarding.completedAt && (
                  <p className="text-xs text-emerald-600 font-medium pt-1 border-t border-gray-100">
                    ✓ Submitted{" "}
                    {new Date(onboarding.completedAt).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric",
                    })}
                  </p>
                )}
              </dl>
            );
          })()}
        </div>

        {/* Message thread */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden lg:col-span-2">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Messages</h2>
          </div>
          <MessageThread
            initialMessages={messages.map((m) => ({
              ...m,
              readAt: m.readAt?.toISOString() ?? null,
              createdAt: m.createdAt.toISOString(),
            }))}
            targetUserId={user.id}
          />
        </div>

        {/* Media files */}
        {mediaFiles.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 lg:col-span-2">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              Uploaded Media ({mediaFiles.length} file{mediaFiles.length !== 1 ? "s" : ""})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {mediaFiles.map((f) => (
                <div key={f.id} className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 hover:ring-2 hover:ring-violet-500 transition-all">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/portal/media/${f.id}/img`}
                    alt={f.filename}
                    className="w-full h-full object-cover"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <a
                      href={`/api/portal/media/${f.id}/img`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 text-[10px] font-semibold bg-white text-gray-800 rounded hover:bg-gray-100"
                    >
                      View
                    </a>
                    <a
                      href={`/api/portal/media/${f.id}/img?download=1`}
                      download={f.filename}
                      className="px-2 py-1 text-[10px] font-semibold bg-violet-600 text-white rounded hover:bg-violet-700"
                    >
                      Download
                    </a>
                  </div>
                  <p className="absolute bottom-0 left-0 right-0 px-1.5 py-1 bg-black/60 text-white text-[9px] truncate opacity-0 group-hover:opacity-100 transition-opacity">
                    {f.filename}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
