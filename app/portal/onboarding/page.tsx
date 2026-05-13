import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import OnboardingForm from "@/components/portal/OnboardingForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Onboarding" };

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return null;

  const data = await prisma.onboardingData.findUnique({ where: { userId } });

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Project Onboarding</h1>
        <p className="mt-1 text-sm text-gray-500">
          Tell us about your business so we can build exactly what you need.
          Fill this out once — you can always save a draft and come back.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl">
        <OnboardingForm
          initialData={{
            businessName: data?.businessName,
            tagline: data?.tagline,
            primaryColor: data?.primaryColor,
            secondaryColor: data?.secondaryColor,
            targetAudience: data?.targetAudience,
            keyServices: data?.keyServices,
            competitors: data?.competitors,
            tone: data?.tone,
            themePicks: (data as { themePicks?: string | null } | null)?.themePicks,
            inspirationUrls: (data as { inspirationUrls?: string | null } | null)?.inspirationUrls,
            additionalNotes: data?.additionalNotes,
            completedAt: data?.completedAt,
          }}
        />
      </div>
    </>
  );
}
