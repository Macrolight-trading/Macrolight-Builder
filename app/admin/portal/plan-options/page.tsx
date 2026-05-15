import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import PlanOptionsManager from "@/components/admin/PlanOptionsManager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Plan Options" };

export default async function PlanOptionsPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "ADMIN") redirect("/admin");

  const options = await prisma.planOption.findMany({
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
  });

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Plan Options</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure the line items clients can pick from in the custom plan
          builder. Changes appear in the client portal immediately.
        </p>
      </div>

      <PlanOptionsManager initialOptions={JSON.parse(JSON.stringify(options))} />
    </>
  );
}
