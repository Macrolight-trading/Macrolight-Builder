import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import ReviewFeedbackForm from "@/components/portal/ReviewFeedbackForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Project" };

const STAGES = [
  {
    key: "ONBOARDING",
    label: "Onboarding",
    description: "Complete your project brief so we know exactly what to build.",
  },
  {
    key: "DESIGN",
    label: "Design",
    description: "We're crafting your layout, colors, and visual style.",
  },
  {
    key: "DEVELOPMENT",
    label: "Development",
    description: "Your site is being built and coded.",
  },
  {
    key: "REVIEW",
    label: "Review",
    description: "Time to look it over. Check the preview link below and let us know what you'd like changed.",
  },
  {
    key: "LAUNCHED",
    label: "Launched 🎉",
    description: "Your site is live and working for you 24/7.",
  },
] as const;

type StageKey = (typeof STAGES)[number]["key"];

export default async function ProjectPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return null;

  const [project, onboarding] = await Promise.all([
    prisma.project.findUnique({ where: { userId } }),
    prisma.onboardingData.findUnique({
      where: { userId },
      select: { completedAt: true },
    }),
  ]);

  const currentStage: StageKey = (project?.stage as StageKey) ?? "ONBOARDING";
  const stageIndex = STAGES.findIndex((s) => s.key === currentStage);

  const onboardingDone = !!onboarding?.completedAt;

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Project</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track where your website is in the build process.
        </p>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <ol className="relative space-y-0">
          {STAGES.map((stage, i) => {
            const done = i < stageIndex;
            const active = i === stageIndex;
            const upcoming = i > stageIndex;

            return (
              <li key={stage.key} className="flex gap-4 pb-8 last:pb-0">
                {/* Connector line */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-semibold text-sm border-2 ${
                      done
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : active
                        ? "bg-violet-600 border-violet-600 text-white"
                        : "bg-white border-gray-300 text-gray-400"
                    }`}
                  >
                    {done ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </div>
                  {i < STAGES.length - 1 && (
                    <div
                      className={`w-0.5 flex-1 mt-1 ${
                        done ? "bg-emerald-400" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>

                {/* Content */}
                <div className="pt-1 pb-2 min-w-0">
                  <p
                    className={`text-sm font-semibold ${
                      active ? "text-violet-700" : done ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    {stage.label}
                    {active && (
                      <span className="ml-2 text-[10px] font-bold uppercase tracking-wider bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                  </p>
                  <p className={`mt-0.5 text-sm ${upcoming ? "text-gray-400" : "text-gray-600"}`}>
                    {stage.description}
                  </p>

                  {/* Onboarding CTA */}
                  {stage.key === "ONBOARDING" && active && !onboardingDone && (
                    <Link
                      href="/portal/onboarding"
                      className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 text-sm font-semibold text-white hover:bg-violet-700 transition-colors"
                    >
                      Complete Onboarding Chat →
                    </Link>
                  )}
                  {stage.key === "ONBOARDING" && onboardingDone && (
                    <Link
                      href="/portal/onboarding"
                      className="mt-2 inline-block text-xs font-medium text-violet-600 hover:text-violet-700"
                    >
                      View / edit your brief →
                    </Link>
                  )}

                  {/* Review: preview URL + inline feedback form */}
                  {stage.key === "REVIEW" && active && (
                    <div className="mt-4 space-y-4">
                      {(project as { previewUrl?: string | null } | null)?.previewUrl && (
                        <div className="rounded-lg bg-violet-50 border border-violet-200 px-4 py-3 flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-wider text-violet-600 mb-0.5">Preview link</p>
                            <p className="text-sm text-violet-900 truncate">
                              {(project as { previewUrl?: string | null }).previewUrl}
                            </p>
                          </div>
                          <a
                            href={(project as { previewUrl?: string | null }).previewUrl!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 px-3 py-1.5 rounded-lg bg-violet-600 text-xs font-semibold text-white hover:bg-violet-700 transition-colors"
                          >
                            Open →
                          </a>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Request changes</p>
                        <ReviewFeedbackForm />
                      </div>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Live URL if launched */}
      {currentStage === "LAUNCHED" && project?.liveUrl && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-900">Your site is live!</p>
            <p className="text-xs text-emerald-700 mt-0.5">{project.liveUrl}</p>
          </div>
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
          >
            Visit Site →
          </a>
        </div>
      )}

      {/* Notes from team */}
      {project?.notes && (
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 mb-1">
            Note from the team
          </p>
          <p className="text-sm text-amber-900 whitespace-pre-line">{project.notes}</p>
        </div>
      )}
    </>
  );
}
