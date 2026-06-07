import { NextRequest, NextResponse } from "next/server";

export function isHermesAuthorized(req: NextRequest): boolean {
  const secret = process.env.HERMES_API_SECRET;
  if (!secret) return false;
  return req.headers.get("x-hermes-secret") === secret;
}

export function hermesUnauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
