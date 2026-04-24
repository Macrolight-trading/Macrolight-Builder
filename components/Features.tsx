import Image from "next/image";
import Card from "./Card";
import Section from "./Section";

interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const features: Feature[] = [
  {
    title: "Conversion-Focused Design",
    description:
      "Every section is engineered around a single question: will this visitor become a customer? No fluff, no distractions — just clarity that converts.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden
      >
        <path
          d="M12 2l2.39 4.84L20 8l-4 3.9.94 5.5L12 14.77 7.06 17.4 8 11.9 4 8l5.61-1.16L12 2z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Built-In Lead Capture System",
    description:
      "Forms, calls, chats and follow-ups wired into one pipeline. The moment a visitor raises their hand, your team (or our automation) takes over.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden
      >
        <path
          d="M4 6h16v10H5.17L4 17.17V6z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8 10h8M8 13h5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Lightning Fast Hosting",
    description:
      "Deployed on Vercel's global edge network. Sub-second loads, 99.99% uptime, and automatic scaling when your ad campaigns hit.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden
      >
        <path
          d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Ongoing Support & Edits",
    description:
      "Need a new page, a price change, or a seasonal offer? Submit it — we handle it. Your site stays fresh without you touching a line of code.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden
      >
        <path
          d="M12 15a3 3 0 100-6 3 3 0 000 6z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M19.4 15a7.97 7.97 0 00.1-3l2-1.5-2-3.5-2.3.9a8 8 0 00-2.6-1.5L14 4h-4l-.6 2.4a8 8 0 00-2.6 1.5L4.5 7l-2 3.5L4.5 12a7.97 7.97 0 00.1 3l-2 1.5 2 3.5 2.3-.9a8 8 0 002.6 1.5L10 22h4l.6-2.4a8 8 0 002.6-1.5l2.3.9 2-3.5-2.1-1.5z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export default function Features() {
  return (
    <Section id="features" padding="xl" className="border-t border-white/5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        <div className="order-2 lg:order-1">
          <div className="mx-auto max-w-2xl text-center lg:text-left">
            <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
              The system
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
              More than a website. A revenue channel.
            </h2>
            <p className="mt-4 text-lg text-white/60">
              Each piece of the stack is tuned for one outcome: turning
              strangers into paying customers.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {features.map((f) => (
              <Card key={f.title} className="group h-full p-5 sm:p-6">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 text-white ring-1 ring-inset ring-white/10 transition-transform duration-300 group-hover:scale-105">
                  <div className="h-5 w-5">{f.icon}</div>
                </div>
                <h3 className="mt-4 text-base font-semibold text-white">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm text-white/60 leading-relaxed">
                  {f.description}
                </p>
              </Card>
            ))}
          </div>
        </div>

        <div className="order-1 lg:order-2 lg:sticky lg:top-28">
          <div className="relative rounded-2xl border border-white/10 bg-zinc-900/40 p-4">
            <Image
              src="/images/placeholders/features-abstract.svg"
              alt="Visual overview: conversion system and service layers"
              width={480}
              height={400}
              className="h-auto w-full rounded-xl opacity-95"
              unoptimized
            />
          </div>
        </div>
      </div>
    </Section>
  );
}
