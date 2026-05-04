import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_USER_EMAILS = [
  "mike@torresroofing.com",
  "sarah@brightsmiledental.com",
  "james@riveralawncare.com",
  "emily@watsonlegal.com",
  "david@kimhvac.com",
  "lisa@spicetrail.com",
  "robert@hayesplumbing.com",
  "amanda@scottchiro.com",
  "chris@jjelectric.com",
  "nicole@adamsphotography.com",
  "marcus@webbremodeling.com",
  "jennifer@lotusacupuncture.com",
];

const DEMO_CONTACT_EMAILS = [
  "tom@bradleyelectric.com",
  "karen@nguyendds.com",
  "steve@martinroofing.net",
  "priya@tasteofbombay.com",
  "derek@dtlawnpros.com",
  "maria@santoslaw.com",
  "bill@crawfordair.com",
  "lisa@parkpediatrics.com",
];

async function main() {
  console.log("Removing default/demo data...");

  const demoUsers = await prisma.user.findMany({
    where: { email: { in: DEMO_USER_EMAILS } },
    select: { id: true, email: true },
  });
  const demoUserIds = demoUsers.map((u) => u.id);

  const paymentResult = await prisma.payment.deleteMany({
    where: {
      OR: [
        { userId: { in: demoUserIds.length ? demoUserIds : ["__none__"] } },
        { description: { startsWith: "Website build" } },
        { description: { startsWith: "Monthly subscription" } },
        { description: { startsWith: "Refund" } },
      ],
    },
  });

  const userResult = await prisma.user.deleteMany({
    where: { email: { in: DEMO_USER_EMAILS } },
  });

  const contactResult = await prisma.contact.deleteMany({
    where: { email: { in: DEMO_CONTACT_EMAILS } },
  });

  const pageViewResult = await prisma.pageView.deleteMany({
    where: {
      userAgent: "Mozilla/5.0",
      path: {
        in: [
          "/",
          "/pricing",
          "/contact",
          "/roofing",
          "/hvac",
          "/dentists",
          "/restaurants",
          "/law-firms",
          "/lawn-care",
        ],
      },
    },
  });

  console.log(`Deleted ${paymentResult.count} payments.`);
  console.log(`Deleted ${userResult.count} users.`);
  console.log(`Deleted ${contactResult.count} contacts.`);
  console.log(`Deleted ${pageViewResult.count} page views.`);
  console.log("Default/demo data cleanup complete.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
