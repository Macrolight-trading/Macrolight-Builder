import { PrismaClient, Role, Plan, PaymentStatus, ContactStatus } from "@prisma/client";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ── Admin user ──────────────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: "admin@macrolight.co" },
    update: {},
    create: {
      name: "Bradley Admin",
      email: "admin@macrolight.co",
      passwordHash: hashSync("admin123", 12),
      role: Role.ADMIN,
      plan: Plan.PRO,
    },
  });
  console.log(`  Admin user: ${admin.email}`);

  // ── Demo users ──────────────────────────────────────────────────────────
  const demoUsers = [
    { name: "Mike Torres", email: "mike@torresroofing.com", plan: Plan.GROWTH },
    { name: "Sarah Chen", email: "sarah@brightsmiledental.com", plan: Plan.PRO },
    { name: "James Rivera", email: "james@riveralawncare.com", plan: Plan.STARTER },
    { name: "Emily Watson", email: "emily@watsonlegal.com", plan: Plan.PRO },
    { name: "David Kim", email: "david@kimhvac.com", plan: Plan.GROWTH },
    { name: "Lisa Patel", email: "lisa@spicetrail.com", plan: Plan.STARTER },
    { name: "Robert Hayes", email: "robert@hayesplumbing.com", plan: Plan.GROWTH },
    { name: "Amanda Scott", email: "amanda@scottchiro.com", plan: Plan.STARTER },
    { name: "Chris Johnson", email: "chris@jjelectric.com", plan: Plan.GROWTH },
    { name: "Nicole Adams", email: "nicole@adamsphotography.com", plan: Plan.PRO },
    { name: "Marcus Webb", email: "marcus@webbremodeling.com", plan: Plan.GROWTH },
    { name: "Jennifer Liu", email: "jennifer@lotusacupuncture.com", plan: Plan.STARTER },
  ];

  const createdUsers = [];
  for (const u of demoUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        name: u.name,
        email: u.email,
        passwordHash: hashSync("demo123", 10),
        role: Role.USER,
        plan: u.plan,
        createdAt: randomDate(180),
      },
    });
    createdUsers.push(user);
  }
  console.log(`  Created ${createdUsers.length} demo users`);

  // ── Payments ────────────────────────────────────────────────────────────
  const planPrices: Record<string, number> = {
    STARTER: 14900,
    GROWTH: 29900,
    PRO: 49900,
  };
  const buildFees: Record<string, number> = {
    STARTER: 99900,
    GROWTH: 199900,
    PRO: 349900,
  };

  let paymentCount = 0;
  for (const user of createdUsers) {
    // Build fee
    await prisma.payment.create({
      data: {
        userId: user.id,
        amount: buildFees[user.plan] || 99900,
        description: `Website build — ${user.plan} plan`,
        status: PaymentStatus.SUCCEEDED,
        createdAt: new Date(user.createdAt.getTime() + 86400000),
      },
    });
    paymentCount++;

    // Monthly subscriptions (1-5 months)
    const months = Math.floor(Math.random() * 5) + 1;
    for (let m = 0; m < months; m++) {
      const monthDate = new Date(user.createdAt);
      monthDate.setMonth(monthDate.getMonth() + m + 1);
      if (monthDate > new Date()) break;

      const status =
        Math.random() > 0.92
          ? PaymentStatus.FAILED
          : PaymentStatus.SUCCEEDED;

      await prisma.payment.create({
        data: {
          userId: user.id,
          amount: planPrices[user.plan] || 14900,
          description: `Monthly subscription — ${user.plan}`,
          status,
          createdAt: monthDate,
        },
      });
      paymentCount++;
    }
  }

  // A couple refunds
  const refundUser = createdUsers[2];
  await prisma.payment.create({
    data: {
      userId: refundUser.id,
      amount: 14900,
      description: "Refund — billing error",
      status: PaymentStatus.REFUNDED,
      createdAt: randomDate(30),
    },
  });
  paymentCount++;
  console.log(`  Created ${paymentCount} payments`);

  // ── Contacts (audit requests) ───────────────────────────────────────────
  const contacts = [
    { name: "Tom Bradley", email: "tom@bradleyelectric.com", phone: "(614) 555-0123", company: "Bradley Electric", industry: "hvac", message: "We're getting traffic but no calls. Would love to see what's wrong with our site.", status: ContactStatus.REPLIED },
    { name: "Karen Nguyen", email: "karen@nguyendds.com", phone: "(312) 555-0456", company: "Nguyen Family Dental", industry: "dentists", message: "Our current website was built five years ago. We'd like a modern site that actually brings in patients.", status: ContactStatus.READ },
    { name: "Steve Martin", email: "steve@martinroofing.net", phone: "(817) 555-0789", company: "Martin Roofing Co", industry: "roofing", message: "We need more leads from Google. Current site doesn't show up for any searches. Help!", status: ContactStatus.NEW },
    { name: "Priya Sharma", email: "priya@tasteofbombay.com", company: "Taste of Bombay", industry: "restaurants", message: "We want online ordering and a site that shows up when people search 'Indian food near me'. Budget is flexible.", status: ContactStatus.NEW },
    { name: "Derek Thompson", email: "derek@dtlawnpros.com", phone: "(919) 555-0234", company: "DT Lawn Pros", industry: "lawn-care", message: "Looking for a website and Google My Business optimization. We serve the whole Triangle area.", status: ContactStatus.NEW },
    { name: "Maria Santos", email: "maria@santoslaw.com", phone: "(305) 555-0567", company: "Santos & Associates", industry: "law-firms", message: "We need a professional website that converts visitors into consultations. Immigration law firm in Miami.", status: ContactStatus.REPLIED },
    { name: "Bill Crawford", email: "bill@crawfordair.com", company: "Crawford Air", industry: "hvac", message: "Our competitor has a way better website. We need to catch up fast.", status: ContactStatus.READ },
    { name: "Lisa Park", email: "lisa@parkpediatrics.com", phone: "(408) 555-0890", company: "Park Pediatrics", industry: "dentists", message: "We need a modern, friendly website for our pediatric dental practice. Current site looks outdated.", status: ContactStatus.NEW },
  ];

  for (const c of contacts) {
    await prisma.contact.create({
      data: {
        ...c,
        createdAt: randomDate(60),
      },
    });
  }
  console.log(`  Created ${contacts.length} contacts`);

  // ── Page views ──────────────────────────────────────────────────────────
  const paths = ["/", "/pricing", "/contact", "/roofing", "/hvac", "/dentists", "/restaurants", "/law-firms", "/lawn-care"];
  const referrers = [null, "https://google.com", "https://google.com", "https://google.com", "https://facebook.com", "https://yelp.com", "https://instagram.com", null, null];
  const countryCodes = ["US", "US", "US", "US", "US", "CA", "GB", "US", "US", "AU"];

  const pageViews = [];
  for (let i = 0; i < 850; i++) {
    pageViews.push({
      path: paths[Math.floor(Math.random() * paths.length)],
      referrer: referrers[Math.floor(Math.random() * referrers.length)],
      country: countryCodes[Math.floor(Math.random() * countryCodes.length)],
      userAgent: "Mozilla/5.0",
      createdAt: randomDate(30),
    });
  }
  await prisma.pageView.createMany({ data: pageViews });
  console.log(`  Created ${pageViews.length} page views`);

  console.log("\nSeed complete!");
  console.log("  Login:    admin@macrolight.co");
  console.log("  Password: admin123");
}

function randomDate(daysBack: number): Date {
  const now = Date.now();
  return new Date(now - Math.floor(Math.random() * daysBack * 86400000));
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
