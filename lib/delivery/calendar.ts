export type CalendarOccurrence = {
  taskId: string;
  userId: string;
  userName: string | null;
  userEmail: string;
  title: string;
  category: string;
  kind: "ONE_TIME" | "RECURRING";
  date: string;
  completed: boolean;
  projectHref: string;
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
    const completed =
      !!task.lastCompletedAt &&
      startOfDay(task.lastCompletedAt).getTime() >= cursor.getTime();
    out.push({
      taskId: task.id,
      userId: task.userId,
      userName: task.user.name,
      userEmail: task.user.email,
      title: task.title,
      category: task.category,
      kind: task.kind,
      date: toDateKey(cursor),
      completed,
      projectHref: `/admin/portal/projects/${task.userId}`,
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
          date: toDateKey(day),
          completed: !!task.completedAt,
          projectHref: `/admin/portal/projects/${task.userId}`,
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
