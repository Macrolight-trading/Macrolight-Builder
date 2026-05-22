"use client";

import { useState } from "react";

const ROLES = ["USER", "ADMIN"] as const;
type Role = (typeof ROLES)[number];

const roleStyles: Record<Role, string> = {
  USER: "bg-gray-100 text-gray-600",
  ADMIN: "bg-violet-50 text-violet-700",
};

export function RoleSelector({
  userId,
  initialRole,
  userLabel,
  isSelf = false,
}: {
  userId: string;
  initialRole: Role;
  /** Email or name — shown in the confirm prompt so the admin knows who they're promoting. */
  userLabel: string;
  /** True when this row is the currently signed-in admin. Disables the control so they can't demote themselves. */
  isSelf?: boolean;
}) {
  const [role, setRole] = useState<Role>(initialRole);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(next: Role) {
    if (next === role) return;

    // Promoting to admin is privileged — confirm first.
    if (next === "ADMIN") {
      const ok = window.confirm(
        `Promote ${userLabel} to ADMIN? They will gain full access to the admin portal.`
      );
      if (!ok) return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: next }),
      });
      if (res.ok) {
        setRole(next);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || "Failed to update role.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  }

  if (isSelf) {
    return (
      <span
        title="You can't change your own role."
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${roleStyles[role]}`}
      >
        {role}
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        {ROLES.map((r) => (
          <button
            key={r}
            disabled={saving}
            onClick={() => handleChange(r)}
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide transition-opacity ${
              r === role
                ? roleStyles[r]
                : "bg-gray-50 text-gray-300 hover:text-gray-500"
            } ${saving ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            {r}
          </button>
        ))}
      </div>
      {error && (
        <p className="text-[10px] text-red-500">{error}</p>
      )}
    </div>
  );
}
