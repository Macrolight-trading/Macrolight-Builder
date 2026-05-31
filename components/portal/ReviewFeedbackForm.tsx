"use client";

import { useState } from "react";

export default function ReviewFeedbackForm() {
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setStatus("sending");
    try {
      // Post to messages thread (existing — keeps the portal message history)
      const msgRes = await fetch("/api/portal/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: body.trim() }),
      });
      if (!msgRes.ok) throw new Error("message post failed");

      // Also enqueue a revision_submitted HermesEvent so the agent picks it up
      const revRes = await fetch("/api/portal/revisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback: body.trim() }),
      });
      if (!revRes.ok) throw new Error("revision enqueue failed");

      setStatus("sent");
      setBody("");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-5 py-4 text-sm text-emerald-800">
        <p className="font-semibold">Feedback sent!</p>
        <p className="mt-0.5 text-emerald-700">
          Our agent will apply your changes and notify you when the update is
          live.{" "}
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="underline hover:no-underline"
          >
            Send more feedback
          </button>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        rows={4}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Describe any changes you'd like — layout, copy, colours, anything at all…"
        className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 resize-none"
        disabled={status === "sending"}
      />
      {status === "error" && (
        <p className="text-xs text-red-600">Something went wrong — please try again.</p>
      )}
      <button
        type="submit"
        disabled={status === "sending" || !body.trim()}
        className="px-4 py-2 rounded-lg bg-violet-600 text-sm font-semibold text-white hover:bg-violet-700 transition-colors disabled:opacity-50"
      >
        {status === "sending" ? "Sending…" : "Send feedback"}
      </button>
    </form>
  );
}
