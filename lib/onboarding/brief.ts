import { put } from "@vercel/blob";

export type OnboardingBriefFields = {
  contactName: string;
  businessName: string;
  phone: string;
  address: string;
  email?: string | null;
  tagline?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  targetAudience: string;
  keyServices: string;
  websiteGoals?: string | null;
  websiteVision?: string | null;
  competitors?: string | null;
  tone?: string | null;
  themePicks?: string[] | null;
  inspirationUrls?: string | null;
  additionalNotes?: string | null;
};

function section(title: string, lines: string[]): string {
  const body = lines.filter(Boolean);
  if (body.length === 0) return "";
  return `## ${title}\n${body.join("\n")}`;
}

function bullet(label: string, value?: string | null): string {
  if (!value?.trim()) return "";
  return `- **${label}:** ${value.trim()}`;
}

export function buildMarkdownBrief(fields: OnboardingBriefFields): string {
  const theme =
    fields.themePicks?.length ? fields.themePicks.join(", ") : null;

  return [
    `# ${fields.businessName} — Website Build Brief`,
    "",
    section("Client & Contact", [
      bullet("Contact Name", fields.contactName),
      bullet("Business Name", fields.businessName),
      bullet("Phone", fields.phone),
      bullet("Address / Service Area", fields.address),
      bullet("Email", fields.email),
    ]),
    section("Business Overview", [
      bullet("Tagline", fields.tagline),
      bullet("Brand Voice", fields.tone),
    ]),
    section("Services & Offerings", [fields.keyServices.trim()]),
    section("Target Audience", [fields.targetAudience.trim()]),
    section("Website Goals & Requirements", [
      fields.websiteGoals?.trim() ?? "",
    ]),
    section("Website Vision", [fields.websiteVision?.trim() ?? ""]),
    section("Brand & Design Direction", [
      bullet("Primary Color", fields.primaryColor),
      bullet("Secondary Color", fields.secondaryColor),
      bullet("Theme", theme),
      bullet("Inspiration Sites", fields.inspirationUrls),
    ]),
    section("Competitors", [fields.competitors?.trim() ?? ""]),
    section("Additional Notes", [fields.additionalNotes?.trim() ?? ""]),
  ]
    .filter(Boolean)
    .join("\n\n");
}

export async function storeOnboardingBrief(
  userId: string,
  markdown: string,
): Promise<{ url: string; pathname: string }> {
  const pathname = `onboarding/${userId}/brief.md`;
  const blob = await put(pathname, markdown, {
    access: "private",
    contentType: "text/markdown; charset=utf-8",
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  return { url: blob.url, pathname };
}

export async function fetchPrivateBlob(url: string): Promise<Response> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not configured");
  }

  const upstream = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!upstream.ok) {
    throw new Error(`Failed to fetch blob: ${upstream.status}`);
  }

  return upstream;
}

export function getAppBaseUrl(): string {
  return (
    process.env.NEXTAUTH_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

export function getHermesBriefApiUrl(userId: string): string {
  return `${getAppBaseUrl()}/api/hermes/client/${userId}/brief`;
}
