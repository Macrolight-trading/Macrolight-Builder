"use client";

import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";

const COLLAGE = [
  {
    src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=80&fit=crop",
    alt: "Thriving restaurant dining room with warm lighting",
    label: "Restaurant · Cleveland, OH",
    stat: "4.9★ client rating",
  },
  {
    src: "https://images.unsplash.com/photo-1632759145351-1d592919f522?w=600&q=80&fit=crop",
    alt: "Roofer installing shingles on a residential roof",
    label: "Roofing · Columbus, OH",
    stat: "+340% more leads",
  },
  {
    src: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&q=80&fit=crop&crop=center",
    alt: "HVAC technician working on an air conditioning system",
    label: "HVAC · Cincinnati, OH",
    stat: "21 days to launch",
  },
];

const INTERVAL = 4000;

export default function HeroPhotoCarousel() {
  const [current, setCurrent] = useState(0);
  const [dragDelta, setDragDelta] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const swipedRef = useRef(false);

  const goTo = useCallback((i: number) => setCurrent(i), []);
  const next = useCallback(() => goTo((current + 1) % COLLAGE.length), [current, goTo]);
  const prev = useCallback(() => goTo((current - 1 + COLLAGE.length) % COLLAGE.length), [current, goTo]);

  useEffect(() => {
    if (paused) return;
    const id = setTimeout(next, INTERVAL);
    return () => clearTimeout(id);
  }, [paused, current, next]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setDragDelta(0);
    setIsDragging(true);
    swipedRef.current = false;
    setPaused(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    setDragDelta(e.touches[0].clientX - touchStartX.current);
  }, []);

  const handleTouchEnd = useCallback(() => {
    setDragDelta((delta) => {
      if (delta < -50) { swipedRef.current = true; setTimeout(next, 0); }
      else if (delta > 50) { swipedRef.current = true; setTimeout(prev, 0); }
      return 0;
    });
    touchStartX.current = null;
    setIsDragging(false);
    setPaused(false);
  }, [next, prev]);

  return (
    <div className="w-full">
      {/* ── Carousel track ── */}
      <div
        className="relative overflow-hidden rounded-2xl shadow-xl shadow-gray-200/80"
        style={{ height: 240 }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Sliding strip */}
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            transform: `translateX(calc(-${current * 100}% + ${dragDelta}px))`,
            transition: isDragging ? "none" : "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            willChange: "transform",
            touchAction: "pan-y",
          }}
        >
          {COLLAGE.map((photo, i) => (
            <div key={i} style={{ flex: "0 0 100%", position: "relative", overflow: "hidden" }}>
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 0px"
                className="object-cover object-center"
                priority={i === 0}
              />
              {/* Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

              {/* Bottom label row */}
              <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
                <div>
                  <p className="text-[0.6rem] text-white/60 uppercase tracking-wider font-medium">
                    {photo.label}
                  </p>
                  <p className="text-sm font-bold text-white mt-0.5">{photo.stat}</p>
                </div>
                {/* Green arrow badge */}
                <div className="h-7 w-7 rounded-full bg-emerald-500/90 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 text-white" aria-hidden>
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>

              {/* Slide counter — top right */}
              <div className="absolute top-3 right-3 rounded-full bg-black/40 backdrop-blur-sm px-2.5 py-1 text-[0.6rem] font-semibold text-white/80 tabular-nums">
                {i + 1}&thinsp;/&thinsp;{COLLAGE.length}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Dot indicators ── */}
      <div className="flex justify-center gap-1.5 mt-3" role="tablist" aria-label="Photo slides">
        {COLLAGE.map((_, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === current}
            aria-label={`Slide ${i + 1}`}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-300 ${
              i === current ? "w-5 h-1.5 bg-violet-600" : "w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
