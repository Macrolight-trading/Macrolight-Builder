import prisma from "@/lib/prisma";
import { syncDeliveryScheduleForUser } from "./sync";

export async function loadDeliveryTasksForUser(userId: string) {
  const schedule = await prisma.clientDeliverySchedule.findUnique({
    where: { userId },
    include: {
      tasks: {
        where: { active: true },
        orderBy: [{ kind: "asc" }, { sortOrder: "asc" }, { dueAt: "asc" }],
      },
    },
  });
  return schedule;
}

/** Load schedule for a paid client, creating it on first visit if missing. */
export async function loadOrSyncDeliverySchedule(userId: string) {
  let schedule = await loadDeliveryTasksForUser(userId);
  if (!schedule) {
    await syncDeliveryScheduleForUser(userId);
    schedule = await loadDeliveryTasksForUser(userId);
  }
  return schedule;
}
