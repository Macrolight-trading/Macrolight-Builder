"use client";

import Link from "next/link";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "motion/react";
import { useRef, useState, type ComponentType, type MouseEvent } from "react";
import Reveal from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { DUR, EASE } from "@/components/motion/tokens";
import {
  LawnCarePreview,
  LawFirmPreview,
  RestaurantPreview,
  HvacPreview,
  DentistPreview,
} from "./previews";

/**
 * Live samples gallery. Each card wraps a real industry preview
 * component inside a browser-chrome frame. On hover, the card tilts
 * in 3D based on cursor position (perspective + rotateX/rotateY via
 * spring-smoothed motion values), with a soft specular highlight that
 * tracks the cursor.
 *
 * Layout:
 *   - md+: 2 columns, wide enough that each preview reads clearly
 *   - mobile: 1 column, full-width
 *
 * 3D tilt is disabled under prefers-reduced-motion.
 */

interface Sample {
  href: string;
  label: string;
  business: string;
  url: string;
  accent: string;
  Preview: ComponentType;
}

const SAMPLES: Sample[] = [
  {
    href: "/lawn-care",
    label: "Lawn care",
    business: "Greenfield Lawn Co.",
    url: "greenfield-lawn.com",
    accent: "#6BA33E",
    Preview: LawnCarePreview,
  },
  {
    href: "/law-firms",
    label: "Law firm",
    business: "Crestwood Legal Group",
    url: "crestwoodlegal.com",
    accent: "#C9A84C",
    Preview: LawFirmPreview,
  },
  {
    href: "/restaurants",
    label: "Restaurant",
    business: "The Pearl Kitchen & Bar",
    url: "thepearlkitchen.com",
    accent: "#C9A96E",
    Preview: RestaurantPreview,
  },
  {
    href: "/hvac",
    label: "HVAC",
    business: "ArcticBreeze HVAC",
    url: "arcticbreezehhvac.com",
    accent: "#1a6fc4",
    Preview: HvacPreview,
  },
  {
    href: "/dentists",
    label: "Dentists",
    business: "BrightSmile Dental",
    url: "brightsmile-dental.com",
    accent: "#00897b",
    Preview: DentistPreview,
  },
];

export default function LiveSamples() {
  return (
    <section id="samples" className="bg-stone-50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <p className="text-[0.65rem] sm:text-xs font-medium uppercase tracking-[0.22em] text-stone-500 mb-4 sm:mb-5">
            Sample builds · hover to tilt · click to explore
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2
            className="font-display font-semibold text-stone-900 leading-[1.05] tracking-tight max-w-3xl"
            style={{ fontSize: "clamp(1.85rem, 4.5vw, 3.4rem)" }}
          >
            Built for the way <em>your industry</em> actually wins customers.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-4 sm:mt-5 text-[0.95rem] sm:text-base text-stone-500 leading-relaxed max-w-xl">
            Restaurants need a reservation hook above the fold. HVAC needs a
            phone number and a 24/7 badge. Each sample below is built around
            the conversion patterns that actually move the needle in that
            vertical — not a template with the colours swapped.
          </p>
        </Reveal>

        <Stagger
          className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8"
          delayChildren={0.15}
        >
          {SAMPLES.map((sample) => (
            <StaggerItem key={sample.href}>
              <SampleCard sample={sample} />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function SampleCard({ sample }: { sample: Sample }) {
  const reduce = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateXRaw = useTransform(mouseY, [-0.5, 0.5], [6, -6]);
  const rotateYRaw = useTransform(mouseX, [-0.5, 0.5], [-6, 6]);

  const rotateX = useSpring(rotateXRaw, {
    stiffness: 220,
    damping: 22,
    mass: 0.4,
  });
  const rotateY = useSpring(rotateYRaw, {
    stiffness: 220,
    damping: 22,
    mass: 0.4,
  });

  const highlight = useTransform(
    [mouseX, mouseY],
    ([x, y]: number[]) =>
      `radial-gradient(400px circle at ${x * 100 + 50}% ${y * 100 + 50}%, rgba(255,255,255,0.6), transparent 55%)`,
  );

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    if (reduce) return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleLeave = () => {
    setHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  const Preview = sample.Preview;

  return (
    <Link
      href={sample.href}
      className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:ring-stone-900 rounded-2xl"
    >
      <motion.div
        ref={cardRef}
        style={
          reduce
            ? undefined
            : {
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
                perspective: 1200,
              }
        }
        onMouseEnter={() => setHovered(true)}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        animate={{
          y: !reduce && hovered ? -4 : 0,
          boxShadow: hovered
            ? "0 30px 60px -25px rgba(15, 23, 42, 0.28), 0 10px 25px -12px rgba(15, 23, 42, 0.15)"
            : "0 4px 12px -4px rgba(15, 23, 42, 0.08)",
        }}
        transition={{ duration: DUR.fast, ease: EASE }}
        className="relative overflow-hidden rounded-2xl border border-stone-200 bg-white"
      >
        {!reduce && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10 rounded-2xl mix-blend-soft-light transition-opacity duration-300"
            style={{
              background: highlight,
              opacity: hovered ? 1 : 0,
            }}
          />
        )}

        <div
          className="relative flex items-center gap-1.5 border-b border-stone-100 bg-stone-50 px-3 py-2.5"
          style={{ transform: "translateZ(20px)" }}
        >
          <span className="h-2 w-2 rounded-full bg-stone-300" aria-hidden />
          <span className="h-2 w-2 rounded-full bg-stone-300" aria-hidden />
          <span className="h-2 w-2 rounded-full bg-stone-300" aria-hidden />
          <div className="mx-auto flex items-center gap-1.5 rounded-md border border-stone-200 bg-white px-2.5 py-1 text-[10px] text-stone-400">
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-2.5 w-2.5 text-stone-300"
              aria-hidden
            >
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="truncate">{sample.url}</span>
          </div>
          <div className="w-4" aria-hidden />
        </div>

        <div className="relative overflow-hidden bg-white">
          <Preview />
        </div>

        <div
          className="flex items-center justify-between border-t border-stone-100 bg-white px-4 sm:px-5 py-3"
          style={{ transform: "translateZ(15px)" }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span
              aria-hidden
              className="inline-block h-1.5 w-1.5 rounded-full flex-shrink-0"
              style={{ background: sample.accent }}
            />
            <span className="text-xs font-medium uppercase tracking-[0.15em] text-stone-500 truncate">
              {sample.label}
            </span>
            <span
              aria-hidden
              className="hidden sm:inline-block h-1 w-1 rounded-full bg-stone-300 flex-shrink-0"
            />
            <span className="hidden sm:inline text-xs text-stone-500 truncate">
              {sample.business}
            </span>
          </div>
          <span className="flex items-center gap-1 text-xs font-medium text-stone-500 group-hover:text-stone-900 transition-colors whitespace-nowrap ml-3 flex-shrink-0">
            Explore
            <span
              aria-hidden
              className="inline-block transition-transform group-hover:translate-x-0.5"
            >
              →
            </span>
          </span>
        </div>
      </motion.div>
    </Link>
  );
}
