import { createSign } from "crypto";
import prisma from "@/lib/prisma";
import type { CalendarOccurrence } from "@/lib/delivery/calendar";

type GoogleCalendarEventDate = {
  date?: string;
  dateTime?: string;
  timeZone?: string;
};

type GoogleCalendarEvent = {
  id: string;
  htmlLink?: string;
  summary?: string;
  description?: string;
  status?: string;
  recurrence?: string[];
  start?: GoogleCalendarEventDate;
  end?: GoogleCalendarEventDate;
  extendedProperties?: {
    private?: Record<string, string>;
  };
};

type DeliveryTaskCalendarRow = {
  id: string;
  userId: string;
  title: string;
  category: string;
  kind: "ONE_TIME" | "RECURRING";
  dueAt: Date | null;
  nextDueAt: Date | null;
  recurrence: "NONE" | "MONTHLY";
  completedAt: Date | null;
  lastCompletedAt: Date | null;
  active: boolean;
  googleCalendarEventId: string | null;
  user: {
    name: string | null;
    email: string;
  };
};

const GOOGLE_CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3";
const DEFAULT_TIMEZONE = process.env.GOOGLE_CALENDAR_TIMEZONE || "America/New_York";

export class GoogleCalendarApiError extends Error {
  status: number;
  calendarNotFound: boolean;
  eventNotFound: boolean;
  needsWriterAccess: boolean;

  constructor(status: number, path: string, data: unknown, calendarId: string, clientEmail: string) {
    const eventNotFound = status === 404 && /^\/events\/[^/?]+/.test(path);
    const calendarNotFound = status === 404 && !eventNotFound;
    const needsWriterAccess =
      status === 403 &&
      JSON.stringify(data).includes("requiredAccessLevel");
    const hint = calendarNotFound
      ? ` Share calendar "${calendarId}" with ${clientEmail} in Google Calendar and grant "Make changes to events".`
      : needsWriterAccess
        ? ` Change ${clientEmail}'s permission on calendar "${calendarId}" from read-only to "Make changes to events".`
        : eventNotFound
          ? " The event may have been deleted from Google Calendar."
          : "";
    super(`Google Calendar API failed (${status}): ${JSON.stringify(data)}.${hint}`);
    this.name = "GoogleCalendarApiError";
    this.status = status;
    this.calendarNotFound = calendarNotFound;
    this.eventNotFound = eventNotFound;
    this.needsWriterAccess = needsWriterAccess;
  }
}

export function isGoogleCalendarAccessError(error: unknown) {
  return (
    error instanceof GoogleCalendarApiError &&
    (error.calendarNotFound || error.needsWriterAccess)
  );
}

function base64Url(input: Buffer | string) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function getGoogleCalendarConfig() {
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  const clientEmail = process.env.GOOGLE_CALENDAR_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_CALENDAR_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!calendarId || !clientEmail || !privateKey) return null;

  return {
    calendarId,
    clientEmail,
    privateKey,
    timeZone: DEFAULT_TIMEZONE,
  };
}

export function hasGoogleCalendarConfig() {
  return !!getGoogleCalendarConfig();
}

async function getGoogleCalendarAccessToken() {
  const config = getGoogleCalendarConfig();
  if (!config) throw new Error("Google Calendar is not configured");

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claimSet = {
    iss: config.clientEmail,
    scope: GOOGLE_CALENDAR_SCOPE,
    aud: GOOGLE_TOKEN_URL,
    exp: now + 3600,
    iat: now,
  };

  const encodedHeader = base64Url(JSON.stringify(header));
  const encodedClaimSet = base64Url(JSON.stringify(claimSet));
  const signingInput = `${encodedHeader}.${encodedClaimSet}`;

  const signer = createSign("RSA-SHA256");
  signer.update(signingInput);
  signer.end();
  const signature = signer.sign(config.privateKey);
  const assertion = `${signingInput}.${base64Url(signature)}`;

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.access_token) {
    throw new Error(
      `Google token request failed (${response.status}): ${JSON.stringify(data)}`,
    );
  }

  return data.access_token as string;
}

async function googleCalendarFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const config = getGoogleCalendarConfig();
  if (!config) throw new Error("Google Calendar is not configured");

  const accessToken = await getGoogleCalendarAccessToken();
  const response = await fetch(
    `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(config.calendarId)}${path}`,
    {
      ...init,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    },
  );

  if (response.status === 204) {
    return null as T;
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new GoogleCalendarApiError(
      response.status,
      path,
      data,
      config.calendarId,
      config.clientEmail,
    );
  }

  return data as T;
}

function toDateKey(input: Date) {
  return input.toISOString().slice(0, 10);
}

function addDays(input: Date, days: number) {
  const value = new Date(input);
  value.setUTCDate(value.getUTCDate() + days);
  return value;
}

function localPart(email: string) {
  return email.split("@")[0];
}

function buildTaskDescription(task: DeliveryTaskCalendarRow) {
  const clientLabel = task.user.name ?? task.user.email;
  const projectHref = `/admin/portal/projects/${task.userId}`;

  return [
    `Client: ${clientLabel}`,
    `Email: ${task.user.email}`,
    `Category: ${task.category}`,
    `Type: ${task.kind === "RECURRING" ? "Monthly recurring" : "One-time deliverable"}`,
    `Project: ${projectHref}`,
    `Task ID: ${task.id}`,
  ].join("\n");
}

function buildGoogleEventPayload(task: DeliveryTaskCalendarRow) {
  const config = getGoogleCalendarConfig();
  if (!config) throw new Error("Google Calendar is not configured");

  const startDate = task.kind === "RECURRING" ? task.nextDueAt : task.dueAt;
  if (!startDate) throw new Error(`Task ${task.id} has no due date to sync`);

  const date = toDateKey(startDate);
  const endDate = toDateKey(addDays(startDate, 1));
  const projectHref = `/admin/portal/projects/${task.userId}`;

  return {
    summary: `${task.user.name ?? localPart(task.user.email)} — ${task.title}`,
    description: buildTaskDescription(task),
    start: {
      date,
      timeZone: config.timeZone,
    },
    end: {
      date: endDate,
      timeZone: config.timeZone,
    },
    recurrence:
      task.kind === "RECURRING" && task.recurrence === "MONTHLY"
        ? ["RRULE:FREQ=MONTHLY"]
        : undefined,
    extendedProperties: {
      private: {
        deliveryTaskId: task.id,
        userId: task.userId,
        userName: task.user.name ?? "",
        userEmail: task.user.email,
        category: task.category,
        kind: task.kind,
        recurrence: task.recurrence,
        projectHref,
      },
    },
  };
}

export async function syncGoogleCalendarEventForTask(taskId: string) {
  if (!hasGoogleCalendarConfig()) return null;

  const task = await prisma.deliveryTask.findUnique({
    where: { id: taskId },
    select: {
      id: true,
      userId: true,
      title: true,
      category: true,
      kind: true,
      dueAt: true,
      nextDueAt: true,
      recurrence: true,
      completedAt: true,
      lastCompletedAt: true,
      active: true,
      googleCalendarEventId: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!task) return null;

  if (!task.active || (task.kind === "ONE_TIME" && !task.dueAt) || (task.kind === "RECURRING" && !task.nextDueAt)) {
    await deleteGoogleCalendarEventForTask(task.id);
    return null;
  }

  const payload = buildGoogleEventPayload(task);

  let event: GoogleCalendarEvent;
  if (task.googleCalendarEventId) {
    try {
      event = await googleCalendarFetch<GoogleCalendarEvent>(
        `/events/${encodeURIComponent(task.googleCalendarEventId)}`,
        {
          method: "PUT",
          body: JSON.stringify(payload),
        },
      );
    } catch (error) {
      if (!(error instanceof GoogleCalendarApiError) || !error.eventNotFound) {
        throw error;
      }
      event = await googleCalendarFetch<GoogleCalendarEvent>("/events", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    }
  } else {
    event = await googleCalendarFetch<GoogleCalendarEvent>("/events", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  await prisma.deliveryTask.update({
    where: { id: task.id },
    data: {
      googleCalendarEventId: event.id,
      googleCalendarHtmlLink: event.htmlLink ?? null,
      googleCalendarSyncedAt: new Date(),
    },
  });

  return event;
}

export async function deleteGoogleCalendarEventForTask(taskId: string) {
  const task = await prisma.deliveryTask.findUnique({
    where: { id: taskId },
    select: { googleCalendarEventId: true },
  });

  if (!task?.googleCalendarEventId) {
    return false;
  }

  if (hasGoogleCalendarConfig()) {
    try {
      await googleCalendarFetch<null>(`/events/${encodeURIComponent(task.googleCalendarEventId)}`, {
        method: "DELETE",
      });
    } catch (error) {
      if (!(error instanceof GoogleCalendarApiError) || !error.eventNotFound) {
        throw error;
      }
    }
  }

  await prisma.deliveryTask.update({
    where: { id: taskId },
    data: {
      googleCalendarEventId: null,
      googleCalendarHtmlLink: null,
      googleCalendarSyncedAt: null,
    },
  });

  return true;
}

function parseGoogleEventDate(start?: GoogleCalendarEventDate) {
  if (start?.date) return start.date;
  if (start?.dateTime) return start.dateTime.slice(0, 10);
  return null;
}

export async function listGoogleCalendarOccurrences(
  start: Date,
  end: Date,
): Promise<CalendarOccurrence[]> {
  if (!hasGoogleCalendarConfig()) return [];

  const params = new URLSearchParams({
    singleEvents: "true",
    orderBy: "startTime",
    timeMin: start.toISOString(),
    timeMax: end.toISOString(),
    maxResults: "2500",
  });

  const response = await googleCalendarFetch<{ items?: GoogleCalendarEvent[] }>(
    `/events?${params.toString()}`,
  );

  const items = response.items ?? [];

  return items
    .filter((event) => event.status !== "cancelled")
    .map((event) => {
      const meta = event.extendedProperties?.private ?? {};
      const date = parseGoogleEventDate(event.start) ?? "";
      const userEmail = meta.userEmail ?? "calendar@macrolight-builder.local";
      const userName = meta.userName || null;
      const taskId = meta.deliveryTaskId ?? event.id;
      const userId = meta.userId ?? "";
      const projectHref = meta.projectHref || null;
      const kind: CalendarOccurrence["kind"] =
        meta.kind === "RECURRING" ? "RECURRING" : "ONE_TIME";
      const recurrence: CalendarOccurrence["recurrence"] =
        meta.recurrence === "MONTHLY" ? "MONTHLY" : "NONE";
      const completed = false;

      return {
        taskId,
        userId,
        userName,
        userEmail,
        title: event.summary ?? "Untitled event",
        category: meta.category ?? "Google Calendar",
        kind,
        date,
        completed,
        projectHref,
        htmlLink: event.htmlLink ?? null,
        source: "google" as const,
        recurrence,
      };
    })
    .filter((event) => !!event.date)
    .sort((a, b) => a.date.localeCompare(b.date));
}
