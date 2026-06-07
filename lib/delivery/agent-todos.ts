import prisma from "@/lib/prisma";
import { getAppBaseUrl } from "@/lib/onboarding/brief";

export type AgentTodoStatus = "pending" | "completed" | "all";

export type AgentTodo = {
  id: string;
  title: string;
  category: string;
  kind: "ONE_TIME" | "RECURRING";
  recurrence: "NONE" | "MONTHLY";
  dueDate: string | null;
  completed: boolean;
  overdue: boolean;
  client: {
    id: string;
    name: string | null;
    email: string;
  };
  projectUrl: string;
};

type TaskRow = {
  id: string;
  userId: string;
  title: string;
  category: string;
  kind: "ONE_TIME" | "RECURRING";
  recurrence: "NONE" | "MONTHLY";
  dueAt: Date | null;
  nextDueAt: Date | null;
  completedAt: Date | null;
  lastCompletedAt: Date | null;
  user: {
    name: string | null;
    email: string;
  };
};

function startOfUtcDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function isRecurringCycleDone(task: TaskRow) {
  if (!task.nextDueAt || !task.lastCompletedAt) return false;
  const periodStart = new Date(task.nextDueAt);
  periodStart.setUTCMonth(periodStart.getUTCMonth() - 1);
  return task.lastCompletedAt >= periodStart;
}

function isTaskCompleted(task: TaskRow) {
  return task.kind === "RECURRING" ? isRecurringCycleDone(task) : !!task.completedAt;
}

function getDueDate(task: TaskRow) {
  const raw = task.kind === "RECURRING" ? task.nextDueAt : task.dueAt;
  return raw ? startOfUtcDay(raw) : null;
}

function toAgentTodo(task: TaskRow, baseUrl: string): AgentTodo {
  const dueDate = getDueDate(task);
  const completed = isTaskCompleted(task);
  const today = startOfUtcDay(new Date());

  return {
    id: task.id,
    title: task.title,
    category: task.category,
    kind: task.kind,
    recurrence: task.recurrence,
    dueDate: dueDate ? toDateKey(dueDate) : null,
    completed,
    overdue: !completed && !!dueDate && dueDate < today,
    client: {
      id: task.userId,
      name: task.user.name,
      email: task.user.email,
    },
    projectUrl: `${baseUrl}/admin/portal/projects/${task.userId}`,
  };
}

export async function loadAgentTodos(options: {
  status?: AgentTodoStatus;
  userId?: string;
  days?: number;
}) {
  const status = options.status ?? "pending";
  const baseUrl = getAppBaseUrl();
  const today = startOfUtcDay(new Date());
  const horizon =
    typeof options.days === "number" && options.days >= 0
      ? new Date(today)
      : null;
  if (horizon) {
    horizon.setUTCDate(horizon.getUTCDate() + options.days!);
  }

  const tasks = await prisma.deliveryTask.findMany({
    where: {
      active: true,
      ...(options.userId ? { userId: options.userId } : {}),
    },
    orderBy: [{ dueAt: "asc" }, { nextDueAt: "asc" }, { sortOrder: "asc" }],
    select: {
      id: true,
      userId: true,
      title: true,
      category: true,
      kind: true,
      recurrence: true,
      dueAt: true,
      nextDueAt: true,
      completedAt: true,
      lastCompletedAt: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  let todos = tasks.map((task) => toAgentTodo(task, baseUrl));

  if (status === "pending") {
    todos = todos.filter((task) => !task.completed);
  } else if (status === "completed") {
    todos = todos.filter((task) => task.completed);
  }

  if (horizon) {
    todos = todos.filter((task) => {
      if (!task.dueDate) return status !== "pending";
      const due = startOfUtcDay(new Date(`${task.dueDate}T00:00:00.000Z`));
      return due <= horizon || task.overdue;
    });
  }

  todos.sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return a.title.localeCompare(b.title);
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return a.dueDate.localeCompare(b.dueDate);
  });

  const weekEnd = new Date(today);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);

  return {
    tasks: todos,
    summary: {
      total: todos.length,
      pending: todos.filter((task) => !task.completed).length,
      overdue: todos.filter((task) => task.overdue).length,
      dueWithin7Days: todos.filter((task) => {
        if (!task.dueDate || task.completed) return false;
        const due = startOfUtcDay(new Date(`${task.dueDate}T00:00:00.000Z`));
        return due >= today && due <= weekEnd;
      }).length,
    },
  };
}
