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

const SAMPLE_THEMES = [
  {
    id: "bold-trade",
    name: "Bold & Professional",
    description: "Strong, high-contrast design built for trade businesses. Dark navy header, warm orange CTAs, built to convert leads fast.",
    swatches: ["#0f4f90", "#1a6fc4", "#e85d04"],
    previewUrl: "/samples/hvac.html",
    tag: "HVAC · Roofing · Plumbing · Electrical",
  },
  {
    id: "clean-welcoming",
    name: "Clean & Welcoming",
    description: "Light, airy design with a friendly feel. Teal tones, generous white space, and a warm accent that builds immediate trust.",
    swatches: ["#00574f", "#00897b", "#ff6b35"],
    previewUrl: "/samples/dentist.html",
    tag: "Healthcare · Dental · Wellness · Professional Services",
  },
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
    themePicks?: string | null;
    inspirationUrls?: string | null;
    additionalNotes?: string | null;
    completedAt?: Date | null;
  };
};

export default function OnboardingForm({ initialData }: OnboardingFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Parse saved theme picks from JSON string
  const parsedThemePicks: string[] = (() => {
    try {
      return JSON.parse(initialData.themePicks ?? "[]");
    } catch {
      return [];
    }
  })();

  const [form, setForm] = useState({
    businessName: initialData.businessName ?? "",
    tagline: initialData.tagline ?? "",
    primaryColor: initialData.primaryColor ?? "#6d28d9",
    secondaryColor: initialData.secondaryColor ?? "#10b981",
    targetAudience: initialData.targetAudience ?? "",
    keyServices: initialData.keyServices ?? "",
    competitors: initialData.competitors ?? "",
    tone: initialData.tone ?? "professional",
    themePicks: parsedThemePicks,
    inspirationUrls: initialData.inspirationUrls ?? "",
    additionalNotes: initialData.additionalNotes ?? "",
  });

  const set = <K extends keyof typeof form>(field: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [field]: value }));

  function toggleTheme(id: string) {
    setForm((f) => ({
      ...f,
      themePicks: f.themePicks.includes(id)
        ? f.themePicks.filter((t) => t !== id)
        : [...f.themePicks, id],
    }));
  }

  async function handleSave(completed: boolean) {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/portal/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          themePicks: JSON.stringify(form.themePicks),
          completed,
        }),
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
    <div className="space-y-10">

      {/* ── Business basics ── */}
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

      {/* ── Brand colors ── */}
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

      {/* ── Your business ── */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
          Your Business
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Who are your ideal customers? <span className="text-red-500">*</span>
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
              Competitors <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows={2}
              value={form.competitors}
              onChange={(e) => set("competitors", e.target.value)}
              placeholder="Names or websites of local competitors you want to outperform."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            />
          </div>
        </div>
      </section>

      {/* ── Brand voice ── */}
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

      {/* ── Design style ── */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-1">
          Design Style
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          Select any sample themes that appeal to you — we&apos;ll use these as a starting point and adapt them to your brand.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SAMPLE_THEMES.map((theme) => {
            const selected = form.themePicks.includes(theme.id);
            return (
              <div
                key={theme.id}
                onClick={() => toggleTheme(theme.id)}
                className={`relative rounded-xl border-2 cursor-pointer transition-all overflow-hidden ${
                  selected
                    ? "border-violet-500 shadow-md shadow-violet-100"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {/* Color swatch bar */}
                <div className="flex h-14">
                  {theme.swatches.map((color) => (
                    <div
                      key={color}
                      className="flex-1"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>

                {/* Card body */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{theme.name}</p>
                      <p className="mt-0.5 text-xs text-violet-600 font-medium">{theme.tag}</p>
                    </div>
                    {/* Checkbox */}
                    <div
                      className={`shrink-0 mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        selected
                          ? "bg-violet-600 border-violet-600"
                          : "bg-white border-gray-300"
                      }`}
                    >
                      {selected && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-gray-500 leading-relaxed">{theme.description}</p>
                  <a
                    href={theme.previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Preview this style
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Inspiration URLs ── */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-1">
          Sites You Love
        </h2>
        <p className="text-sm text-gray-500 mb-3">
          Paste URLs of any websites — competitors, businesses in other industries, anything whose look or feel you want us to draw from. One per line.
        </p>
        <textarea
          rows={4}
          value={form.inspirationUrls}
          onChange={(e) => set("inspirationUrls", e.target.value)}
          placeholder={"https://example.com\nhttps://anotherbusiness.com"}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
        />
      </section>

      {/* ── Anything else ── */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
          Anything Else?
        </h2>
        <textarea
          rows={4}
          value={form.additionalNotes}
          onChange={(e) => set("additionalNotes", e.target.value)}
          placeholder="Any other details, must-haves, or things you want to avoid."
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
