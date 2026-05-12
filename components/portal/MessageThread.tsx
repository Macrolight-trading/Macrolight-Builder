"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  id: string;
  fromAdmin: boolean;
  body: string;
  readAt: string | null;
  createdAt: string;
};

type Props = {
  initialMessages: Message[];
  /** Pass a userId when an admin is viewing a client thread */
  targetUserId?: string;
};

export default function MessageThread({ initialMessages, targetUserId }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    if (!body.trim()) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/portal/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: body.trim(),
          ...(targetUserId ? { userId: targetUserId } : {}),
        }),
      });
      if (!res.ok) throw new Error();
      const msg: Message = await res.json();
      setMessages((m) => [...m, msg]);
      setBody("");
    } catch {
      setError("Couldn't send message. Please try again.");
    } finally {
      setSending(false);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="flex flex-col h-[560px]">
      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-sm text-gray-400 mt-16">
            No messages yet. Say hello!
          </p>
        )}
        {messages.map((msg) => {
          const isOwn = !msg.fromAdmin; // from client's perspective
          const fromAdmin = msg.fromAdmin;
          return (
            <div
              key={msg.id}
              className={`flex ${fromAdmin ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                  fromAdmin
                    ? "bg-gray-100 text-gray-900 rounded-tl-sm"
                    : "bg-violet-600 text-white rounded-tr-sm"
                }`}
              >
                {fromAdmin && (
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-600 mb-1">
                    Macrolight Team
                  </p>
                )}
                <p className="whitespace-pre-wrap leading-relaxed">{msg.body}</p>
                <p
                  className={`text-[10px] mt-1 ${
                    fromAdmin ? "text-gray-400" : "text-violet-200"
                  }`}
                >
                  {new Date(msg.createdAt).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="border-t border-gray-200 p-4">
        {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
        <div className="flex gap-2 items-end">
          <textarea
            rows={2}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type a message… (Ctrl+Enter to send)"
            className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
          />
          <button
            type="button"
            disabled={sending || !body.trim()}
            onClick={send}
            className="px-4 py-2 rounded-xl bg-violet-600 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-40 transition-colors shrink-0"
          >
            {sending ? "…" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
