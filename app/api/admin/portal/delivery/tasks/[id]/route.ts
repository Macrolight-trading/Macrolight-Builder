import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin/require-admin";

const patchSchema = z.object({
  completed: z.boolean(),
  /** For recurring tasks — ISO date of the occurrence being marked done. */
  occurrenceDate: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const ctx = await requireAdminSession();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const task = await prisma.deliveryTask.findUnique({
    where: { id: params.id },
  });
  if (!task || !task.active) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const now = new Date();

  if (task.kind === "RECURRING") {
    if (parsed.data.completed) {
      const next = new Date(task.nextDueAt ?? now);
      next.setUTCMonth(next.getUTCMonth() + 1);
      await prisma.deliveryTask.update({
        where: { id: task.id },
        data: {
          lastCompletedAt: now,
          nextDueAt: next,
        },
      });
    } else {
      await prisma.deliveryTask.update({
        where: { id: task.id },
        data: { lastCompletedAt: null },
      });
    }
  } else {
    await prisma.deliveryTask.update({
      where: { id: task.id },
      data: {
        completedAt: parsed.data.completed ? now : null,
      },
    });
  }

  const updated = await prisma.deliveryTask.findUnique({
    where: { id: task.id },
  });
  return NextResponse.json(updated);
}
