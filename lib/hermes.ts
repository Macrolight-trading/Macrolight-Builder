import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export type HermesEventType =
  | "onboarding_complete"
  | "payment_confirmed"
  | "revision_submitted"
  | "client_approved";

/**
 * Enqueue an event for the Hermes agent to pick up on its next poll.
 * Fire-and-forget — never throws, logs errors instead so callers aren't blocked.
 */
export async function enqueueHermesEvent(
  event: HermesEventType,
  userId: string | null,
  payload: Prisma.InputJsonValue,
): Promise<void> {
  try {
    await prisma.hermesEvent.create({
      data: {
        event,
        userId,
        payload,
        status: "PENDING",
      },
    });
  } catch (err) {
    console.error("[hermes] Failed to enqueue event:", event, err);
  }
}
