import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const VALID_PLANS = ["NONE", "STARTER", "GROWTH", "PRO", "CUSTOM"] as const;
const VALID_ROLES = ["USER", "ADMIN"] as const;

type Plan = (typeof VALID_PLANS)[number];
type Role = (typeof VALID_ROLES)[number];

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;
  return user?.role === "ADMIN" ? user : null;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { plan, role } = body as { plan?: string; role?: string };

    if (plan === undefined && role === undefined) {
      return NextResponse.json(
        { error: "Nothing to update. Provide `plan` and/or `role`." },
        { status: 400 }
      );
    }

    const data: { plan?: Plan; role?: Role } = {};

    if (plan !== undefined) {
      if (!VALID_PLANS.includes(plan as Plan)) {
        return NextResponse.json(
          {
            error: `Invalid plan. Must be one of: ${VALID_PLANS.join(", ")}.`,
          },
          { status: 400 }
        );
      }
      data.plan = plan as Plan;
    }

    if (role !== undefined) {
      if (!VALID_ROLES.includes(role as Role)) {
        return NextResponse.json(
          {
            error: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}.`,
          },
          { status: 400 }
        );
      }
      // Guard against the current admin demoting themselves and locking
      // the org out of the admin area. They can still be demoted by
      // another admin.
      if (admin.id === id && role !== "ADMIN") {
        return NextResponse.json(
          { error: "You cannot remove your own admin role." },
          { status: 400 }
        );
      }
      data.role = role as Role;
    }

    const user = await prisma.user.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      id: user.id,
      plan: user.plan,
      role: user.role,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to update user." },
      { status: 500 }
    );
  }
}
