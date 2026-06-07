export type CalendarOccurrence = {
  taskId: string;
  userId: string;
  userName: string | null;
  userEmail: string;
  title: string;
  category: string;
  kind: "ONE_TIME" | "RECURRING";
  recurrence?: "NONE" | "MONTHLY";
  date: string;
  completed: boolean;
  completable?: boolean;
  projectHref?: string | null;
  htmlLink?: string | null;
  source?: "internal" | "google";
};

type TaskRow = {
  id: string;
  userId: string;
  title: string;
  category: string;
  kind: "ONE_TIME" | "RECURRING";
  dueAt: Date | null;
  nextDueAt: Date | null;
  completedAt: Date | null;
  lastCompletedAt: Date | null;
  recurrence: "NONE" | "MONTHLY";
  user: { name: string | null; email: string };
};

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addMonths(d: Date, months: number): Date {
  const x = new Date(d);
  x.setUTCMonth(x.getUTCMonth() + months);
  return x;
}

export function isOccurrenceCompleted(
  task: Pick<
    TaskRow,
    "kind" | "completedAt" | "lastCompletedAt" | "nextDueAt"
  >,
  occurrenceDate: string,
): boolean {
  if (task.kind === "ONE_TIME") return !!task.completedAt;
  if (!task.lastCompletedAt) return false;
  const periodStart = startOfDay(new Date(`${occurrenceDate}T00:00:00.000Z`));
  return startOfDay(task.lastCompletedAt).getTime() >= periodStart.getTime();
}

function expandRecurring(
  task: TaskRow,
  rangeStart: Date,
  rangeEnd: Date,
): CalendarOccurrence[] {
  if (!task.nextDueAt) return [];
  const out: CalendarOccurrence[] = [];
  let cursor = startOfDay(task.nextDueAt);
  const start = startOfDay(rangeStart);
  const end = startOfDay(rangeEnd);

  while (cursor < start) {
    cursor = addMonths(cursor, 1);
  }

  let guard = 0;
  while (cursor <= end && guard < 36) {
    const completed = isOccurrenceCompleted(task, toDateKey(cursor));
    out.push({
      taskId: task.id,
      userId: task.userId,
      userName: task.user.name,
      userEmail: task.user.email,
      title: task.title,
      category: task.category,
      kind: task.kind,
      recurrence: task.recurrence,
      date: toDateKey(cursor),
      completed,
      completable: true,
      projectHref: `/admin/portal/projects/${task.userId}`,
      htmlLink: null,
      source: "internal",
    });
    cursor = addMonths(cursor, 1);
    guard++;
  }
  return out;
}

export function expandTasksToCalendar(
  tasks: TaskRow[],
  rangeStart: Date,
  rangeEnd: Date,
): CalendarOccurrence[] {
  const occurrences: CalendarOccurrence[] = [];

  for (const task of tasks) {
    if (task.kind === "ONE_TIME" && task.dueAt) {
      const day = startOfDay(task.dueAt);
      if (day >= startOfDay(rangeStart) && day <= startOfDay(rangeEnd)) {
        occurrences.push({
          taskId: task.id,
          userId: task.userId,
          userName: task.user.name,
          userEmail: task.user.email,
          title: task.title,
          category: task.category,
          kind: task.kind,
          recurrence: task.recurrence,
          date: toDateKey(day),
          completed: !!task.completedAt,
          completable: true,
          projectHref: `/admin/portal/projects/${task.userId}`,
          htmlLink: null,
          source: "internal",
        });
      }
    } else if (task.kind === "RECURRING" && task.recurrence === "MONTHLY") {
      occurrences.push(...expandRecurring(task, rangeStart, rangeEnd));
    }
  }

  return occurrences.sort((a, b) => a.date.localeCompare(b.date));
}

export function monthRange(year: number, month: number): { start: Date; end: Date } {
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  return { start, end };
}
