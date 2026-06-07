import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import DeliveryCalendar from "@/components/admin/portal/DeliveryCalendar";
import { expandTasksToCalendar, monthRange } from "@/lib/delivery/calendar";
import {
  GoogleCalendarApiError,
  hasGoogleCalendarConfig,
  isGoogleCalendarAccessError,
  listGoogleCalendarOccurrences,
} from "@/lib/google-calendar";
export const dynamic = "force-dynamic";
export const metadata = { title: "Delivery Schedule" };

export default async function AdminDeliverySchedulePage({
  searchParams,
}: {
  searchParams?: { year?: string; month?: string };
}) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "ADMIN") redirect("/admin");

  const now = new Date();
  const year = Number(searchParams?.year) || now.getUTCFullYear();
  const month =
    Number(searchParams?.month) ||
    now.getUTCMonth() + 1;

  const { start, end } = monthRange(year, month);

  const tasksRaw = await prisma.deliveryTask.findMany({
    where: {
      active: true,
      OR: [
        { kind: "ONE_TIME", dueAt: { gte: start, lte: end } },
        { kind: "RECURRING", nextDueAt: { not: null } },
      ],
    },
    include: {
      schedule: {
        include: { user: { select: { name: true, email: true } } },
      },
    },
  });

  const tasks = tasksRaw.map((t) => ({
    ...t,
    user: t.schedule.user,
  }));

  let calendarWarning: string | null = null;
  let occurrences;
  if (hasGoogleCalendarConfig()) {
    try {
      occurrences = await listGoogleCalendarOccurrences(start, end);
    } catch (error) {
      console.error("Google Calendar list failed:", error);
      calendarWarning =
        error instanceof GoogleCalendarApiError && error.needsWriterAccess
          ? "Google Calendar is shared read-only with the service account. Change its permission to “Make changes to events”, then refresh and sync again."
          : isGoogleCalendarAccessError(error)
            ? "Google Calendar is configured but the service account cannot access the target calendar. Share the calendar with the service account email and grant “Make changes to events”, then refresh."
            : "Google Calendar is temporarily unavailable. Showing the internal delivery schedule instead.";
      occurrences = expandTasksToCalendar(tasks, start, end);
    }
  } else {
    occurrences = expandTasksToCalendar(tasks, start, end);
  }

  const paidCount = await prisma.user.count({
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
  });

  const scheduleCount = await prisma.clientDeliverySchedule.count();

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Delivery Schedule</h1>
        <p className="mt-1 text-sm text-gray-500">
          {hasGoogleCalendarConfig()
            ? "Live Google Calendar view of delivery events for paid clients. Use sync to push client schedule changes into Google Calendar."
            : "Google Calendar isn’t configured yet, so you’re seeing the internal delivery schedule preview. Add Google Calendar env vars to turn this page into a live Google Calendar view."}
        </p>
        <p className="mt-2 text-xs text-gray-400">
          {scheduleCount} of {paidCount} paid client
          {paidCount === 1 ? "" : "s"} have schedules. Use{" "}
          <span className="font-medium text-gray-600">Sync all paid clients</span>{" "}
          above to backfill.
        </p>
        {calendarWarning ? (
          <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            {calendarWarning}
          </p>
        ) : null}
      </div>

      <DeliveryCalendar
        year={year}
        month={month}
        occurrences={occurrences}
      />
    </>
  );
}
