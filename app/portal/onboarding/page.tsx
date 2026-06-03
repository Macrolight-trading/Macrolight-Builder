import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import OnboardingChat from "@/components/portal/OnboardingChat";
import OnboardingAdminToolbar from "@/components/portal/OnboardingAdminTestButton";
import { parseChatMessages } from "@/lib/onboarding/parse-chat-messages";

export const dynamic = "force-dynamic";
export const metadata = { title: "Onboarding" };

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const isAdmin =
    (session?.user as { role?: string } | undefined)?.role === "ADMIN";
  if (!userId) return null;

  const data = await prisma.onboardingData.findUnique({ where: { userId } });

  return (
    <div className="-mx-4 flex min-h-0 flex-col sm:mx-0 sm:max-w-3xl">
      <div className="mb-3 px-4 sm:mb-8 sm:px-0">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
          Project Onboarding
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Chat with our assistant to build your project brief.
        </p>
      </div>

      <div className="flex h-[calc(100dvh-11.5rem)] min-h-[420px] flex-col overflow-hidden border-y border-gray-200 bg-white sm:h-[min(72vh,720px)] sm:rounded-xl sm:border">
        {isAdmin && (
          <OnboardingAdminToolbar hasBrief={!!data?.briefMarkdownUrl} />
        )}
        <OnboardingChat
          initialMessages={parseChatMessages(data?.chatMessages)}
          completedAt={data?.completedAt ?? null}
          hasBrief={!!data?.briefMarkdownUrl}
          businessName={data?.businessName ?? null}
        />
      </div>
    </div>
  );
}
