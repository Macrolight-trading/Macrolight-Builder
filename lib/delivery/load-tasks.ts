import prisma from "@/lib/prisma";

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
