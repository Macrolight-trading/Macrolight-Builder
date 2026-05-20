import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import CalEmbed from "@/components/portal/CalEmbed";

export const dynamic = "force-dynamic";
export const metadata = { title: "Book a call" };

/**
 * /portal/book-a-call — clients pick a time on Bradley's calendar.
 *
 * Implementation: Cal.com embed. Bookings are recorded in our DB via the
 * Cal.com webhook (/api/cal/webhook). See CAL_SETUP.md for configuration.
 */
export default async function BookACallPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) redirect("/login?callbackUrl=/portal/book-a-call");

  const [user, upcoming] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    }),
    // Surface upcoming + recently-canceled bookings so the user can see
    // what's on the calendar and use Cal's reschedule/cancel links.
    prisma.booking.findMany({
      where: {
        userId,
        startsAt: { gte: new Date() },
        status: { in: ["CONFIRMED", "PENDING", "RESCHEDULED"] },
      },
      orderBy: { startsAt: "asc" },
      take: 10,
    }),
  ]);

  const username = process.env.NEXT_PUBLIC_CAL_USERNAME ?? "";
  const eventSlug = process.env.NEXT_PUBLIC_CAL_EVENT_SLUG ?? "";
  const calLink = username && eventSlug ? `${username}/${eventSlug}` : null;

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Book a call</h1>
        <p className="mt-1 text-sm text-gray-500">
          Pick a time that works for you — calls are 15 minutes and you&apos;ll
          get a calendar invite plus a video link by email.
        </p>
      </div>

      {upcoming.length > 0 && (
        <div className="mb-8 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">
              Upcoming calls
            </h2>
          </div>
          <ul className="divide-y divide-gray-50">
            {upcoming.map((b) => (
              <li
                key={b.id}
                className="flex items-start justify-between gap-4 px-5 py-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">
                    {b.title ?? b.callType ?? "Strategy call"}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {new Date(b.startsAt).toLocaleString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      timeZoneName: "short",
                    })}
                  </p>
                  {b.meetingUrl && (
                    <a
                      href={b.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-block text-xs font-semibold text-violet-600 hover:text-violet-700"
                    >
                      Join video call &rarr;
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {b.rescheduleUrl && (
                    <a
                      href={b.rescheduleUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-gray-600 hover:text-gray-900"
                    >
                      Reschedule
                    </a>
                  )}
                  {b.cancelUrl && (
                    <a
                      href={b.cancelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-gray-400 hover:text-red-600"
                    >
                      Cancel
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-2 sm:p-4">
        {calLink ? (
          <CalEmbed
            calLink={calLink}
            name={user?.name ?? ""}
            email={user?.email ?? ""}
          />
        ) : (
          <div className="text-center py-16 text-sm text-gray-500">
            <p className="font-semibold text-gray-700">
              Booking is being set up
            </p>
            <p className="mt-1">
              The calendar isn&apos;t configured yet. Please email{" "}
              <a
                href="mailto:bbayley50@gmail.com"
                className="font-semibold text-violet-600 hover:text-violet-700"
              >
                bbayley50@gmail.com
              </a>{" "}
              to schedule a call directly.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
