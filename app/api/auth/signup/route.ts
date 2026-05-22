import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import prisma from "@/lib/prisma";
import {
  sendEmail,
  sendTemplateEmailDetailed,
  getNotificationEmails,
} from "@/lib/email";
import { welcomeEmailHtml, newSignupAdminEmailHtml } from "@/lib/email-templates";

// Resend-hosted welcome template (created in the Resend dashboard as
// "welcome-email"). The UUID is the default; allow override via env so
// the same code can point at a staging template without a code change.
const WELCOME_TEMPLATE_ID =
  process.env.RESEND_WELCOME_TEMPLATE_ID ??
  "6d9e480c-9f79-415f-bc13-a3715e03c4d2";

/**
 * Extracts a first-name token from the user's stored display name.
 * The template uses {{first_name}} as a greeting, so we want just the
 * leading word. Falls back to "there" when no name is on file so the
 * template never renders an empty greeting.
 */
function firstNameFor(name: string | null): string {
  if (!name) return "there";
  const first = name.trim().split(/\s+/)[0];
  return first || "there";
}

// Minimal validation. We avoid pulling in zod here to keep the route
// dependency-light, but the rules are:
//  - email is required, must look like an email, lowercased before saving
//  - password is required, ≥ 8 chars
//  - name is optional
//  - phone is optional; we only validate it if provided
function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Accepts a free-form phone string and returns it cleaned, or null if it
 * doesn't look phone-ish. Doesn't reformat to E.164 — we keep the user's
 * typed format so it reads naturally in the UI. Just sanity-checks that
 * the input has enough digits to plausibly be a phone number.
 */
function normalizePhone(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 20) return null;
  return trimmed;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawEmail: unknown = body?.email;
    const rawPassword: unknown = body?.password;
    const rawName: unknown = body?.name;
    const rawPhone: unknown = body?.phone;

    if (typeof rawEmail !== "string" || typeof rawPassword !== "string") {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const email = rawEmail.trim().toLowerCase();
    const password = rawPassword;
    const name =
      typeof rawName === "string" && rawName.trim() ? rawName.trim() : null;
    const phone = normalizePhone(rawPhone);

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    if (
      typeof rawPhone === "string" &&
      rawPhone.trim().length > 0 &&
      phone === null
    ) {
      return NextResponse.json(
        { error: "Please enter a valid phone number." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with that email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        phone,
        passwordHash,
        role: "USER",
      },
      select: { id: true, email: true, name: true, phone: true, role: true },
    });

    // Seed a plan recommendation from the admin-configured default template.
    // If no template exists yet, fall back to STARTER with no add-ons.
    const defaultTemplate = await prisma.defaultPlanTemplate.findUnique({
      where: { id: "default" },
      include: { items: { select: { optionId: true } } },
    });

    await prisma.planRecommendation.create({
      data: {
        userId: user.id,
        basePlan: defaultTemplate?.basePlan ?? "STARTER",
        notes: defaultTemplate?.notes ?? "New signup — review and customize this recommendation after the intro call.",
        ...(defaultTemplate?.items.length
          ? {
              items: {
                create: defaultTemplate.items.map((i) => ({ optionId: i.optionId })),
              },
            }
          : {}),
      },
    });

    // Send welcome email to the new user (fire-and-forget).
    // Primary path: render the Resend-hosted "welcome-email" template
    // with the user's first name. If Resend rejects the template send
    // (missing env, unpublished template, missing variable, etc.) fall
    // back to the inline HTML template so signups never silently lose
    // the welcome email.
    (async () => {
      const templateResult = await sendTemplateEmailDetailed({
        to: user.email,
        templateId: WELCOME_TEMPLATE_ID,
        variables: { first_name: firstNameFor(user.name) },
      });

      if (templateResult.ok) return;

      console.warn(
        `Welcome template send failed (${templateResult.status}): ${templateResult.error}. Falling back to inline HTML.`,
      );

      await sendEmail({
        to: user.email,
        subject: "Welcome to Macrolight",
        html: welcomeEmailHtml({ name: user.name }),
      });
    })().catch((err) => console.error("Welcome email failed:", err));

    // Notify admin of the new signup
    const notificationEmails = getNotificationEmails();
    if (notificationEmails.length > 0) {
      sendEmail({
        to: notificationEmails,
        subject: `New signup: ${user.name ?? user.email}`,
        html: newSignupAdminEmailHtml({ name: user.name, email: user.email }),
      }).catch((err) => console.error("New signup admin email failed:", err));
    }

    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    console.error("POST /api/auth/signup failed:", err);
    return NextResponse.json(
      { error: "Sign-up failed. Please try again." },
      { status: 500 }
    );
  }
}
