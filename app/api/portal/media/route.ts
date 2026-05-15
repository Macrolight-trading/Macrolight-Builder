import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { put } from "@vercel/blob";
import { sendEmail, getNotificationEmails } from "@/lib/email";
import { mediaUploadAdminEmailHtml } from "@/lib/email-templates";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const files = await prisma.mediaFile.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(files);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const category = (formData.get("category") as string | null) ?? undefined;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Only image files (JPEG, PNG, WebP, GIF, SVG) are allowed." },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "File size must be under 10 MB." },
      { status: 400 }
    );
  }

  // Sanitize filename — strip non-alphanumeric except dots and hyphens
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 200);
  const blobPath = `portal/${userId}/${Date.now()}-${safeName}`;

  const blob = await put(blobPath, file, {
    access: "private",
    contentType: file.type,
  });

  const record = await prisma.mediaFile.create({
    data: {
      userId,
      filename: safeName,
      url: blob.url,
      contentType: file.type,
      size: file.size,
      category: category || null,
    },
  });

  // Notify admin of the upload (fire-and-forget)
  const notificationEmails = getNotificationEmails();
  if (notificationEmails.length > 0) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });
    if (user) {
      sendEmail({
        to: notificationEmails,
        subject: `New media upload from ${user.name ?? user.email}`,
        html: mediaUploadAdminEmailHtml({
          name: user.name,
          email: user.email,
          filename: safeName,
        }),
      }).catch((err) => console.error("Media upload email failed:", err));
    }
  }

  return NextResponse.json(record, { status: 201 });
}
