"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import OnboardingProgressBar from "@/components/portal/OnboardingProgressBar";
import { calculateOnboardingProgress } from "@/lib/onboarding/progress";

const WELCOME_MESSAGE: UIMessage = {
  id: "welcome",
  role: "assistant",
  parts: [
    {
      type: "text",
      text: "Hi! I'm your Macrolight onboarding assistant. I'll ask a few questions about your business so we can build your site right the first time.\n\nTo start, what's your name and the name of your business?",
    },
  ],
};

type OnboardingChatProps = {
  initialMessages: UIMessage[];
  completedAt: Date | null;
  hasBrief: boolean;
  businessName: string | null;
};

function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => (part as { type: "text"; text: string }).text)
    .join("");
}

export default function OnboardingChat({
  initialMessages,
  completedAt,
  hasBrief,
  businessName,
}: OnboardingChatProps) {
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");

  const seedMessages = useMemo(() => {
    if (initialMessages.length > 0) return initialMessages;
    return [WELCOME_MESSAGE];
  }, [initialMessages]);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/portal/onboarding/chat",
    }),
    messages: seedMessages,
    onFinish: ({ messages: updatedMessages }) => {
      fetch("/api/portal/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatMessages: updatedMessages }),
      }).catch((err) => console.error("Failed to save chat transcript:", err));
      router.refresh();
    },
  });

  const isLoading = status === "submitted" || status === "streaming";
  const isCompleted = !!completedAt;

  const progress = useMemo(
    () => calculateOnboardingProgress(messages, isCompleted),
    [messages, isCompleted],
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <OnboardingProgressBar
        percent={progress.percent}
        phase={progress.phase}
        isCompleted={isCompleted}
      />

      {isCompleted && (
        <div className="shrink-0 border-b border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-900 sm:px-4 sm:py-3">
          <p className="font-semibold">
            Brief submitted{businessName ? ` for ${businessName}` : ""}.
          </p>
          <p className="mt-0.5 text-xs leading-snug text-emerald-800 sm:mt-1 sm:text-sm">
            You can keep chatting to update details.
          </p>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs font-medium">
            {hasBrief && (
              <a
                href="/api/portal/onboarding/brief"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 underline hover:text-emerald-900"
              >
                View brief
              </a>
            )}
            <Link
              href="/portal/media"
              className="text-emerald-700 underline hover:text-emerald-900"
            >
              Upload media
            </Link>
            <Link
              href="/portal/project"
              className="text-emerald-700 underline hover:text-emerald-900"
            >
              My project
            </Link>
          </div>
        </div>
      )}

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-gray-50 px-3 py-3 sm:space-y-4 sm:px-4 sm:py-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[92%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap sm:max-w-[85%] sm:px-4 sm:py-2.5 ${
                message.role === "user"
                  ? "rounded-br-sm bg-violet-600 text-white"
                  : "rounded-bl-sm border border-gray-200 bg-white text-gray-800 shadow-sm"
              }`}
            >
              {message.role === "assistant" && (
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-violet-600">
                  Macrolight Assistant
                </p>
              )}
              {getMessageText(message)}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm border border-gray-200 bg-white px-4 py-2.5 shadow-sm">
              <span className="flex gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!input.trim() || isLoading) return;
          sendMessage({ text: input });
          setInput("");
        }}
        className="shrink-0 border-t border-gray-200 bg-white p-3 sm:p-4"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
            placeholder="Type your answer…"
            rows={2}
            className="min-h-[2.75rem] flex-1 resize-none rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-base outline-none focus:ring-2 focus:ring-violet-500/30 sm:px-4 sm:py-3 sm:text-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="w-full rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-40 sm:w-auto sm:shrink-0 sm:px-5 sm:py-3"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
