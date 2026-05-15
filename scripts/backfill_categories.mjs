import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const distinctCategories = await prisma.planOption.findMany({
  distinct: ["category"],
  select: { category: true },
});

let created = 0;
let existing = 0;
for (const { category } of distinctCategories) {
  if (!category) continue;
  const found = await prisma.planCategory.findUnique({ where: { name: category } });
  if (found) { existing++; continue; }
  await prisma.planCategory.create({
    data: { name: category, label: category, bundleDiscountPct: 0, sortOrder: 0, active: true },
  });
  created++;
}
console.log(`Backfill: ${created} created, ${existing} already existed`);
const all = await prisma.planCategory.findMany({ orderBy: { name: "asc" } });
for (const c of all) console.log(`  - ${c.name} (discount: ${c.bundleDiscountPct}%)`);
await prisma.$disconnect();
