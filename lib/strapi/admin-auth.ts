import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Shared ADMIN gate for the Strapi admin API routes. Mirrors the inline
 * `requireAdmin` used by the existing /api/admin/portal routes.
 */
export async function isAdminRequest(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  return role === "ADMIN";
}
