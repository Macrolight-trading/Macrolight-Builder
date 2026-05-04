"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewAuditPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [clientName, setClientName] = useState("");
  const [crawlLimit, setCrawlLimit] = useState<number | "">("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/audits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          clientName: clientName.trim(),
          crawlLimit: crawlLimit === "" ? undefined : Number(crawlLimit),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Audit failed.");
        setSubmitting(false);
        return;
      }

      router.push(`/admin/audits/${data.id ?? data.jobId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error.");
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="mb-6">
        <Link
          href="/admin/audits"
          className="text-xs font-medium text-gray-500 hover:text-gray-700"
        >
          &larr; Back to audits
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Run a new SEO audit</h1>
        <p className="mt-1 text-sm text-gray-500">
          Enter the prospect or client URL. The audit takes up to 90 seconds.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl space-y-5"
      >
        <div>
          <label
            htmlFor="clientName"
            className="block text-sm font-medium text-gray-700"
          >
            Client / prospect name
          </label>
          <input
            id="clientName"
            type="text"
            required
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Acme Plumbing Co."
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            disabled={submitting}
          />
        </div>

        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700">
            Site URL
          </label>
          <input
            id="url"
            type="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://acmeplumbing.com"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            disabled={submitting}
          />
          <p className="mt-1 text-xs text-gray-400">
            Must be a public http:// or https:// URL.
          </p>
        </div>

        <div>
          <label
            htmlFor="crawlLimit"
            className="block text-sm font-medium text-gray-700"
          >
            Crawl limit <span className="text-gray-400">(optional)</span>
          </label>
          <input
            id="crawlLimit"
            type="number"
            min={1}
            max={100}
            value={crawlLimit}
            onChange={(e) =>
              setCrawlLimit(e.target.value === "" ? "" : Number(e.target.value))
            }
            placeholder="20"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            disabled={submitting}
          />
          <p className="mt-1 text-xs text-gray-400">
            Maximum number of pages the crawler will fetch. Defaults to 20.
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Spinner />
                Running audit…
              </>
            ) : (
              "Run audit"
            )}
          </button>
          <Link
            href="/admin/audits"
            className="text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            Cancel
          </Link>
        </div>

        {submitting && (
          <p className="text-xs text-gray-400">
            This page will redirect to the result when the audit completes.
            Don&apos;t close the tab.
          </p>
        )}
      </form>
    </>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4 text-white"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}
