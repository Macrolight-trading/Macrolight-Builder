"use client";

import { useState } from "react";

const inputCls =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400";

export default function SupportForm({
  initialName,
  initialEmail,
}: {
  initialName: string;
  initialEmail: string;
}) {
  const [name] = useState(initialName);
  const [email] = useState(initialEmail);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      // Reuse the public /api/contact endpoint. The portal user is already
      // authenticated; this just queues an entry in the Contact table so
      // the admin team picks it up the same way they see website
      // enquiries.
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || email,
          email,
          message: subject ? `[${subject}]\n\n${message}` : message,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Submission failed");
      }
      setFeedback({
        kind: "success",
        text: "Got it — we'll be in touch shortly.",
      });
      setSubject("");
      setMessage("");
    } catch (err: unknown) {
      setFeedback({
        kind: "error",
        text: err instanceof Error ? err.message : "Submission failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {feedback && (
        <div
          className={`rounded-lg px-3.5 py-2.5 text-sm ${
            feedback.kind === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {feedback.text}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
          From
        </label>
        <input
          value={`${name ? name + " — " : ""}${email}`}
          disabled
          className={inputCls + " bg-gray-50 text-gray-500"}
        />
      </div>

      <div>
        <label
          htmlFor="subject"
          className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5"
        >
          Subject
        </label>
        <input
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className={inputCls}
          placeholder="e.g. Update hours on homepage"
        />
      </div>

      <div>
        <label
          htmlFor="message"
          className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5"
        >
          Message
        </label>
        <textarea
          id="message"
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={inputCls + " min-h-[150px]"}
          placeholder="Describe the request, fix, or question."
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={loading || !message.trim()}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
        >
          {loading ? "Sending…" : "Send request"}
        </button>
      </div>
    </form>
  );
}
