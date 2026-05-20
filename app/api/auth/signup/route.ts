import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import prisma from "@/lib/prisma";
import { sendEmail, getNotificationEmails } from "@/lib/email";
import { welcomeEmailHtml, newSignupAdminEmailHtml } from "@/lib/email-templates";

// Minimal validation. We avoid pulling in zod here to keep the route
// dependency-light, but the rules are:
//  - email is required, must look like an email, lowercased before saving
//  - password is required, ≥ 8 chars
//  - name is optional
function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawEmail: unknown = body?.email;
    const rawPassword: unknown = body?.password;
    const rawName: unknown = body?.name;

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
        passwordHash,
        role: "USER",
      },
      select: { id: true, email: true, name: true, role: true },
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

    // Send welcome email to the new user (fire-and-forget)
    sendEmail({
      to: user.email,
      subject: "Welcome to Macrolight",
      html: welcomeEmailHtml({ name: user.name }),
    }).catch((err) => console.error("Welcome email failed:", err));

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
