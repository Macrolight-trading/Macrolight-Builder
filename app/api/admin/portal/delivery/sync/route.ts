import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/admin/require-admin";
import {
  syncAllPaidDeliverySchedules,
  syncDeliveryScheduleForUser,
} from "@/lib/delivery/sync";

const bodySchema = z.object({
  userId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const ctx = await requireAdminSession();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  if (parsed.data.userId) {
    const result = await syncDeliveryScheduleForUser(parsed.data.userId);
    if (!result) {
      return NextResponse.json(
        { error: "User has no paid plan to sync" },
        { status: 404 },
      );
    }
    return NextResponse.json(result);
  }

  const count = await syncAllPaidDeliverySchedules();
  return NextResponse.json({ synced: count });
}
