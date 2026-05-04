import { PrismaClient, Role, Plan } from "@prisma/client";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database (production-safe mode)...");

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME?.trim() || "Admin";

  if (!adminEmail || !adminPassword) {
    console.log("No default records were created.");
    console.log("To create the initial admin user, set ADMIN_EMAIL and ADMIN_PASSWORD then run the seed command again.");
    return;
  }

  if (adminPassword.length < 12) {
    throw new Error("ADMIN_PASSWORD must be at least 12 characters.");
  }

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      role: Role.ADMIN,
      plan: Plan.PRO,
    },
    create: {
      name: adminName,
      email: adminEmail,
      passwordHash: hashSync(adminPassword, 12),
      role: Role.ADMIN,
      plan: Plan.PRO,
    },
  });

  console.log(`Admin user is ready: ${admin.email}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
