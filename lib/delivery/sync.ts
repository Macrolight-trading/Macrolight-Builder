import prisma from "@/lib/prisma";
import type { BillingType } from "@prisma/client";
import {
  deleteGoogleCalendarEventForTask,
  hasGoogleCalendarConfig,
  isGoogleCalendarAccessError,
  syncGoogleCalendarEventForTask,
} from "@/lib/google-calendar";
import {
  basePlanMilestones,
  baseSourceKey,
  lineItemSourceKey,
  oneTimeAddonDayOffset,
} from "./templates";
import { loadPaidPlanSnapshot } from "./load-plan";

export type DesiredDeliveryTask = {
  sourceKey: string;
  title: string;
  category: string;
  kind: "ONE_TIME" | "RECURRING";
  billingType: BillingType;
  optionId: string | null;
  includedInBasePlan: boolean;
  dueAt: Date | null;
  nextDueAt: Date | null;
  recurrence: "NONE" | "MONTHLY";
  sortOrder: number;
};

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setUTCDate(d.getUTCDate() + days);
  d.setUTCHours(12, 0, 0, 0);
  return d;
}

function buildDesiredTasks(snapshot: Awaited<ReturnType<typeof loadPaidPlanSnapshot>>): DesiredDeliveryTask[] {
  if (!snapshot) return [];

  const { basePlan, anchorAt, items, subscriptionPeriodEnd } = snapshot;
  const tasks: DesiredDeliveryTask[] = [];
  let order = 0;

  for (const m of basePlanMilestones(basePlan)) {
    tasks.push({
      sourceKey: baseSourceKey(basePlan, m.slug),
      title: m.title,
      category: m.category,
      kind: "ONE_TIME",
      billingType: "ONE_TIME",
      optionId: null,
      includedInBasePlan: true,
      dueAt: addDays(anchorAt, m.dayOffset),
      nextDueAt: null,
      recurrence: "NONE",
      sortOrder: order++,
    });
  }

  const seen = new Set<string>();
  for (const item of items) {
    const key = lineItemSourceKey(item.optionId, item.nameSnapshot, item.billingType);
    if (seen.has(key)) continue;
    seen.add(key);

    const deliverableTitle = item.includedInBasePlan
      ? `${item.nameSnapshot} (included)`
      : `Deliver: ${item.nameSnapshot}`;

    if (item.billingType === "MONTHLY" && !item.includedInBasePlan) {
      const nextDue =
        subscriptionPeriodEnd ?? addDays(anchorAt, 30);
      tasks.push({
        sourceKey: key,
        title: deliverableTitle,
        category: item.category,
        kind: "RECURRING",
        billingType: "MONTHLY",
        optionId: item.optionId,
        includedInBasePlan: item.includedInBasePlan,
        dueAt: null,
        nextDueAt: nextDue,
        recurrence: "MONTHLY",
        sortOrder: order++,
      });
    } else {
      const offset = item.includedInBasePlan
        ? basePlanMilestones(basePlan).find((m) => m.slug === "build")?.dayOffset ?? 14
        : oneTimeAddonDayOffset(item.category);
      tasks.push({
        sourceKey: key,
        title: deliverableTitle,
        category: item.category,
        kind: "ONE_TIME",
        billingType: item.billingType,
        optionId: item.optionId,
        includedInBasePlan: item.includedInBasePlan,
        dueAt: addDays(anchorAt, offset),
        nextDueAt: null,
        recurrence: "NONE",
        sortOrder: order++,
      });
    }
  }

  return tasks;
}

async function syncGoogleCalendarForTaskIds(taskIds: string[]) {
  if (!hasGoogleCalendarConfig()) return;
  for (const taskId of taskIds) {
    try {
      await syncGoogleCalendarEventForTask(taskId);
    } catch (error) {
      console.error(`Google Calendar sync failed for task ${taskId}:`, error);
      if (isGoogleCalendarAccessError(error)) break;
    }
  }
}

async function deleteGoogleCalendarForTaskIds(taskIds: string[]) {
  if (!taskIds.length) return;
  for (const taskId of taskIds) {
    await deleteGoogleCalendarEventForTask(taskId);
  }
}

/**
 * Reconcile delivery checklist + calendar tasks from the client's current
 * paid plan. Adds/updates active tasks and deactivates removed line items.
 */
export async function syncDeliveryScheduleForUser(
  userId: string,
): Promise<{ scheduleId: string; taskCount: number } | null> {
  const snapshot = await loadPaidPlanSnapshot(userId);
  if (!snapshot) {
    const schedule = await prisma.clientDeliverySchedule.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (schedule) {
      const taskIdsToDelete = hasGoogleCalendarConfig()
        ? (
            await prisma.deliveryTask.findMany({
              where: { scheduleId: schedule.id, googleCalendarEventId: { not: null } },
              select: { id: true },
            })
          ).map((task) => task.id)
        : [];

      await deleteGoogleCalendarForTaskIds(taskIdsToDelete);
      await prisma.deliveryTask.updateMany({
        where: { scheduleId: schedule.id, active: true },
        data: {
          active: false,
          googleCalendarEventId: null,
          googleCalendarHtmlLink: null,
          googleCalendarSyncedAt: null,
        },
      });
    }
    return null;
  }

  const desired = buildDesiredTasks(snapshot);
  const desiredKeys = new Set(desired.map((d) => d.sourceKey));

  const schedule = await prisma.clientDeliverySchedule.upsert({
    where: { userId },
    create: {
      userId,
      anchorAt: snapshot.anchorAt,
      basePlan: snapshot.basePlan,
      planRequestId: snapshot.planRequestId,
      subscriptionId: snapshot.subscriptionId,
      lastSyncedAt: new Date(),
    },
    update: {
      anchorAt: snapshot.anchorAt,
      basePlan: snapshot.basePlan,
      planRequestId: snapshot.planRequestId,
      subscriptionId: snapshot.subscriptionId,
      lastSyncedAt: new Date(),
    },
  });

  const existing = await prisma.deliveryTask.findMany({
    where: { scheduleId: schedule.id },
  });
  const byKey = new Map(existing.map((t) => [t.sourceKey, t]));

  for (const d of desired) {
    const prev = byKey.get(d.sourceKey);
    if (prev) {
      await prisma.deliveryTask.update({
        where: { id: prev.id },
        data: {
          title: d.title,
          category: d.category,
          kind: d.kind,
          billingType: d.billingType,
          optionId: d.optionId,
          includedInBasePlan: d.includedInBasePlan,
          recurrence: d.recurrence,
          sortOrder: d.sortOrder,
          active: true,
          dueAt:
            d.kind === "ONE_TIME" && !prev.completedAt ? d.dueAt : prev.dueAt,
          nextDueAt:
            d.kind === "RECURRING"
              ? prev.nextDueAt && prev.nextDueAt > new Date()
                ? prev.nextDueAt
                : d.nextDueAt
              : null,
        },
      });
    } else {
      await prisma.deliveryTask.create({
        data: {
          scheduleId: schedule.id,
          userId,
          sourceKey: d.sourceKey,
          title: d.title,
          category: d.category,
          kind: d.kind,
          billingType: d.billingType,
          optionId: d.optionId,
          includedInBasePlan: d.includedInBasePlan,
          dueAt: d.dueAt,
          nextDueAt: d.nextDueAt,
          recurrence: d.recurrence,
          sortOrder: d.sortOrder,
          active: true,
        },
      });
    }
  }

  const staleTaskIds = existing
    .filter((task) => task.active && !desiredKeys.has(task.sourceKey) && !!task.googleCalendarEventId)
    .map((task) => task.id);

  await deleteGoogleCalendarForTaskIds(staleTaskIds);
  await prisma.deliveryTask.updateMany({
    where: {
      scheduleId: schedule.id,
      sourceKey: { notIn: [...desiredKeys] },
      active: true,
    },
    data: {
      active: false,
      googleCalendarEventId: null,
      googleCalendarHtmlLink: null,
      googleCalendarSyncedAt: null,
    },
  });

  const activeTasks = await prisma.deliveryTask.findMany({
    where: { scheduleId: schedule.id, active: true },
    select: { id: true },
  });

  await syncGoogleCalendarForTaskIds(activeTasks.map((task) => task.id));

  const activeCount = activeTasks.length;

  return { scheduleId: schedule.id, taskCount: activeCount };
}

/** Sync all paid clients (backfill / manual refresh). */
export async function syncAllPaidDeliverySchedules(): Promise<number> {
  const users = await prisma.user.findMany({
    where: {
      role: "USER",
      OR: [
        { plan: { in: ["STARTER", "GROWTH", "PRO"] } },
        {
          subscriptions: {
            some: { status: { in: ["ACTIVE", "TRIALING", "PAST_DUE"] } },
          },
        },
      ],
    },
    select: { id: true },
  });

  let n = 0;
  for (const u of users) {
    const r = await syncDeliveryScheduleForUser(u.id);
    if (r) n++;
  }
  return n;
}
