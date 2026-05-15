"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type BillingType = "ONE_TIME" | "MONTHLY";
type Status = "PENDING" | "APPROVED" | "REJECTED" | "CANCELED";

type RequestItem = {
  id: string;
  nameSnapshot: string;
  category: string;
  priceCents: number;
  billingType: BillingType;
  includedInBasePlan: boolean;
};

type PlanRequest = {
  id: string;
  status: Status;
  basePlan: string;
  monthlyCents: number;
  oneTimeCents: number;
  bundleDiscountCents: number;
  notes: string | null;
  adminNotes: string | null;
  reviewedAt: string | null;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
  items: RequestItem[];
};

const STATUS_STYLES: Record<Status, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  APPROVED: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-red-50 text-red-700",
  CANCELED: "bg-gray-100 text-gray-500",
};

function money(cents: number) {
  return `$${(cents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function timeAgo(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function PlanRequestsReview({
  initialRequests,
  counts,
  activeFilter,
}: {
  initialRequests: PlanRequest[];
  counts: Record<string, number>;
  activeFilter: string;
}) {
  const router = useRouter();
  const [requests, setRequests] = useState(initialRequests);
  const [busy, setBusy] = useState<string | null>(null);

  async function setStatus(id: string, status: Status) {
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/plan-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Update failed");
      setRequests((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                status,
                reviewedAt: new Date().toISOString(),
              }
            : r,
        ),
      );
      router.refresh();
    } catch {
      alert("Could not update request.");
    } finally {
      setBusy(null);
    }
  }

  async function deleteRequest(id: string) {
    if (!confirm("Permanently delete this request? This cannot be undone.")) return;
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/plan-requests/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setRequests((prev) => prev.filter((r) => r.id !== id));
      router.refresh();
    } catch {
      alert("Could not delete request.");
    } finally {
      setBusy(null);
    }
  }

  const filters: { label: string; value: string }[] = [
    { label: "All", value: "ALL" },
    { label: "Pending", value: "PENDING" },
    { label: "Approved", value: "APPROVED" },
    { label: "Rejected", value: "REJECTED" },
    { label: "Canceled", value: "CANCELED" },
  ];

  return (
    <>
      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((f) => {
          const active = activeFilter === f.value;
          const count = f.value === "ALL"
            ? Object.values(counts).reduce((a, b) => a + b, 0)
            : counts[f.value] ?? 0;
          return (
            <Link
              key={f.value}
              href={
                f.value === "ALL"
                  ? "/admin/portal/plan-requests"
                  : `/admin/portal/plan-requests?status=${f.value.toLowerCase()}`
              }
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                active
                  ? "bg-violet-600 text-white border-violet-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
            >
              {f.label}
              <span className={`ml-1.5 ${active ? "text-violet-200" : "text-gray-400"}`}>
                {count}
              </span>
            </Link>
          );
        })}
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-sm text-gray-500">No requests in this view.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">
                      {r.user.name ?? r.user.email}
                    </span>
                    <span
                      className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${STATUS_STYLES[r.status]}`}
                    >
                      {r.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {r.user.email} · Submitted {timeAgo(r.createdAt)} · Base plan{" "}
                    <span className="font-semibold">{r.basePlan}</span>
                  </p>
                </div>
                <div className="text-right">
                  {r.bundleDiscountCents > 0 && (
                    <p className="text-xs text-emerald-700 mb-0.5">
                      Bundle savings: −{money(r.bundleDiscountCents)}
                    </p>
                  )}
                  {r.monthlyCents > 0 && (
                    <p className="text-sm">
                      <span className="font-bold text-violet-700">
                        {money(r.monthlyCents)}
                      </span>
                      <span className="text-xs text-gray-400">/mo</span>
                    </p>
                  )}
                  {r.oneTimeCents > 0 && (
                    <p className="text-sm">
                      <span className="font-bold text-amber-700">
                        {money(r.oneTimeCents)}
                      </span>
                      <span className="text-xs text-gray-400"> one-time</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="px-5 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Line items ({r.items.length})
                </p>
                <ul className="space-y-1.5">
                  {r.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-gray-700 flex items-center gap-2">
                        <span className="text-xs text-gray-400">
                          {item.category}
                        </span>
                        <span>{item.nameSnapshot}</span>
                        {item.includedInBasePlan && (
                          <span className="inline-block text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-violet-50 text-violet-700">
                            Included
                          </span>
                        )}
                      </span>
                      <span
                        className={`font-mono ${
                          item.includedInBasePlan
                            ? "text-gray-400 line-through"
                            : "text-gray-900"
                        }`}
                      >
                        {money(item.priceCents)}
                        {item.billingType === "MONTHLY" && (
                          <span className="text-xs text-gray-400">/mo</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>

                {r.notes && (
                  <div className="mt-4 text-sm bg-gray-50 rounded-lg px-3 py-2 text-gray-700">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
                      Client note
                    </p>
                    {r.notes}
                  </div>
                )}
              </div>

              {r.status === "PENDING" && (
                <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-2">
                  <button
                    onClick={() => setStatus(r.id, "REJECTED")}
                    disabled={busy === r.id}
                    className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => setStatus(r.id, "APPROVED")}
                    disabled={busy === r.id}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                  >
                    Approve
                  </button>
                </div>
              )}
              {(r.status === "REJECTED" || r.status === "CANCELED") && (
                <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                  <button
                    onClick={() => deleteRequest(r.id)}
                    disabled={busy === r.id}
                    className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                  >
                    {busy === r.id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
