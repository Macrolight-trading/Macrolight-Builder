"use client";

import { useState } from "react";

type AdminStrapiSite = {
  id: string;
  name: string;
  slug: string;
  userId: string | null;
  projectId: string | null;
  strapiBaseUrl: string | null;
  strapiSpaceId: string | null;
  strapiCollection: string | null;
  status: "UNLINKED" | "PENDING" | "ACTIVE" | "ERROR" | "DISABLED";
  pairingKeyPrefix: string | null;
  pairingKeyLast4: string | null;
  pairingKeyRotatedAt: string | null;
  lastSyncedAt: string | null;
  lastPairedAt: string | null;
  lastError: string | null;
  notes: string | null;
  hasPairingKey: boolean;
  createdAt: string;
  updatedAt: string;
};

const STATUSES = ["UNLINKED", "PENDING", "ACTIVE", "ERROR", "DISABLED"] as const;

const STATUS_COLORS: Record<string, string> = {
  UNLINKED: "bg-gray-100 text-gray-700",
  PENDING: "bg-amber-50 text-amber-700",
  ACTIVE: "bg-emerald-50 text-emerald-700",
  ERROR: "bg-red-50 text-red-700",
  DISABLED: "bg-gray-200 text-gray-500",
};

type FormState = {
  id?: string;
  name: string;
  slug: string;
  userId: string;
  projectId: string;
  strapiBaseUrl: string;
  strapiSpaceId: string;
  strapiCollection: string;
  status: AdminStrapiSite["status"];
  notes: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  slug: "",
  userId: "",
  projectId: "",
  strapiBaseUrl: "",
  strapiSpaceId: "",
  strapiCollection: "",
  status: "PENDING",
  notes: "",
};

function fmtDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

export default function StrapiSiteManager({ initialSites }: { initialSites: AdminStrapiSite[] }) {
  const [sites, setSites] = useState<AdminStrapiSite[]>(initialSites);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revealedKey, setRevealedKey] = useState<{ siteId: string; token: string } | null>(null);

  function startCreate() {
    setForm(EMPTY_FORM);
    setEditing(true);
    setError(null);
  }

  function startEdit(site: AdminStrapiSite) {
    setForm({
      id: site.id,
      name: site.name,
      slug: site.slug,
      userId: site.userId ?? "",
      projectId: site.projectId ?? "",
      strapiBaseUrl: site.strapiBaseUrl ?? "",
      strapiSpaceId: site.strapiSpaceId ?? "",
      strapiCollection: site.strapiCollection ?? "",
      status: site.status,
      notes: site.notes ?? "",
    });
    setEditing(true);
    setError(null);
  }

  function upsertLocal(site: AdminStrapiSite) {
    setSites((prev) => {
      const idx = prev.findIndex((s) => s.id === site.id);
      if (idx === -1) return [site, ...prev];
      const next = [...prev];
      next[idx] = site;
      return next;
    });
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/strapi/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Failed to save site.");
        return;
      }
      upsertLocal(data.site);
      setEditing(false);
      setForm(EMPTY_FORM);
    } catch {
      setError("Network error while saving.");
    } finally {
      setSaving(false);
    }
  }

  async function rotateKey(site: AdminStrapiSite) {
    if (
      site.hasPairingKey &&
      !window.confirm(
        "Regenerate the site API key? The current key stops working immediately for VisBoost and the client site renderer."
      )
    ) {
      return;
    }
    setError(null);
    try {
      const res = await fetch(`/api/admin/strapi/sites/${site.id}/rotate-key`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Failed to rotate key.");
        return;
      }
      upsertLocal(data.site);
      setRevealedKey({ siteId: site.id, token: data.token });
    } catch {
      setError("Network error while rotating key.");
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {revealedKey && (
        <div className="rounded-lg border border-violet-200 bg-violet-50 px-4 py-3">
          <p className="text-sm font-semibold text-violet-800">
            New site API key — copy it now, it won&apos;t be shown again. Use the same
            key in VisBoost and the client site (server-side env only).
          </p>
          <code className="mt-2 block break-all rounded bg-white px-3 py-2 text-xs text-gray-800 border border-violet-100">
            {revealedKey.token}
          </code>
          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(revealedKey.token)}
              className="text-xs font-semibold text-violet-700 hover:text-violet-900"
            >
              Copy
            </button>
            <button
              type="button"
              onClick={() => setRevealedKey(null)}
              className="text-xs font-semibold text-gray-500 hover:text-gray-700"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        {!editing && (
          <button
            type="button"
            onClick={startCreate}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
          >
            + New Strapi site
          </button>
        )}
      </div>

      {editing && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-900">
            {form.id ? "Edit site" : "New site"}
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <Field
              label="Slug (site identifier)"
              value={form.slug}
              onChange={(v) => setForm({ ...form, slug: v })}
            />
            <Field
              label="Builder User ID (optional)"
              value={form.userId}
              onChange={(v) => setForm({ ...form, userId: v })}
            />
            <Field
              label="Builder Project ID (optional)"
              value={form.projectId}
              onChange={(v) => setForm({ ...form, projectId: v })}
            />
            <Field
              label="Strapi base URL"
              value={form.strapiBaseUrl}
              onChange={(v) => setForm({ ...form, strapiBaseUrl: v })}
              placeholder="https://cms.macrolight.io"
            />
            <Field
              label="Strapi space ID"
              value={form.strapiSpaceId}
              onChange={(v) => setForm({ ...form, strapiSpaceId: v })}
            />
            <Field
              label="Strapi collection"
              value={form.strapiCollection}
              onChange={(v) => setForm({ ...form, strapiCollection: v })}
            />
            <label className="block">
              <span className="text-xs font-medium text-gray-600">Status</span>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as AdminStrapiSite["status"] })
                }
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-gray-600">Notes</span>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
          </div>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={save}
              disabled={saving || !form.name || !form.slug}
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setForm(EMPTY_FORM);
              }}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {sites.length === 0 ? (
          <p className="py-16 text-center text-sm text-gray-400">No Strapi sites yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                <th className="px-5 py-3">Site</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Site API key</th>
                <th className="px-5 py-3">Last paired</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sites.map((site) => (
                <tr key={site.id} className="hover:bg-gray-50/50 align-top">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-gray-900">{site.name}</p>
                    <p className="text-xs text-gray-400">{site.slug}</p>
                    {(site.userId || site.projectId) && (
                      <p className="mt-0.5 text-[11px] text-gray-400">
                        {site.userId ? `user:${site.userId}` : ""}
                        {site.userId && site.projectId ? " · " : ""}
                        {site.projectId ? `proj:${site.projectId}` : ""}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        STATUS_COLORS[site.status] ?? ""
                      }`}
                    >
                      {site.status}
                    </span>
                    {site.lastError && (
                      <p className="mt-1 max-w-[16rem] truncate text-[11px] text-red-500" title={site.lastError}>
                        {site.lastError}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">
                    {site.hasPairingKey ? (
                      <code className="text-xs">
                        {site.pairingKeyPrefix}…{site.pairingKeyLast4}
                      </code>
                    ) : (
                      <span className="text-xs text-gray-400">none</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-500">{fmtDate(site.lastPairedAt)}</td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => startEdit(site)}
                        className="text-xs font-semibold text-violet-600 hover:text-violet-700"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => rotateKey(site)}
                        className="text-xs font-semibold text-gray-600 hover:text-gray-900"
                      >
                        {site.hasPairingKey ? "Rotate key" : "Generate API key"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-gray-600">{label}</span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
      />
    </label>
  );
}
