import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import DeliveryCalendar from "@/components/admin/portal/DeliveryCalendar";
import {
  expandTasksToCalendar,
  monthRange,
} from "@/lib/delivery/calendar";
import { syncAllPaidDeliverySchedules } from "@/lib/delivery/sync";

export const dynamic = "force-dynamic";
export const metadata = { title: "Delivery Schedule" };

export default async function AdminDeliverySchedulePage({
  searchParams,
}: {
  searchParams?: { year?: string; month?: string; sync?: string };
}) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "ADMIN") redirect("/admin");

  const now = new Date();
  const year = Number(searchParams?.year) || now.getUTCFullYear();
  const month =
    Number(searchParams?.month) ||
    now.getUTCMonth() + 1;

  if (searchParams?.sync === "1") {
    await syncAllPaidDeliverySchedules();
  }

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

  const occurrences = expandTasksToCalendar(tasks, start, end);

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
          Calendar of one-time deliverables and monthly recurring work for paid
          clients. Checklists update automatically when plans change via Stripe.
        </p>
        <p className="mt-2 text-xs text-gray-400">
          {scheduleCount} of {paidCount} paid client
          {paidCount === 1 ? "" : "s"} have schedules.{" "}
          <a
            href="/admin/portal/schedule?sync=1"
            className="text-violet-600 hover:text-violet-700 font-medium"
          >
            Run initial backfill
          </a>
        </p>
      </div>

      <DeliveryCalendar
        year={year}
        month={month}
        occurrences={occurrences}
      />
    </>
  );
}
