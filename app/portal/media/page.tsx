import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import MediaUploader from "@/components/portal/MediaUploader";

export const dynamic = "force-dynamic";
export const metadata = { title: "Media" };

export default async function MediaPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return null;

  const files = await prisma.mediaFile.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Media</h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload your logo, team photos, property images, and anything else
          you&apos;d like featured on your website.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <MediaUploader
          initialFiles={files.map((f) => ({
            ...f,
            createdAt: f.createdAt.toISOString(),
          }))}
        />
      </div>
    </>
  );
}
