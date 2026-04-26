import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  // Get page views grouped by path
  const pageViewsByPath = await prisma.pageView.groupBy({
    by: ["path"],
    _count: true,
    orderBy: { _count: { path: "desc" } },
    take: 15,
  });

  // Get page views grouped by day (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentViews = await prisma.pageView.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  // Group by day
  const dailyMap = new Map<string, number>();
  recentViews.forEach((v) => {
    const day = v.createdAt.toISOString().split("T")[0];
    dailyMap.set(day, (dailyMap.get(day) || 0) + 1);
  });
  const dailyData = Array.from(dailyMap.entries())
    .map(([date, count]) => ({ date, count }))
    .slice(-14);

  // Referrer breakdown
  const referrers = await prisma.pageView.groupBy({
    by: ["referrer"],
    _count: true,
    orderBy: { _count: { referrer: "desc" } },
    take: 10,
  });

  // Country breakdown
  const countries = await prisma.pageView.groupBy({
    by: ["country"],
    _count: true,
    orderBy: { _count: { country: "desc" } },
    take: 10,
  });

  const totalViews = await prisma.pageView.count();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayViews = await prisma.pageView.count({
    where: { createdAt: { gte: todayStart } },
  });

  // Find max for bar scaling
  const maxDaily = Math.max(...dailyData.map((d) => d.count), 1);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">
          {totalViews.toLocaleString()} total page views &middot;{" "}
          {todayViews.toLocaleString()} today
        </p>
      </div>

      {/* Mini bar chart - last 14 days */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">
          Page Views — Last 14 Days
        </h2>
        {dailyData.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">
            No page view data yet.
          </p>
        ) : (
          <div className="flex items-end gap-1.5 h-32">
            {dailyData.map((d) => (
              <div
                key={d.date}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <span className="text-[10px] text-gray-400 font-medium">
                  {d.count}
                </span>
                <div
                  className="w-full rounded-t bg-violet-500 transition-all"
                  style={{
                    height: `${Math.max((d.count / maxDaily) * 100, 4)}%`,
                    minHeight: "4px",
                  }}
                />
                <span className="text-[9px] text-gray-400 whitespace-nowrap">
                  {new Date(d.date + "T12:00:00").toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Three-column breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Top pages */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Top Pages</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {pageViewsByPath.length === 0 ? (
              <p className="px-5 py-8 text-sm text-gray-400 text-center">
                No data.
              </p>
            ) : (
              pageViewsByPath.map((p) => (
                <div
                  key={p.path}
                  className="px-5 py-2.5 flex items-center justify-between"
                >
                  <span className="text-sm text-gray-700 font-mono truncate max-w-[180px]">
                    {p.path}
                  </span>
                  <span className="text-xs font-semibold text-gray-400">
                    {p._count}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top referrers */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">
              Top Referrers
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            {referrers.length === 0 ? (
              <p className="px-5 py-8 text-sm text-gray-400 text-center">
                No data.
              </p>
            ) : (
              referrers.map((r) => (
                <div
                  key={r.referrer || "direct"}
                  className="px-5 py-2.5 flex items-center justify-between"
                >
                  <span className="text-sm text-gray-700 truncate max-w-[180px]">
                    {r.referrer || "(direct)"}
                  </span>
                  <span className="text-xs font-semibold text-gray-400">
                    {r._count}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top countries */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">
              Top Countries
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            {countries.length === 0 ? (
              <p className="px-5 py-8 text-sm text-gray-400 text-center">
                No data.
              </p>
            ) : (
              countries.map((c) => (
                <div
                  key={c.country || "unknown"}
                  className="px-5 py-2.5 flex items-center justify-between"
                >
                  <span className="text-sm text-gray-700">
                    {c.country || "Unknown"}
                  </span>
                  <span className="text-xs font-semibold text-gray-400">
                    {c._count}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
