"use client";

import Link from "next/link";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useReducedMotion,
} from "motion/react";
import {
  useRef,
  useState,
  useEffect,
  useCallback,
  type ComponentType,
} from "react";
import { DUR, EASE, STAGGER } from "@/components/motion/tokens";
import Magnetic from "@/components/motion/Magnetic";
import {
  LawnCarePreview,
  LawFirmPreview,
  RestaurantPreview,
  HvacPreview,
  DentistPreview,
} from "./previews";

/**
 * V2 Hero — layered asymmetric, with a multi-card shuffle stage on desktop.
 *
 * Desktop (lg+): all 5 sample previews live in the right-column stage at
 * once. One is the centered main display (full size + top z-index), the
 * other four sit at fixed home corners (scaled 0.55, dimmed). Auto-shuffle
 * cycles every ROTATE_INTERVAL_MS; hover pauses; chips at the stage's
 * bottom jump to a card and show a progress bar counting to the next swap.
 *
 * Mobile: stacked single-column. The fanned multi-card layout doesn't fit
 * narrow viewports, so mobile keeps the simpler single-preview carousel.
 */

const ACCENT = "#C8A24B";
const ROTATE_INTERVAL_MS = 5500;
const HEADLINE_INTERVAL_MS = 6500;

type HeadlineLine = { words: string[]; className: string };
type Headline = HeadlineLine[];

const HEADLINES: Headline[] = [
  [
    { words: ["Your", "website", "should"], className: "text-stone-900" },
    { words: ["win", "customers."], className: "italic text-stone-900" },
    { words: ["Not", "just", "visitors."], className: "text-stone-300" },
  ],
  [
    { words: ["Your", "phone", "should"], className: "text-stone-900" },
    { words: ["be", "ringing", "more."], className: "italic text-stone-900" },
    { words: ["Every", "single", "month."], className: "text-stone-300" },
  ],
  [
    { words: ["Stop", "losing", "leads"], className: "text-stone-900" },
    { words: ["to", "slower", "competitors."], className: "italic text-stone-900" },
    { words: ["Catch", "up", "in", "21", "days."], className: "text-stone-300" },
  ],
];

interface PreviewSample {
  href: string;
  label: string;
  url: string;
  accent: string;
  Preview: ComponentType;
}

const SAMPLES: PreviewSample[] = [
  { href: "/restaurants", label: "Restaurant", url: "thepearlkitchen.com", accent: "#C9A96E", Preview: RestaurantPreview },
  { href: "/law-firms", label: "Law firm", url: "crestwoodlegal.com", accent: "#C9A84C", Preview: LawFirmPreview },
  { href: "/hvac", label: "HVAC", url: "arcticbreezehhvac.com", accent: "#1a6fc4", Preview: HvacPreview },
  { href: "/dentists", label: "Dentists", url: "brightsmile-dental.com", accent: "#00897b", Preview: DentistPreview },
  { href: "/lawn-care", label: "Lawn care", url: "greenfield-lawn.com", accent: "#6BA33E", Preview: LawnCarePreview },
];

type StageHome = { top: string; left: string; rotate: number };

/* Home positions tuned to the 540px-tall stage. Cards live in the top
   ~75% so the chip pill at the bottom stays clear and nothing bleeds
   into the trust strip below the grid. */
const HOMES: StageHome[] = [
  { top: "-4%", left: "0%",   rotate: -5 }, // Restaurant  → top-left
  { top: "-4%", left: "62%",  rotate: 4 },  // Law firm    → top-right
  { top: "26%", left: "-6%",  rotate: -3 }, // HVAC        → mid-left
  { top: "26%", left: "68%",  rotate: 5 },  // Dentists    → mid-right
  { top: "44%", left: "30%",  rotate: -1 }, // Lawn care   → lower-center
];

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "-25%"]);
  const bgOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.4]);
  const previewY = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]);

  return (
    <section ref={ref} className="relative isolate overflow-hidden bg-stone-50">
      {!reduce && (
        <motion.div
          aria-hidden
          style={{ y: bgY, opacity: bgOpacity }}
          className="absolute inset-0 z-0 pointer-events-none"
        >
          <div
            className="absolute inset-0"
            style={{ background: `radial-gradient(60% 60% at 65% 40%, ${ACCENT}33 0%, transparent 60%)` }}
          />
        </motion.div>
      )}

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-0 pt-12 sm:pt-16 lg:pt-20 pb-14 sm:pb-20">
        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-0 items-center min-h-[560px] lg:min-h-[600px]">
          <div className="lg:col-span-7 lg:pr-6 lg:-ml-10 relative z-30">
            <motion.p
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DUR.fast, ease: EASE }}
              className="text-[0.65rem] sm:text-xs font-medium uppercase tracking-[0.22em] text-stone-500 mb-5 sm:mb-7"
            >
              Macrolight Builder · Birmingham, MI
            </motion.p>

            <RotatingHeadline />

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DUR.base, ease: EASE, delay: 0.9 }}
              className="lg:hidden mt-8 sm:mt-10"
            >
              <PreviewCarousel />
            </motion.div>

            <motion.p
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DUR.base, ease: EASE, delay: 1.0 }}
              className="mt-6 sm:mt-8 text-[0.95rem] sm:text-lg text-stone-600 leading-relaxed max-w-xl"
            >
              We design, build, and host conversion-engineered websites for local
              businesses — so every visitor that lands becomes a real shot at{" "}
              <span className="text-stone-900 font-medium">winning a customer</span>,
              not just a bounce metric.
            </motion.p>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DUR.base, ease: EASE, delay: 1.15 }}
              className="mt-7 sm:mt-9 max-w-xl"
            >
              <AuditForm />
            </motion.div>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DUR.base, ease: EASE, delay: 1.3 }}
              className="mt-5 sm:mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm"
            >
              <span className="text-stone-400">Prefer to talk?</span>
              <Magnetic strength={0.2}>
                <Link
                  href="/book"
                  className="inline-flex items-center gap-1.5 font-medium text-stone-900 hover:text-stone-700 transition-colors group"
                >
                  Book a free 15-min audit call
                  <span aria-hidden className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
                </Link>
              </Magnetic>
            </motion.div>
          </div>

          <motion.div
            initial={reduce ? false : { opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: DUR.slow, ease: EASE, delay: 0.6 }}
            style={!reduce ? { y: previewY } : undefined}
            className="hidden lg:block absolute right-[-20%] w-[68%] z-10"
          >
            {!reduce && (
              <div
                aria-hidden
                className="absolute inset-0 -z-10 blur-3xl opacity-50 pointer-events-none"
                style={{ background: `radial-gradient(50% 60% at 50% 50%, ${ACCENT}55 0%, transparent 70%)` }}
              />
            )}
            <ShuffleStage />
          </motion.div>
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: DUR.base, ease: EASE, delay: 1.5 }}
          className="relative z-30 mt-12 sm:mt-16 lg:mt-20 flex flex-wrap items-center justify-center gap-x-5 sm:gap-x-7 gap-y-2 text-[0.65rem] sm:text-xs uppercase tracking-[0.18em] text-stone-400"
        >
          <span>20-point audit · 24 hr turnaround</span>
          <span aria-hidden className="hidden sm:inline-block h-1 w-1 rounded-full bg-stone-300" />
          <span>21-day launch window</span>
          <span aria-hidden className="hidden sm:inline-block h-1 w-1 rounded-full bg-stone-300" />
          <span>Month-to-month</span>
        </motion.div>
      </div>
    </section>
  );
}

function RotatingHeadline() {
  const reduce = useReducedMotion();
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = setTimeout(() => setIdx((i) => (i + 1) % HEADLINES.length), HEADLINE_INTERVAL_MS);
    return () => clearTimeout(id);
  }, [idx, reduce]);

  const headline = HEADLINES[idx];
  let wordIndex = 0;

  return (
    <div className="relative">
      <AnimatePresence mode="wait" initial={false}>
        <motion.h1
          key={idx}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, transition: { duration: 0.3 } }}
          transition={{ duration: 0.4 }}
          className="font-display font-semibold leading-[1.02] tracking-tight"
          style={{ fontSize: "clamp(2.25rem, 5.2vw, 4.5rem)" }}
        >
          {headline.map((line, lineIdx) => (
            <span key={lineIdx} className={`block ${line.className}`}>
              {line.words.map((word) => {
                const delay = wordIndex * STAGGER;
                wordIndex += 1;
                return (
                  <motion.span
                    key={`${idx}-${lineIdx}-${word}-${wordIndex}`}
                    initial={reduce ? false : { opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: DUR.base, ease: EASE, delay: 0.15 + delay }}
                    className="inline-block mr-[0.22em] last:mr-0"
                  >
                    {word}
                  </motion.span>
                );
              })}
            </span>
          ))}
        </motion.h1>
      </AnimatePresence>

      <div className="mt-4 sm:mt-5 flex items-center gap-1.5" aria-hidden>
        {HEADLINES.map((_, i) => (
          <span
            key={i}
            className={`h-[2px] rounded-full transition-all duration-500 ${
              i === idx ? "w-10 bg-stone-900" : "w-5 bg-stone-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function AuditForm() {
  const [url, setUrl] = useState("");
  const [focused, setFocused] = useState(false);

  return (
    <form action="/audit" method="GET" className="block">
      <div
        className={`flex flex-col sm:flex-row items-stretch rounded-2xl border bg-white shadow-sm transition-all ${
          focused ? "border-stone-900 shadow-md" : "border-stone-200"
        }`}
      >
        <label className="flex-1 flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-3 sm:py-3.5 min-w-0">
          <svg aria-hidden viewBox="0 0 20 20" fill="none" className="h-4 w-4 sm:h-[18px] sm:w-[18px] text-stone-400 flex-shrink-0">
            <path
              d="M3 10a7 7 0 1014 0 7 7 0 00-14 0zm0 0h14M10 3a13 13 0 010 14M10 3a13 13 0 000 14"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
          <span className="sr-only">Your website URL</span>
          <input
            type="text"
            name="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="yourbusiness.com"
            autoComplete="url"
            inputMode="url"
            className="flex-1 min-w-0 bg-transparent text-sm sm:text-base text-stone-900 placeholder:text-stone-400 focus:outline-none"
          />
        </label>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-b-2xl sm:rounded-l-none sm:rounded-r-2xl bg-stone-900 px-6 sm:px-7 py-3 sm:py-3.5 text-sm font-semibold text-stone-50 hover:bg-stone-800 transition-colors whitespace-nowrap"
        >
          Scan my website
          <svg aria-hidden viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path
              fillRule="evenodd"
              d="M7.05 4.05a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L11.293 10 7.05 5.464a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
      <p className="mt-2.5 sm:mt-3 text-[0.7rem] sm:text-xs text-stone-500 leading-relaxed flex items-center gap-1.5 flex-wrap">
        <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: ACCENT }} />
        <span className="font-medium text-stone-700">Free 20-point audit.</span>
        <span>Delivered to your inbox in under 24 hours.</span>
      </p>
    </form>
  );
}

function PreviewCarousel() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [cycleKey, setCycleKey] = useState(0);

  const goTo = useCallback((next: number) => {
    setIndex(next);
    setCycleKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (paused || reduce) return;
    const id = setTimeout(() => {
      setIndex((i) => (i + 1) % SAMPLES.length);
      setCycleKey((k) => k + 1);
    }, ROTATE_INTERVAL_MS);
    return () => clearTimeout(id);
  }, [index, paused, reduce]);

  const sample = SAMPLES[index];
  const Preview = sample.Preview;

  return (
    <div className="select-none" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <Link
        href={sample.href}
        className="block group rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:ring-stone-900"
        aria-label={`View the ${sample.label} sample site`}
      >
        <div className="relative overflow-hidden border border-stone-200 bg-white rounded-2xl shadow-[0_30px_60px_-30px_rgba(15,23,42,0.25),0_10px_25px_-12px_rgba(15,23,42,0.12)]">
          <BrowserChrome url={sample.url} small />
          <div className="relative bg-white">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={index}
                initial={reduce ? false : { opacity: 0, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.01 }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                <Preview />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </Link>

      <ChipRow samples={SAMPLES} activeIdx={index} onSelect={goTo} cycleKey={cycleKey} paused={paused} reduce={reduce} variant="inline" />
    </div>
  );
}

function ShuffleStage() {
  const reduce = useReducedMotion();
  const [activeIdx, setActiveIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [cycleKey, setCycleKey] = useState(0);

  const goTo = useCallback((next: number) => {
    setActiveIdx(next);
    setCycleKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (paused || reduce) return;
    const id = setTimeout(() => {
      setActiveIdx((i) => (i + 1) % SAMPLES.length);
      setCycleKey((k) => k + 1);
    }, ROTATE_INTERVAL_MS);
    return () => clearTimeout(id);
  }, [activeIdx, paused, reduce]);

  return (
    <div
      className="relative w-full h-[540px] select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {SAMPLES.map((s, i) => (
        <StageCard key={s.href} sample={s} isActive={i === activeIdx} home={HOMES[i]} reduce={reduce} />
      ))}

      <ChipRow samples={SAMPLES} activeIdx={activeIdx} onSelect={goTo} cycleKey={cycleKey} paused={paused} reduce={reduce} variant="pill" />
    </div>
  );
}

function StageCard({
  sample,
  isActive,
  home,
  reduce,
}: {
  sample: PreviewSample;
  isActive: boolean;
  home: StageHome;
  reduce: boolean | null;
}) {
  const Preview = sample.Preview;

  const animateTo = isActive
    ? { top: "50%", left: "50%", x: "-50%", y: "-50%", scale: 1, rotate: -1.5, opacity: 1 }
    : { top: home.top, left: home.left, x: 0, y: 0, scale: 0.55, rotate: home.rotate, opacity: 0.6 };

  return (
    <motion.div
      className="absolute"
      style={{ width: 460, zIndex: isActive ? 30 : 10, transformOrigin: "center center" }}
      animate={reduce ? undefined : animateTo}
      initial={false}
      transition={{ duration: 0.85, ease: EASE }}
    >
      <Link
        href={sample.href}
        tabIndex={isActive ? 0 : -1}
        aria-hidden={!isActive}
        className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:ring-stone-900"
        aria-label={`View the ${sample.label} sample site`}
      >
        <div
          className={`relative overflow-hidden border border-stone-200 bg-white rounded-2xl transition-shadow ${
            isActive
              ? "shadow-[0_60px_120px_-40px_rgba(15,23,42,0.40),0_25px_50px_-25px_rgba(15,23,42,0.20)]"
              : "shadow-[0_20px_40px_-20px_rgba(15,23,42,0.25),0_8px_16px_-12px_rgba(15,23,42,0.10)]"
          }`}
          style={{ filter: isActive ? "none" : "saturate(0.85)" }}
        >
          <BrowserChrome url={sample.url} small={false} />
          <div className="bg-white">
            <Preview />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function BrowserChrome({ url, small }: { url: string; small: boolean }) {
  const dot = small ? "h-2 w-2" : "h-2.5 w-2.5";
  return (
    <div className={`flex items-center gap-2 border-b border-stone-100 bg-stone-50 ${small ? "px-3 py-2.5" : "px-4 py-2.5"}`}>
      <span className={`rounded-full bg-stone-300 ${dot}`} aria-hidden />
      <span className={`rounded-full bg-stone-300 ${dot}`} aria-hidden />
      <span className={`rounded-full bg-stone-300 ${dot}`} aria-hidden />
      <div className={`mx-auto flex items-center gap-1.5 rounded-md border border-stone-200 bg-white text-stone-400 ${small ? "px-2.5 py-1 text-[10px]" : "px-3 py-1 text-[11px]"}`}>
        <svg viewBox="0 0 20 20" fill="currentColor" className={`text-stone-300 ${small ? "h-2.5 w-2.5" : "h-2.5 w-2.5"}`} aria-hidden>
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
        <span className="truncate">{url}</span>
      </div>
      <div className="w-4" aria-hidden />
    </div>
  );
}

function ChipRow({
  samples,
  activeIdx,
  onSelect,
  cycleKey,
  paused,
  reduce,
  variant,
}: {
  samples: PreviewSample[];
  activeIdx: number;
  onSelect: (i: number) => void;
  cycleKey: number;
  paused: boolean;
  reduce: boolean | null;
  variant: "inline" | "pill";
}) {
  if (variant === "pill") {
    return (
      <div
        role="tablist"
        aria-label="Sample site industries"
        className="absolute bottom-0 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1 rounded-full border border-stone-200/70 bg-stone-50/70 backdrop-blur-md p-1.5 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.18)]"
      >
        {samples.map((s, i) => {
          const active = i === activeIdx;
          return (
            <button
              key={s.href}
              type="button"
              role="tab"
              aria-selected={active}
              aria-label={`${s.label} preview`}
              onClick={() => onSelect(i)}
              className={`relative flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 ${
                active ? "bg-stone-900 text-stone-50 shadow-sm" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: active ? "#fff" : s.accent }} />
              {s.label}
              {active && !paused && !reduce && (
                <motion.span
                  key={cycleKey}
                  aria-hidden
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: ROTATE_INTERVAL_MS / 1000, ease: "linear" }}
                  className="absolute inset-x-3 bottom-1 h-[1.5px] rounded-full origin-left"
                  style={{ background: ACCENT }}
                />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // inline variant — mobile carousel
  return (
    <div
      role="tablist"
      aria-label="Sample site industries"
      className="mt-4 sm:mt-5 flex items-center gap-1.5 sm:gap-2 overflow-x-auto -mx-1 px-1 pb-1"
    >
      {samples.map((s, i) => {
        const active = i === activeIdx;
        return (
          <button
            key={s.href}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={`${s.label} preview`}
            onClick={() => onSelect(i)}
            className={`relative flex items-center gap-1.5 rounded-full border px-2.5 sm:px-3 py-1.5 text-[0.65rem] sm:text-xs font-medium transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 ${
              active
                ? "border-stone-900 bg-white text-stone-900 shadow-sm"
                : "border-stone-200 bg-white/60 text-stone-500 hover:text-stone-900 hover:border-stone-300"
            }`}
          >
            <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: active ? s.accent : "#d6d3d1" }} />
            {s.label}
            {active && !paused && !reduce && (
              <motion.span
                key={cycleKey}
                aria-hidden
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: ROTATE_INTERVAL_MS / 1000, ease: "linear" }}
                className="absolute inset-x-3 bottom-0.5 h-[1.5px] rounded-full origin-left"
                style={{ background: s.accent }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
