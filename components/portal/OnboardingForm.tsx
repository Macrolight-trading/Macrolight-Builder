"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const TONE_OPTIONS = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly & Approachable" },
  { value: "bold", label: "Bold & Confident" },
  { value: "technical", label: "Technical / Expert" },
  { value: "casual", label: "Casual & Conversational" },
];

type OnboardingFormProps = {
  initialData: {
    businessName?: string | null;
    tagline?: string | null;
    primaryColor?: string | null;
    secondaryColor?: string | null;
    targetAudience?: string | null;
    keyServices?: string | null;
    competitors?: string | null;
    tone?: string | null;
    additionalNotes?: string | null;
    completedAt?: Date | null;
  };
};

export default function OnboardingForm({ initialData }: OnboardingFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    businessName: initialData.businessName ?? "",
    tagline: initialData.tagline ?? "",
    primaryColor: initialData.primaryColor ?? "#6d28d9",
    secondaryColor: initialData.secondaryColor ?? "#10b981",
    targetAudience: initialData.targetAudience ?? "",
    keyServices: initialData.keyServices ?? "",
    competitors: initialData.competitors ?? "",
    tone: initialData.tone ?? "professional",
    additionalNotes: initialData.additionalNotes ?? "",
  });

  const set = (field: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  async function handleSave(completed: boolean) {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/portal/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, completed }),
      });
      if (!res.ok) throw new Error("Save failed");
      setSaved(true);
      if (completed) {
        router.push("/portal/project");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const alreadyCompleted = !!initialData.completedAt;

  return (
    <div className="space-y-8">
      {/* Business basics */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
          Business Basics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.businessName}
              onChange={(e) => set("businessName", e.target.value)}
              placeholder="e.g. Apex Roofing Co."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tagline / Slogan
            </label>
            <input
              type="text"
              value={form.tagline}
              onChange={(e) => set("tagline", e.target.value)}
              placeholder="e.g. Roofing done right, every time."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>
      </section>

      {/* Brand colors */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
          Brand Colors
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Primary Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.primaryColor}
                onChange={(e) => set("primaryColor", e.target.value)}
                className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={form.primaryColor}
                onChange={(e) => set("primaryColor", e.target.value)}
                placeholder="#6d28d9"
                className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Secondary / Accent Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.secondaryColor}
                onChange={(e) => set("secondaryColor", e.target.value)}
                className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={form.secondaryColor}
                onChange={(e) => set("secondaryColor", e.target.value)}
                placeholder="#10b981"
                className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Audience & services */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
          Your Business
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Who are your ideal customers?{" "}
              <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={form.targetAudience}
              onChange={(e) => set("targetAudience", e.target.value)}
              placeholder="e.g. Homeowners aged 35–60 in the Dallas area who need roof repairs or replacements after storm damage."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Key Services / Products <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={form.keyServices}
              onChange={(e) => set("keyServices", e.target.value)}
              placeholder="e.g. Roof replacement, storm damage repair, gutters, skylights."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Competitors (optional)
            </label>
            <textarea
              rows={2}
              value={form.competitors}
              onChange={(e) => set("competitors", e.target.value)}
              placeholder="e.g. ABC Roofing, Dallas Roof Pros — websites or names you've seen that you like or want to outperform."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            />
          </div>
        </div>
      </section>

      {/* Tone */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
          Brand Voice
        </h2>
        <div className="flex flex-wrap gap-3">
          {TONE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => set("tone", opt.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                form.tone === opt.value
                  ? "bg-violet-600 border-violet-600 text-white"
                  : "bg-white border-gray-300 text-gray-700 hover:border-violet-400"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {/* Additional notes */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
          Anything Else?
        </h2>
        <textarea
          rows={4}
          value={form.additionalNotes}
          onChange={(e) => set("additionalNotes", e.target.value)}
          placeholder="Any other details, inspiration sites, must-haves, or things you want to avoid."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
        />
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && !alreadyCompleted && (
        <p className="text-sm text-emerald-600">Saved successfully.</p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          disabled={saving}
          onClick={() => handleSave(false)}
          className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving…" : "Save Draft"}
        </button>
        {!alreadyCompleted && (
          <button
            type="button"
            disabled={saving || !form.businessName || !form.targetAudience || !form.keyServices}
            onClick={() => handleSave(true)}
            className="px-5 py-2.5 rounded-lg bg-violet-600 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-40 transition-colors"
          >
            {saving ? "Submitting…" : "Submit & Start My Project →"}
          </button>
        )}
        {alreadyCompleted && (
          <span className="text-sm text-emerald-600 font-medium">
            ✓ Onboarding submitted
          </span>
        )}
      </div>
    </div>
  );
}
