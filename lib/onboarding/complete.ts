import prisma from "@/lib/prisma";
import { sendEmail, getNotificationEmails } from "@/lib/email";
import { onboardingCompleteAdminEmailHtml } from "@/lib/email-templates";
import { buildMarkdownBrief, storeOnboardingBrief } from "@/lib/onboarding/brief";
import { z } from "zod";

export const completeOnboardingSchema = z.object({
  contactName: z.string().min(1).max(200),
  businessName: z.string().min(1).max(200),
  phone: z.string().min(7).max(30),
  address: z.string().min(3).max(1000),
  tagline: z.string().max(300).optional(),
  primaryColor: z.string().max(20).optional(),
  secondaryColor: z.string().max(20).optional(),
  targetAudience: z.string().min(10).max(2000),
  keyServices: z.string().min(10).max(2000),
  websiteGoals: z.string().min(10).max(2000),
  websiteVision: z.string().min(20).max(4000),
  competitors: z.string().max(2000).optional(),
  tone: z
    .enum(["professional", "friendly", "bold", "technical", "casual"])
    .optional(),
  themePicks: z.array(z.string()).max(5).optional(),
  inspirationUrls: z.string().max(2000).optional(),
  additionalNotes: z.string().max(4000).optional(),
});

export type CompleteOnboardingInput = z.infer<typeof completeOnboardingSchema>;

export async function completeOnboarding(
  userId: string,
  input: CompleteOnboardingInput,
): Promise<{ briefMarkdownUrl: string; briefPathname: string }> {
  const parsed = completeOnboardingSchema.parse(input);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true },
  });

  const markdownBrief = buildMarkdownBrief({
    ...parsed,
    email: user?.email ?? null,
  });

  const { url: briefMarkdownUrl, pathname: briefPathname } =
    await storeOnboardingBrief(userId, markdownBrief);

  await prisma.onboardingData.upsert({
    where: { userId },
    create: {
      userId,
      contactName: parsed.contactName,
      phone: parsed.phone,
      address: parsed.address,
      businessName: parsed.businessName,
      tagline: parsed.tagline ?? null,
      primaryColor: parsed.primaryColor ?? null,
      secondaryColor: parsed.secondaryColor ?? null,
      targetAudience: parsed.targetAudience,
      keyServices: parsed.keyServices,
      competitors: parsed.competitors ?? null,
      tone: parsed.tone ?? null,
      themePicks: parsed.themePicks?.length
        ? JSON.stringify(parsed.themePicks)
        : null,
      inspirationUrls: parsed.inspirationUrls ?? null,
      additionalNotes: parsed.additionalNotes ?? null,
      briefMarkdownUrl,
      completedAt: new Date(),
    },
    update: {
      contactName: parsed.contactName,
      phone: parsed.phone,
      address: parsed.address,
      businessName: parsed.businessName,
      tagline: parsed.tagline ?? null,
      primaryColor: parsed.primaryColor ?? null,
      secondaryColor: parsed.secondaryColor ?? null,
      targetAudience: parsed.targetAudience,
      keyServices: parsed.keyServices,
      competitors: parsed.competitors ?? null,
      tone: parsed.tone ?? null,
      themePicks: parsed.themePicks?.length
        ? JSON.stringify(parsed.themePicks)
        : null,
      inspirationUrls: parsed.inspirationUrls ?? null,
      additionalNotes: parsed.additionalNotes ?? null,
      briefMarkdownUrl,
      completedAt: new Date(),
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      name: parsed.contactName,
      phone: parsed.phone,
    },
  });

  await prisma.project.upsert({
    where: { userId },
    create: { userId, stage: "DESIGN" },
    update: { stage: "DESIGN" },
  });

  const notificationEmails = getNotificationEmails();
  if (notificationEmails.length > 0 && user) {
    sendEmail({
      to: notificationEmails,
      subject: `Onboarding complete: ${parsed.businessName}`,
      html: onboardingCompleteAdminEmailHtml({
        name: user.name,
        email: user.email,
        businessName: parsed.businessName,
      }),
    }).catch((err) =>
      console.error("Onboarding complete email failed:", err),
    );
  }

  return { briefMarkdownUrl, briefPathname };
}
