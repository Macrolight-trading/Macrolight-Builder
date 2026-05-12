import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Client Messages" };

export default async function AdminMessagesPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "ADMIN") redirect("/admin");

  // Clients who have sent at least one message, with unread count
  const threads = await prisma.user.findMany({
    where: {
      role: "USER",
      messages: { some: {} },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { body: true, createdAt: true, fromAdmin: true, readAt: true },
      },
      _count: {
        select: {
          messages: {
            where: { fromAdmin: false, readAt: null },
          },
        },
      },
    },
  });

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Client Messages</h1>
        <p className="mt-1 text-sm text-gray-500">
          All client message threads. Click a row to open and reply.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {threads.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-16">No messages yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {threads.map((t) => {
              const latest = t.messages[0];
              const unread = t._count.messages;
              return (
                <li key={t.id}>
                  <Link
                    href={`/admin/portal/projects/${t.id}`}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="h-9 w-9 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-semibold text-sm shrink-0">
                      {(t.name || t.email).charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {t.name ?? t.email}
                      </p>
                      {latest && (
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {latest.fromAdmin ? "You: " : ""}{latest.body}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {latest && (
                        <p className="text-[11px] text-gray-400">
                          {new Date(latest.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      )}
                      {unread > 0 && (
                        <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-violet-600 text-[11px] font-bold text-white">
                          {unread}
                        </span>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
