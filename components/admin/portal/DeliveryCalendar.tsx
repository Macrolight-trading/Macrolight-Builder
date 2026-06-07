"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, type ReactNode, useEffect, useState } from "react";
import type { CalendarOccurrence } from "@/lib/delivery/calendar";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function EventLink({
  event,
  className,
  children,
  title,
}: {
  event: CalendarOccurrence;
  className: string;
  children: ReactNode;
  title?: string;
}) {
  if (event.projectHref) {
    return (
      <Link href={event.projectHref} className={className} title={title}>
        {children}
      </Link>
    );
  }

  if (event.htmlLink) {
    return (
      <a
        href={event.htmlLink}
        target="_blank"
        rel="noreferrer"
        className={className}
        title={title}
      >
        {children}
      </a>
    );
  }

  return <span className={className}>{children}</span>;
}

function occurrenceKey(event: CalendarOccurrence) {
  return `${event.taskId}-${event.date}`;
}

function CalendarEventRow({
  event,
  busy,
  onToggle,
  compact = false,
}: {
  event: CalendarOccurrence;
  busy: string | null;
  onToggle: (event: CalendarOccurrence) => void;
  compact?: boolean;
}) {
  const key = occurrenceKey(event);
  const eventClass = event.completed
    ? "bg-gray-100 text-gray-400 line-through"
    : event.kind === "RECURRING"
      ? "bg-amber-50 text-amber-900 hover:bg-amber-100"
      : event.source === "google"
        ? "bg-sky-50 text-sky-900 hover:bg-sky-100"
        : "bg-violet-50 text-violet-900 hover:bg-violet-100";

  if (compact) {
    return (
      <li className="flex items-start gap-0.5">
        {event.completable !== false ? (
          <input
            type="checkbox"
            checked={event.completed}
            disabled={busy === key}
            onChange={() => onToggle(event)}
            aria-label={`Mark ${event.title} complete`}
            className="mt-0.5 h-3 w-3 shrink-0 rounded border-gray-300 text-violet-600"
          />
        ) : (
          <span className="mt-0.5 inline-block h-3 w-3 shrink-0" aria-hidden />
        )}
        <EventLink
          event={event}
          className={`block min-w-0 flex-1 rounded px-1 py-0.5 text-[10px] leading-tight truncate ${eventClass}`}
          title={`${event.userName ?? event.userEmail}: ${event.title}`}
        >
          {event.userName?.split(" ")[0] ?? event.userEmail.split("@")[0]}
          : {event.title}
        </EventLink>
      </li>
    );
  }

  return (
    <li className="flex items-center gap-2 text-sm">
      {event.completable !== false ? (
        <input
          type="checkbox"
          checked={event.completed}
          disabled={busy === key}
          onChange={() => onToggle(event)}
          aria-label={`Mark ${event.title} complete`}
          className="h-4 w-4 shrink-0 rounded border-gray-300 text-violet-600"
        />
      ) : (
        <span className="inline-block h-4 w-4 shrink-0" aria-hidden />
      )}
      <EventLink
        event={event}
        className={`min-w-0 flex-1 truncate ${
          event.completed
            ? "text-gray-400 line-through"
            : "text-violet-600 hover:text-violet-800"
        }`}
      >
        <Fragment>
          <span className="text-gray-500">{event.date}</span>{" "}
          {event.userName ?? event.userEmail} — {event.title}
        </Fragment>
      </EventLink>
      <span
        className={`shrink-0 text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded ${
          event.kind === "RECURRING"
            ? "bg-amber-50 text-amber-700"
            : event.source === "google"
              ? "bg-sky-50 text-sky-700"
              : "bg-violet-50 text-violet-700"
        }`}
      >
        {event.kind === "RECURRING"
          ? "Monthly"
          : event.source === "google"
            ? "Google"
            : "One-time"}
      </span>
    </li>
  );
}

export default function DeliveryCalendar({
  year,
  month,
  occurrences: initialOccurrences,
}: {
  year: number;
  month: number;
  occurrences: CalendarOccurrence[];
}) {
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [occurrences, setOccurrences] = useState(initialOccurrences);

  useEffect(() => {
    setOccurrences(initialOccurrences);
  }, [initialOccurrences]);

  const first = new Date(Date.UTC(year, month - 1, 1));
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const startPad = first.getUTCDay();
  const cells: (number | null)[] = [
    ...Array(startPad).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const byDate = new Map<string, CalendarOccurrence[]>();
  for (const o of occurrences) {
    const list = byDate.get(o.date) ?? [];
    list.push(o);
    byDate.set(o.date, list);
  }

  function nav(delta: number) {
    let m = month + delta;
    let y = year;
    if (m < 1) {
      m = 12;
      y--;
    } else if (m > 12) {
      m = 1;
      y++;
    }
    router.push(`/admin/portal/schedule?year=${y}&month=${m}`);
  }

  async function syncAll() {
    setSyncing(true);
    try {
      const res = await fetch("/api/admin/portal/delivery/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("Sync failed");
      router.refresh();
    } catch {
      alert("Could not sync schedules.");
    } finally {
      setSyncing(false);
    }
  }

  async function toggleComplete(event: CalendarOccurrence) {
    if (event.completable === false) return;

    const key = occurrenceKey(event);
    setBusy(key);
    try {
      const res = await fetch(`/api/admin/portal/delivery/tasks/${event.taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !event.completed }),
      });
      if (!res.ok) throw new Error("Update failed");

      setOccurrences((prev) =>
        prev.map((item) =>
          item.taskId === event.taskId && item.date === event.date
            ? { ...item, completed: !event.completed }
            : item,
        ),
      );
      router.refresh();
    } catch {
      alert("Could not update task.");
    } finally {
      setBusy(null);
    }
  }

  const monthLabel = new Date(Date.UTC(year, month - 1, 1)).toLocaleString(
    undefined,
    { month: "long", year: "numeric" },
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => nav(-1)}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600"
            aria-label="Previous month"
          >
            ←
          </button>
          <h2 className="text-lg font-bold text-gray-900 min-w-[10rem] text-center">
            {monthLabel}
          </h2>
          <button
            type="button"
            onClick={() => nav(1)}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600"
            aria-label="Next month"
          >
            →
          </button>
        </div>
        <button
          type="button"
          onClick={() => void syncAll()}
          disabled={syncing}
          className="px-3 py-1.5 text-xs font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-50"
        >
          {syncing ? "Syncing…" : "Sync all paid clients"}
        </button>
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-1">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-violet-100 border border-violet-200" />
          One-time due
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-amber-50 border border-amber-200" />
          Monthly recurring
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-sky-50 border border-sky-200" />
          Google Calendar event
        </span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/80">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-500"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 divide-x divide-y divide-gray-100">
          {cells.map((day, idx) => {
            const dateKey = day
              ? `${year}-${pad(month)}-${pad(day)}`
              : null;
            const events = dateKey ? (byDate.get(dateKey) ?? []) : [];
            const isToday =
              dateKey === new Date().toISOString().slice(0, 10);

            return (
              <div
                key={idx}
                className={`min-h-[7rem] p-1.5 ${day ? "bg-white" : "bg-gray-50/50"}`}
              >
                {day && (
                  <>
                    <p
                      className={`text-xs font-semibold mb-1 ${isToday ? "text-violet-600" : "text-gray-500"}`}
                    >
                      {day}
                    </p>
                    <ul className="space-y-1">
                      {events.slice(0, 4).map((e) => (
                        <CalendarEventRow
                          key={occurrenceKey(e)}
                          event={e}
                          busy={busy}
                          onToggle={(item) => void toggleComplete(item)}
                          compact
                        />
                      ))}
                      {events.length > 4 && (
                        <li className="text-[9px] text-gray-400 px-1">
                          +{events.length - 4} more
                        </li>
                      )}
                    </ul>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          This month ({occurrences.length} events)
        </h3>
        {occurrences.length === 0 ? (
          <p className="text-sm text-gray-400">No scheduled deliverables.</p>
        ) : (
          <ul className="space-y-2 max-h-64 overflow-y-auto">
            {occurrences.map((e) => (
              <CalendarEventRow
                key={occurrenceKey(e)}
                event={e}
                busy={busy}
                onToggle={(item) => void toggleComplete(item)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
