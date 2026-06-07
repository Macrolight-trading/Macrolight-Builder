import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { loadAgentTodos } from "@/lib/delivery/agent-todos";
import { hermesUnauthorizedResponse, isHermesAuthorized } from "@/lib/hermes/auth";

/**
 * GET /api/hermes/todos
 *
 * Returns active client delivery tasks for the Hermes / Claude agent.
 *
 * Auth: x-hermes-secret header (HERMES_API_SECRET in .env)
 *
 * Query params:
 *   status  — pending | completed | all (default: pending)
 *   userId  — limit to one client
 *   days    — include tasks due within N days (overdue tasks always included)
 */

const querySchema = z.object({
  status: z.enum(["pending", "completed", "all"]).optional(),
  userId: z.string().optional(),
  days: z.coerce.number().int().min(0).max(365).optional(),
});

export async function GET(req: NextRequest) {
  if (!isHermesAuthorized(req)) {
    return hermesUnauthorizedResponse();
  }

  const parsed = querySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const result = await loadAgentTodos(parsed.data);
  return NextResponse.json(result);
}
