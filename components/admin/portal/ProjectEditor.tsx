"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STAGES = [
  { value: "ONBOARDING", label: "Onboarding" },
  { value: "DESIGN", label: "Design" },
  { value: "DEVELOPMENT", label: "Development" },
  { value: "REVIEW", label: "Review" },
  { value: "LAUNCHED", label: "Launched" },
] as const;

type Props = {
  userId: string;
  initialStage: string;
  initialLiveUrl: string;
  initialPreviewUrl: string;
  initialNotes: string;
};

export default function ProjectEditor({ userId, initialStage, initialLiveUrl, initialPreviewUrl, initialNotes }: Props) {
  const router = useRouter();
  const [stage, setStage] = useState(initialStage);
  const [liveUrl, setLiveUrl] = useState(initialLiveUrl);
  const [previewUrl, setPreviewUrl] = useState(initialPreviewUrl);
  const [notes, setNotes] = useState(initialNotes);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const res = await fetch("/api/admin/portal/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, stage, liveUrl, previewUrl, notes }),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
      router.refresh();
    } catch {
      setError("Save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Stage */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Build Stage</label>
        <div className="flex flex-wrap gap-2">
          {STAGES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setStage(s.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                stage === s.value
                  ? "bg-violet-600 border-violet-600 text-white"
                  : "bg-white border-gray-300 text-gray-700 hover:border-violet-400"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Preview URL — shown when Review stage is active */}
      {stage === "REVIEW" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Preview URL <span className="text-gray-400 font-normal">(shown to client during Review)</span>
          </label>
          <input
            type="url"
            value={previewUrl}
            onChange={(e) => setPreviewUrl(e.target.value)}
            placeholder="https://preview.clientsite.com"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
      )}

      {/* Live URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Live URL <span className="text-gray-400 font-normal">(shown when Launched)</span>
        </label>
        <input
          type="url"
          value={liveUrl}
          onChange={(e) => setLiveUrl(e.target.value)}
          placeholder="https://clientsite.com"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Note to client (displayed on their Project page)
        </label>
        <textarea
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. We're currently working on the homepage hero — check back in a day or two!"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && <p className="text-sm text-emerald-600">Saved.</p>}

      <button
        type="button"
        disabled={saving}
        onClick={save}
        className="px-5 py-2.5 rounded-lg bg-violet-600 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50 transition-colors"
      >
        {saving ? "Saving…" : "Save Changes"}
      </button>
    </div>
  );
}
