"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type DeliveryTaskRow = {
  id: string;
  title: string;
  category: string;
  kind: "ONE_TIME" | "RECURRING";
  dueAt: string | null;
  nextDueAt: string | null;
  completedAt: string | null;
  lastCompletedAt: string | null;
  recurrence: "NONE" | "MONTHLY";
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isRecurringCycleDone(task: DeliveryTaskRow): boolean {
  if (!task.nextDueAt || !task.lastCompletedAt) return false;
  const periodStart = new Date(task.nextDueAt);
  periodStart.setUTCMonth(periodStart.getUTCMonth() - 1);
  return new Date(task.lastCompletedAt) >= periodStart;
}

export default function ClientDeliveryChecklist({
  userId,
  initialTasks,
  lastSyncedAt,
}: {
  userId: string;
  initialTasks: DeliveryTaskRow[];
  lastSyncedAt: string | null;
}) {
  const router = useRouter();
  const [tasks, setTasks] = useState(initialTasks);
  const [busy, setBusy] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  async function toggle(task: DeliveryTaskRow) {
    const done =
      task.kind === "RECURRING"
        ? isRecurringCycleDone(task)
        : !!task.completedAt;
    setBusy(task.id);
    try {
      const res = await fetch(`/api/admin/portal/delivery/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !done }),
      });
      if (!res.ok) throw new Error("Update failed");
      const updated = await res.json();
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id
            ? {
                ...t,
                completedAt: updated.completedAt,
                lastCompletedAt: updated.lastCompletedAt,
                nextDueAt: updated.nextDueAt,
              }
            : t,
        ),
      );
      router.refresh();
    } catch {
      alert("Could not update task.");
    } finally {
      setBusy(null);
    }
  }

  async function resync() {
    setSyncing(true);
    try {
      const res = await fetch("/api/admin/portal/delivery/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Sync failed");
      }
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  }

  const oneTime = tasks.filter((t) => t.kind === "ONE_TIME");
  const recurring = tasks.filter((t) => t.kind === "RECURRING");

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden lg:col-span-2">
      <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">
            Delivery checklist
          </h2>
          <p className="mt-0.5 text-xs text-gray-500">
            Synced from checkout plan — updates when subscription changes.
            {lastSyncedAt && (
              <> Last sync {formatDate(lastSyncedAt)}.</>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void resync()}
          disabled={syncing}
          className="text-xs font-semibold text-violet-600 hover:text-violet-700 disabled:opacity-50"
        >
          {syncing ? "Syncing…" : "Refresh from plan"}
        </button>
      </div>

      {tasks.length === 0 ? (
        <p className="px-5 py-8 text-sm text-gray-400 text-center">
          No delivery tasks yet. Complete checkout or refresh from plan.
        </p>
      ) : (
        <div className="px-5 py-4 space-y-6">
          {oneTime.length > 0 && (
            <section>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Scheduled deliverables
              </p>
              <ul className="space-y-2">
                {oneTime.map((t) => {
                  const done = !!t.completedAt;
                  return (
                    <li
                      key={t.id}
                      className="flex items-start gap-3 rounded-lg border border-gray-100 px-3 py-2.5"
                    >
                      <input
                        type="checkbox"
                        checked={done}
                        disabled={busy === t.id}
                        onChange={() => void toggle(t)}
                        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-violet-600"
                      />
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm font-medium ${done ? "text-gray-400 line-through" : "text-gray-900"}`}
                        >
                          {t.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {t.category} · Due {formatDate(t.dueAt)}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {recurring.length > 0 && (
            <section>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Monthly recurring
              </p>
              <ul className="space-y-2">
                {recurring.map((t) => {
                  const done = isRecurringCycleDone(t);
                  return (
                    <li
                      key={t.id}
                      className="flex items-start gap-3 rounded-lg border border-violet-100 bg-violet-50/40 px-3 py-2.5"
                    >
                      <input
                        type="checkbox"
                        checked={done}
                        disabled={busy === t.id}
                        onChange={() => void toggle(t)}
                        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-violet-600"
                      />
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm font-medium ${done ? "text-gray-400 line-through" : "text-gray-900"}`}
                        >
                          {t.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {t.category} · Next {formatDate(t.nextDueAt)}
                          {t.recurrence === "MONTHLY" && " · repeats monthly"}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
