import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  const id = (session?.user as { id?: string } | undefined)?.id;
  if (role !== "ADMIN") return null;
  return { session, adminId: id ?? null };
}
