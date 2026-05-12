"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const inputCls =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400";

export default function ProfileForm({
  initialName,
  email,
  plan,
}: {
  initialName: string;
  email: string;
  plan: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const payload: { name: string; password?: string } = { name };
      if (password) payload.password = password;

      const res = await fetch("/api/portal/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Update failed");
      }
      setMessage({ kind: "success", text: "Profile saved." });
      setPassword("");
      router.refresh();
    } catch (err: unknown) {
      setMessage({
        kind: "error",
        text: err instanceof Error ? err.message : "Update failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      {message && (
        <div
          className={`rounded-lg px-3.5 py-2.5 text-sm ${
            message.kind === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
          Email
        </label>
        <input
          value={email}
          disabled
          className={inputCls + " bg-gray-50 text-gray-500"}
        />
        <p className="mt-1 text-xs text-gray-400">
          Email cannot be changed. Contact support to update it.
        </p>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
          Plan
        </label>
        <div className="inline-flex items-center rounded-lg bg-violet-50 px-3 py-1.5 text-sm font-semibold text-violet-700">
          {plan}
        </div>
      </div>

      <div>
        <label
          htmlFor="name"
          className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5"
        >
          Name
        </label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputCls}
          placeholder="Your name"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5"
        >
          New password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          className={inputCls}
          placeholder="Leave blank to keep current password"
        />
        <p className="mt-1 text-xs text-gray-400">
          At least 8 characters. Skip this field if you don&apos;t want to
          change it.
        </p>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
        >
          {loading ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
