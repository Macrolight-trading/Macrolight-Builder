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

  const [user, project, onboarding, messages, mediaFiles] = await Promise.all([
    prisma.user.findUnique({
      where: { id: params.userId },
      select: { id: true, name: true, email: true, plan: true },
    }),
    prisma.project.findUnique({ where: { userId: params.userId } }),
    prisma.onboardingData.findUnique({ where: { userId: params.userId } }),
    prisma.message.findMany({
      where: { userId: params.userId },
      orderBy: { createdAt: "asc" },
    }),
    prisma.mediaFile.findMany({
      where: { userId: params.userId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

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
          ) : (
            <dl className="space-y-3 text-sm">
              {[
                ["Business Name", onboarding.businessName],
                ["Tagline", onboarding.tagline],
                ["Primary Color", onboarding.primaryColor],
                ["Secondary Color", onboarding.secondaryColor],
                ["Target Audience", onboarding.targetAudience],
                ["Key Services", onboarding.keyServices],
                ["Competitors", onboarding.competitors],
                ["Brand Voice", onboarding.tone],
                ["Additional Notes", onboarding.additionalNotes],
              ]
                .filter(([, v]) => v)
                .map(([label, value]) => (
                  <div key={label as string}>
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      {label}
                    </dt>
                    <dd className="mt-0.5 text-gray-800 whitespace-pre-line">{value}</dd>
                  </div>
                ))}
              {onboarding.completedAt && (
                <p className="text-xs text-emerald-600 font-medium pt-1">
                  ✓ Submitted{" "}
                  {new Date(onboarding.completedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              )}
            </dl>
          )}
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
                <a
                  key={f.id}
                  href={f.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={f.filename}
                  className="group block aspect-square rounded-lg overflow-hidden bg-gray-100 hover:ring-2 hover:ring-violet-500 transition-all"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={f.url}
                    alt={f.filename}
                    className="w-full h-full object-cover"
                  />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
