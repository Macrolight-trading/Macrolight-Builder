import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/cal/webhook
 *
 * Receives booking lifecycle events from Cal.com and mirrors them into
 * the local Booking table. The signature is verified against
 * CAL_WEBHOOK_SECRET (HMAC SHA256 of the raw body), matching the recipe
 * Cal documents at https://cal.com/docs/core-features/webhooks
 *
 * Subscribe to these events in Cal.com → Settings → Developer → Webhooks:
 *   - BOOKING_CREATED
 *   - BOOKING_RESCHEDULED
 *   - BOOKING_CANCELLED
 *   - BOOKING_REJECTED
 *   - BOOKING_PAID            (optional, useful if you charge for calls)
 *   - MEETING_ENDED           (optional, lets us auto-set COMPLETED)
 */

type CalAttendee = {
  email?: string;
  name?: string;
  timeZone?: string;
};

type CalPayload = {
  uid?: string;
  bookingId?: number;
  title?: string;
  description?: string;
  additionalNotes?: string;
  startTime?: string;
  endTime?: string;
  status?: string;
  eventType?: { slug?: string; title?: string };
  organizer?: CalAttendee;
  attendees?: CalAttendee[];
  metadata?: Record<string, unknown> & { videoCallUrl?: string };
  location?: string;
  rescheduleUid?: string;
  cancellationReason?: string;
};

type CalWebhookBody = {
  triggerEvent: string;
  createdAt?: string;
  payload: CalPayload;
};

function verifySignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.CAL_WEBHOOK_SECRET;
  if (!secret) {
    console.warn("CAL_WEBHOOK_SECRET not set — accepting webhook unverified");
    return true;
  }
  if (!signature) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  // Constant-time compare.
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(signature, "hex"),
    );
  } catch {
    return false;
  }
}

/**
 * Map a Cal.com triggerEvent string + payload into our local
 * BookingStatus + a "should I create or update?" decision.
 */
function statusFor(triggerEvent: string): {
  status: "CONFIRMED" | "PENDING" | "CANCELED" | "RESCHEDULED" | "COMPLETED";
  upsert: "create" | "update";
} {
  switch (triggerEvent) {
    case "BOOKING_CREATED":
    case "BOOKING_REQUESTED":
    case "BOOKING_PAID":
      return { status: "CONFIRMED", upsert: "create" };
    case "BOOKING_RESCHEDULED":
      return { status: "RESCHEDULED", upsert: "update" };
    case "BOOKING_CANCELLED":
    case "BOOKING_REJECTED":
      return { status: "CANCELED", upsert: "update" };
    case "MEETING_ENDED":
      return { status: "COMPLETED", upsert: "update" };
    default:
      return { status: "CONFIRMED", upsert: "create" };
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  // Cal.com sends X-Cal-Signature-256 with the HMAC hex digest.
  const signature =
    req.headers.get("x-cal-signature-256") ??
    req.headers.get("X-Cal-Signature-256") ??
    null;

  if (!verifySignature(rawBody, signature)) {
    console.warn("Cal.com webhook signature verification failed");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: CalWebhookBody;
  try {
    event = JSON.parse(rawBody) as CalWebhookBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { triggerEvent, payload } = event;
  if (!triggerEvent || !payload) {
    return NextResponse.json({ error: "Malformed event" }, { status: 400 });
  }

  const externalId = payload.uid ?? null;
  if (!externalId) {
    // Without a Cal UID we can't reconcile reschedules/cancels later.
    return NextResponse.json(
      { error: "Missing payload.uid" },
      { status: 400 },
    );
  }

  // Match the booking to one of our users by attendee email.
  const attendeeEmail =
    payload.attendees?.find((a) => a.email)?.email?.toLowerCase() ?? null;
  if (!attendeeEmail) {
    console.warn("Cal webhook: no attendee email", externalId);
    return NextResponse.json({ received: true, skipped: "no_email" });
  }

  const user = await prisma.user.findFirst({
    where: { email: { equals: attendeeEmail, mode: "insensitive" } },
  });

  if (!user) {
    // Booking from a non-customer — Cal still notifies, we just don't
    // mirror it. Could log a Lead in the CRM later.
    console.warn("Cal webhook: no matching user for", attendeeEmail);
    return NextResponse.json({ received: true, skipped: "no_user" });
  }

  const { status, upsert } = statusFor(triggerEvent);
  const callType = payload.eventType?.slug ?? null;
  const title = payload.title ?? payload.eventType?.title ?? null;
  const meetingUrl =
    payload.metadata?.videoCallUrl ??
    (typeof payload.location === "string" &&
    payload.location.startsWith("http")
      ? payload.location
      : null);

  // Cal sends self-service URLs as query-parameterized links on the same
  // booking host. Reconstruct from known patterns when not provided.
  const base = process.env.NEXT_PUBLIC_CAL_BASE_URL ?? "https://cal.com";
  const cancelUrl = `${base}/booking/${externalId}?cancel=true`;
  const rescheduleUrl = `${base}/reschedule/${externalId}`;

  const startsAt = payload.startTime ? new Date(payload.startTime) : null;
  const endsAt = payload.endTime ? new Date(payload.endTime) : null;

  if (!startsAt || !endsAt) {
    return NextResponse.json(
      { error: "Missing start/end time" },
      { status: 400 },
    );
  }

  try {
    if (upsert === "create") {
      // Upsert anyway — Cal sometimes re-delivers CREATE.
      await prisma.booking.upsert({
        where: { externalId },
        create: {
          userId: user.id,
          externalId,
          externalSource: "cal.com",
          status,
          startsAt,
          endsAt,
          title,
          attendeeName:
            payload.attendees?.find((a) => a.name)?.name ?? user.name ?? null,
          attendeeEmail,
          callType,
          notes: payload.additionalNotes ?? payload.description ?? null,
          meetingUrl,
          cancelUrl,
          rescheduleUrl,
        },
        update: {
          status,
          startsAt,
          endsAt,
          title,
          callType,
          notes: payload.additionalNotes ?? payload.description ?? null,
          meetingUrl,
        },
      });
    } else {
      // Update — but tolerate the case where Cal sent us an update for a
      // booking we don't have (missed CREATE earlier).
      const existing = await prisma.booking.findUnique({
        where: { externalId },
      });
      if (existing) {
        await prisma.booking.update({
          where: { externalId },
          data: {
            status,
            startsAt,
            endsAt,
            title,
            notes:
              payload.cancellationReason ??
              payload.additionalNotes ??
              existing.notes,
            meetingUrl: meetingUrl ?? existing.meetingUrl,
          },
        });
      } else {
        await prisma.booking.create({
          data: {
            userId: user.id,
            externalId,
            externalSource: "cal.com",
            status,
            startsAt,
            endsAt,
            title,
            attendeeEmail,
            callType,
            notes:
              payload.cancellationReason ?? payload.additionalNotes ?? null,
            meetingUrl,
            cancelUrl,
            rescheduleUrl,
          },
        });
      }
    }
  } catch (err) {
    console.error("Cal webhook DB error", err);
    return NextResponse.json(
      { error: "Failed to persist booking" },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
