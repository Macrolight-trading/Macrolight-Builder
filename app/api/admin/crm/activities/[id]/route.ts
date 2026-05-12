import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const allowed = [
      "subject",
      "description",
      "dueDate",
      "completedAt",
      "ownerId",
    ] as const;

    const data: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) {
        if (key === "dueDate" || key === "completedAt") {
          data[key] = body[key] ? new Date(body[key]) : null;
        } else {
          data[key] = body[key];
        }
      }
    }

    // Convenience flag — when called with { completed: true } or false
    if ("completed" in body) {
      data.completedAt = body.completed ? new Date() : null;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No fields to update." }, { status: 400 });
    }

    const activity = await prisma.activity.update({
      where: { id },
      data,
    });

    return NextResponse.json(activity);
  } catch (err) {
    console.error("PATCH /api/admin/crm/activities/[id] failed:", err);
    return NextResponse.json({ error: "Failed to update activity." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.activity.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/admin/crm/activities/[id] failed:", err);
    return NextResponse.json({ error: "Failed to delete activity." }, { status: 500 });
  }
}
