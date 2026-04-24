"use client";

import { useState, useEffect, useRef } from "react";
import type { IndustryProfile } from "@/lib/industries";

// ── Greenfield Lawn Co. colour palette ──────────────────────────────────────
const C = {
  greenDark:  "#2D5016",
  greenMid:   "#4A7C23",
  greenLight: "#6BA33E",
  greenPale:  "#E8F0E0",
  earthMid:   "#8B6F47",
  cream:      "#FAF8F2",
  white:      "#FFFFFF",
  text:       "#2C2C2C",
  textLight:  "#5A5A5A",
} as const;

// ── Reusable inline-style helpers ────────────────────────────────────────────
const btn = (
  bg: string,
  color: string,
  border?: string
): React.CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "14px 28px",
  fontFamily: "Inter, sans-serif",
  fontSize: "0.95rem",
  fontWeight: 600,
  borderRadius: 50,
  border: border ?? "none",
  cursor: "pointer",
  background: bg,
  color,
  transition: "all 0.3s ease",
  textDecoration: "none",
  whiteSpace: "nowrap" as const,
});

const starSvg = (
  <svg
    viewBox="0 0 24 24"
    fill="#F5C518"
    style={{ width: 18, height: 18, display: "inline-block" }}
  >
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const checkSvg = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke={C.greenMid}
    strokeWidth={2.5}
    style={{ width: 14, height: 14 }}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const phoneSvg = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    style={{ width: 18, height: 18, flexShrink: 0 }}
  >
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
  </svg>
);

// ── Service card data ────────────────────────────────────────────────────────
const SERVICES = [
  {
    img: "https://images.unsplash.com/photo-1584479898061-15742e14f50d?w=600&q=80&fit=crop",
    title: "Landscape Design & Installation",
    desc: "Complete landscape makeovers planned with care and built to last. From concept to completion, we bring your dream yard to life.",
  },
  {
    img: "https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=600&q=80&fit=crop",
    title: "Lawn Maintenance",
    desc: "Regular mowing, edging, and fertilization to keep your lawn lush, green, and the envy of the neighborhood all season long.",
  },
  {
    img: "https://images.unsplash.com/photo-1477511801984-4ad318ed9846?w=600&q=80&fit=crop",
    title: "Spring & Fall Cleanups",
    desc: "Clearing leaves, branches, and debris. We clean flower beds, cut back dead growth, and haul everything away so your yard looks fresh.",
  },
  {
    img: "https://images.unsplash.com/photo-1558635924-b60e7d639da0?w=600&q=80&fit=crop",
    title: "Shrub Trimming & Pruning",
    desc: "Professional shaping and trimming to keep your shrubs healthy, tidy, and under control throughout the growing season.",
  },
  {
    img: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80&fit=crop",
    title: "Weeding & Bed Care",
    desc: "We tackle weeds before they spread, pulling by hand and digging deep to get the roots. Your flower beds will stay pristine.",
  },
  {
    img: "https://images.unsplash.com/photo-1604762524889-3e2fcc145683?w=600&q=80&fit=crop",
    title: "Mulching & Bed Refresh",
    desc: "Fresh mulch installation to protect plant roots, suppress weeds, and give your landscape beds a polished, finished look.",
  },
];

const GALLERY = [
  {
    bg: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&q=80&fit=crop",
    label: "Complete Landscape Redesign",
    span2: true,
  },
  {
    bg: "https://images.unsplash.com/photo-1598902108854-d1446614550e?w=600&q=80&fit=crop",
    label: "Patio & Garden Beds",
  },
  {
    bg: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80&fit=crop",
    label: "Seasonal Planting & Care",
  },
  {
    bg: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80&fit=crop",
    label: "Curb Appeal Makeover",
  },
  {
    bg: "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?w=600&q=80&fit=crop",
    label: "Shrub & Hedge Shaping",
  },
];

const TESTIMONIALS = [
  {
    initials: "SR",
    name: "S. Ramirez",
    location: "Maplewood, OH",
    quote:
      "Greenfield completely transformed our front yard. They listened to exactly what we wanted and delivered beyond our expectations. The crew was professional, clean, and finished on time.",
  },
  {
    initials: "LC",
    name: "L. Chen",
    location: "Oakdale, OH",
    quote:
      "We've used Greenfield for over 5 years for our seasonal cleanups and lawn maintenance. They are always reliable, fairly priced, and our yard has never looked better. Highly recommend!",
  },
  {
    initials: "BW",
    name: "B. Whitfield",
    location: "Cedar Hills, OH",
    quote:
      "The attention to detail is what sets Greenfield apart. They hand-pulled every weed, reshaped our garden beds, and laid fresh mulch. It looked like a brand new house. A+ service.",
  },
];

const AREAS = [
  "Maplewood",
  "Oakdale",
  "Cedar Hills",
  "Willowbrook",
  "Linden Park",
  "Elm Ridge",
  "Stonecreek",
  "Briarfield",
  "Hawthorne",
];

// ── Main component ────────────────────────────────────────────────────────────
export default function LawnShowcase({
  industry: _industry,
}: {
  industry: IndustryProfile;
}) {
  const [scrolled, setScrolled]         = useState(false);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [formDone, setFormDone]         = useState(false);
  const [hoveredCard, setHoveredCard]   = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Track scroll inside the scrollable preview frame
  useEffect(() => {
    const el = containerRef.current?.closest(".industry-site-light") as HTMLElement | null;
    if (!el) return;
    const onScroll = () => setScrolled(el.scrollTop > 50);
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(`lawn-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormDone(true);
  };

  return (
    <div
      ref={containerRef}
      style={{
        fontFamily: "Inter, system-ui, sans-serif",
        background: C.cream,
        color: C.text,
        lineHeight: 1.7,
      }}
    >
      {/* ── Google Fonts ── */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600&display=swap');
        .lawn-serif { font-family: 'Playfair Display', Georgia, serif; }
        .lawn-nav-link { position: relative; font-size: 0.9rem; font-weight: 500; color: ${C.textLight}; text-decoration: none; transition: color 0.3s; cursor: pointer; }
        .lawn-nav-link:hover { color: ${C.greenMid}; }
        .lawn-service-card { background: ${C.cream}; border-radius: 12px; overflow: hidden; transition: all 0.3s ease; border: 1px solid transparent; }
        .lawn-service-card:hover { transform: translateY(-4px); box-shadow: 0 8px 40px rgba(0,0,0,0.12); border-color: ${C.greenPale}; }
        .lawn-gallery-item { border-radius: 12px; overflow: hidden; position: relative; cursor: pointer; }
        .lawn-gallery-bg { width: 100%; height: 100%; background-size: cover; background-position: center; transition: transform 0.6s ease; }
        .lawn-gallery-item:hover .lawn-gallery-bg { transform: scale(1.05); }
        .lawn-gallery-overlay { position: absolute; inset: 0; background: linear-gradient(transparent 40%, rgba(0,0,0,0.6)); display: flex; align-items: flex-end; padding: 20px; opacity: 0; transition: opacity 0.3s; }
        .lawn-gallery-item:hover .lawn-gallery-overlay { opacity: 1; }
        .lawn-testimonial-card { background: #fff; border-radius: 12px; padding: 36px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); transition: transform 0.3s; }
        .lawn-testimonial-card:hover { transform: translateY(-4px); }
        .lawn-area-tag { background: #fff; padding: 10px 24px; border-radius: 50px; font-size: 0.9rem; font-weight: 500; color: ${C.text}; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .lawn-btn-primary { background: ${C.greenMid}; color: #fff; box-shadow: 0 4px 16px rgba(74,124,35,0.3); }
        .lawn-btn-primary:hover { background: ${C.greenDark}; transform: translateY(-2px); box-shadow: 0 6px 24px rgba(74,124,35,0.4); }
        .lawn-btn-outline { background: transparent; color: #fff; border: 2px solid rgba(255,255,255,0.6) !important; }
        .lawn-btn-outline:hover { background: rgba(255,255,255,0.15); border-color: #fff !important; }
        .lawn-cta-phone:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.2); }
        .lawn-input { width: 100%; padding: 14px 16px; border: 1.5px solid #ddd; border-radius: 8px; font-family: 'Inter', sans-serif; font-size: 0.95rem; transition: border-color 0.3s; background: #fff; box-sizing: border-box; }
        .lawn-input:focus { outline: none; border-color: ${C.greenMid}; box-shadow: 0 0 0 3px rgba(74,124,35,0.1); }
        .lawn-fade-in { opacity: 0; transform: translateY(24px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .lawn-fade-in.visible { opacity: 1; transform: translateY(0); }
      `}</style>

      {/* ── HEADER ── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.08)" : "none",
          transition: "box-shadow 0.3s",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 24px",
            maxWidth: 1200,
            margin: "0 auto",
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                background: C.greenMid,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} style={{ width: 24, height: 24 }}>
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" />
                <path d="M12 8c-2 0-4 2-4 4s2 4 4 4 4-2 4-4-2-4-4-4z" />
                <path d="M12 2v6M12 16v6" />
              </svg>
            </div>
            <div>
              <div className="lawn-serif" style={{ fontSize: "1.2rem", color: C.greenDark, fontWeight: 700, lineHeight: 1.2 }}>
                Greenfield Lawn Co.
              </div>
              <div style={{ fontSize: "0.7rem", color: C.textLight, letterSpacing: 1, textTransform: "uppercase" }}>
                Maplewood, OH &bull; Since 1995
              </div>
            </div>
          </div>

          {/* Desktop nav */}
          <nav style={{ display: "flex", alignItems: "center", gap: 32 }}>
            {["services", "about", "gallery", "testimonials", "contact"].map((id) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="lawn-nav-link"
                style={{ background: "none", border: "none", padding: 0 }}
              >
                {id.charAt(0).toUpperCase() + id.slice(1)}
              </button>
            ))}
          </nav>

          {/* CTA */}
          <button
            onClick={() => scrollTo("contact")}
            className="lawn-btn-primary"
            style={{
              ...btn(C.greenMid, "#fff"),
              padding: "10px 24px",
              fontSize: "0.9rem",
            }}
          >
            Free Estimate
          </button>
        </div>
      </header>

      {/* ── MOBILE NAV OVERLAY ── */}
      {mobileOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(255,255,255,0.98)",
            backdropFilter: "blur(20px)",
            zIndex: 999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 32,
          }}
        >
          <button
            onClick={() => setMobileOpen(false)}
            style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", fontSize: "2rem", color: C.text, cursor: "pointer" }}
          >
            &times;
          </button>
          {["services", "about", "gallery", "testimonials", "contact"].map((id) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              style={{ background: "none", border: "none", fontSize: "1.3rem", fontWeight: 600, color: C.greenDark, cursor: "pointer" }}
            >
              {id.charAt(0).toUpperCase() + id.slice(1)}
            </button>
          ))}
          <a
            href="tel:6145550192"
            className="lawn-btn-primary"
            style={btn(C.greenMid, "#fff")}
          >
            {phoneSvg} (614) 555-0192
          </a>
        </div>
      )}

      {/* ── HERO ── */}
      <section
        id="lawn-home"
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          backgroundImage: "url('https://images.unsplash.com/photo-1558904541-efa843a96f01?w=1920&q=80&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          overflow: "hidden",
        }}
      >
        {/* Overlay */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, rgba(26,58,10,0.88) 0%, rgba(45,80,22,0.82) 40%, rgba(61,100,32,0.78) 100%)",
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: 1200,
            margin: "0 auto",
            padding: "120px 24px 80px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 60,
            alignItems: "center",
            width: "100%",
          }}
        >
          {/* Hero text */}
          <div style={{ color: C.white }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 50,
                padding: "8px 20px",
                fontSize: "0.85rem",
                marginBottom: 28,
              }}
            >
              <span style={{ color: "#F5C518" }}>&#9733;&#9733;&#9733;&#9733;&#9733;</span>
              <span>4.8 Rating &bull; 124 Reviews</span>
            </div>
            <h1
              className="lawn-serif"
              style={{ fontSize: "clamp(2.5rem, 5vw, 3.8rem)", marginBottom: 20, lineHeight: 1.1, color: C.white }}
            >
              Your Yard Deserves{" "}
              <span style={{ display: "block", color: C.greenLight }}>the Best Care.</span>
            </h1>
            <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.8)", marginBottom: 36, maxWidth: 480, lineHeight: 1.8 }}>
              Family-owned since 1995, Greenfield Lawn Co. brings over 30 years of expertise to every lawn, garden, and landscape project in Maplewood and surrounding communities.
            </p>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <button
                onClick={() => scrollTo("contact")}
                className="lawn-btn-primary"
                style={btn(C.greenMid, "#fff")}
              >
                Get Your Free Estimate &rarr;
              </button>
              <a
                href="tel:6145550192"
                className="lawn-btn-outline"
                style={btn("transparent", "#fff", "2px solid rgba(255,255,255,0.6)")}
              >
                {phoneSvg} (614) 555-0192
              </a>
            </div>
          </div>

          {/* Hero cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Stats card */}
            <div
              style={{
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 12,
                padding: 28,
              }}
            >
              <div style={{ fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, color: "rgba(255,255,255,0.6)", marginBottom: 16 }}>
                Why Homeowners Choose Us
              </div>
              <div style={{ display: "flex", gap: 32 }}>
                {[
                  { num: "30+", label: "Years of Experience" },
                  { num: "4.8", label: "Star Rating" },
                  { num: "2,500+", label: "Happy Clients" },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="lawn-serif" style={{ fontSize: "2.2rem", fontWeight: 700, color: C.white, lineHeight: 1 }}>{s.num}</div>
                    <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.6)", marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust chips */}
            <div
              style={{
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 12,
                padding: 28,
              }}
            >
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {["Family-Owned", "Licensed & Insured", "Free Estimates"].map((chip) => (
                  <div
                    key={chip}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      background: "rgba(255,255,255,0.08)",
                      borderRadius: 50,
                      padding: "8px 16px",
                      fontSize: "0.8rem",
                      color: "rgba(255,255,255,0.8)",
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill={C.greenLight} style={{ width: 14, height: 14, flexShrink: 0 }}>
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    {chip}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section
        id="lawn-services"
        style={{ background: C.white, padding: "100px 0" }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <span style={{ display: "inline-block", fontSize: "0.75rem", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: C.greenMid, marginBottom: 12 }}>
              What We Do
            </span>
            <h2 className="lawn-serif" style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", color: C.greenDark, marginBottom: 16 }}>
              Comprehensive Landscaping Services
            </h2>
            <p style={{ fontSize: "1.1rem", color: C.textLight, maxWidth: 600, margin: "0 auto" }}>
              From routine maintenance to complete landscape transformations, we handle it all with care and precision.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 24,
            }}
          >
            {SERVICES.map((svc, i) => (
              <div
                key={svc.title}
                className="lawn-service-card"
                onMouseEnter={() => setHoveredCard(i)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <img
                  src={svc.img}
                  alt={svc.title}
                  style={{ width: "100%", height: 180, objectFit: "cover", display: "block" }}
                />
                <div style={{ padding: 28 }}>
                  <h3 className="lawn-serif" style={{ fontSize: "1.25rem", color: C.greenDark, marginBottom: 10 }}>
                    {svc.title}
                  </h3>
                  <p style={{ fontSize: "0.95rem", color: C.textLight, margin: 0 }}>{svc.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section
        id="lawn-about"
        style={{ padding: "100px 0", background: C.cream }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 80,
              alignItems: "center",
            }}
          >
            {/* Image */}
            <div
              style={{
                position: "relative",
                borderRadius: 12,
                overflow: "hidden",
                aspectRatio: "4/3",
                backgroundImage: "url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80&fit=crop')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* Overlay with year */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(transparent 30%, rgba(45,80,22,0.7))",
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  padding: 40,
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div className="lawn-serif" style={{ fontSize: "5rem", fontWeight: 700, color: C.white, lineHeight: 1, textShadow: "0 2px 12px rgba(0,0,0,0.3)" }}>
                    1995
                  </div>
                  <div style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.9)", fontWeight: 500, marginTop: 8, textShadow: "0 1px 4px rgba(0,0,0,0.3)" }}>
                    Family-Owned Since
                  </div>
                </div>
              </div>
              {/* Badge */}
              <div
                style={{
                  position: "absolute",
                  bottom: 24,
                  right: 24,
                  background: C.greenMid,
                  color: C.white,
                  padding: "16px 24px",
                  borderRadius: 8,
                  boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                }}
              >
                <div className="lawn-serif" style={{ fontSize: "1.8rem", fontWeight: 700, lineHeight: 1 }}>30+</div>
                <div style={{ fontSize: "0.8rem", opacity: 0.8, marginTop: 2 }}>Years Strong</div>
              </div>
            </div>

            {/* Text */}
            <div>
              <span style={{ display: "inline-block", fontSize: "0.75rem", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: C.greenMid, marginBottom: 12 }}>
                Our Story
              </span>
              <h2 className="lawn-serif" style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", color: C.greenDark, marginBottom: 20 }}>
                Built on Trust, Rooted in Community
              </h2>
              <p style={{ color: C.textLight, marginBottom: 16, fontSize: "1.05rem" }}>
                Greenfield Lawn Co. has provided dependable, professional service with the personal touch of a family-owned business since 1995. We&rsquo;re not a faceless corporation &mdash; we&rsquo;re your neighbors in Maplewood.
              </p>
              <p style={{ color: C.textLight, marginBottom: 32, fontSize: "1.05rem" }}>
                Our crew plans carefully, works cleanly, and delivers results that stand the test of time. Whether it&rsquo;s a simple bed refresh or a full landscape makeover, we treat every yard like it&rsquo;s our own.
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                {[
                  "Family-owned & operated",
                  "Licensed & insured",
                  "Free, no-pressure estimates",
                  "30+ years of expertise",
                ].map((val) => (
                  <div key={val} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        background: C.greenPale,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    >
                      {checkSvg}
                    </div>
                    <span style={{ fontSize: "0.95rem", fontWeight: 500, color: C.text }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── GALLERY ── */}
      <section
        id="lawn-gallery"
        style={{ background: C.white, padding: "100px 0" }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <span style={{ display: "inline-block", fontSize: "0.75rem", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: C.greenMid, marginBottom: 12 }}>
              Our Work
            </span>
            <h2 className="lawn-serif" style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", color: C.greenDark, marginBottom: 16 }}>
              See the Greenfield Difference
            </h2>
            <p style={{ fontSize: "1.1rem", color: C.textLight, maxWidth: 600, margin: "0 auto" }}>
              Browse some of our recent projects across Maplewood and the surrounding communities.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gridTemplateRows: "repeat(2, 240px)",
              gap: 16,
            }}
          >
            {GALLERY.map((item, i) => (
              <div
                key={i}
                className="lawn-gallery-item"
                style={{ gridRow: item.span2 ? "span 2" : undefined }}
              >
                <div
                  className="lawn-gallery-bg"
                  style={{
                    height: "100%",
                    backgroundImage: `url('${item.bg}')`,
                  }}
                />
                <div className="lawn-gallery-overlay">
                  <span style={{ color: C.white, fontWeight: 500, fontSize: "0.95rem" }}>
                    {item.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section
        id="lawn-testimonials"
        style={{ padding: "100px 0", background: C.cream }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <span style={{ display: "inline-block", fontSize: "0.75rem", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: C.greenMid, marginBottom: 12 }}>
              Customer Reviews
            </span>
            <h2 className="lawn-serif" style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", color: C.greenDark, marginBottom: 16 }}>
              What Our Clients Say
            </h2>
            <p style={{ fontSize: "1.1rem", color: C.textLight, maxWidth: 600, margin: "0 auto" }}>
              Rated 4.8 stars with 124 reviews. Here&rsquo;s why homeowners across Maplewood trust us.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 24,
            }}
          >
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="lawn-testimonial-card">
                <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <span key={i}>{starSvg}</span>
                  ))}
                </div>
                <blockquote style={{ fontSize: "1.05rem", color: C.text, lineHeight: 1.8, marginBottom: 20, fontStyle: "italic", margin: "0 0 20px 0" }}>
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: C.greenPale,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 600,
                      color: C.greenDark,
                      fontSize: "1rem",
                      flexShrink: 0,
                    }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.95rem", color: C.text }}>{t.name}</div>
                    <div style={{ fontSize: "0.8rem", color: C.textLight }}>{t.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1560749003-f4b1e17e2dff?w=1600&q=80&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          padding: "80px 24px",
          textAlign: "center",
          color: C.white,
          position: "relative",
        }}
      >
        <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(45,80,22,0.9), rgba(74,124,35,0.85))" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto" }}>
          <h2 className="lawn-serif" style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", color: C.white, marginBottom: 16 }}>
            Ready to Transform Your Yard?
          </h2>
          <p style={{ fontSize: "1.1rem", opacity: 0.85, maxWidth: 550, margin: "0 auto 36px" }}>
            Get a free, no-pressure estimate from Maplewood&rsquo;s most trusted landscaping team. We&rsquo;ll visit your property and provide a detailed quote.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => scrollTo("contact")}
              style={{
                ...btn(C.white, C.greenDark),
                boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                cursor: "pointer",
              }}
            >
              Request Free Estimate
            </button>
            <a
              href="tel:6145550192"
              className="lawn-cta-phone"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: C.white,
                color: C.greenDark,
                padding: "16px 32px",
                borderRadius: 50,
                fontWeight: 600,
                fontSize: "1.05rem",
                transition: "all 0.3s",
                textDecoration: "none",
              }}
            >
              {phoneSvg} (614) 555-0192
            </a>
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section
        id="lawn-contact"
        style={{ background: C.white, padding: "100px 0" }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 60,
            }}
          >
            {/* Contact info */}
            <div>
              <span style={{ display: "inline-block", fontSize: "0.75rem", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: C.greenMid, marginBottom: 12 }}>
                Get in Touch
              </span>
              <h2 className="lawn-serif" style={{ fontSize: "clamp(2rem, 4vw, 2.5rem)", color: C.greenDark, marginBottom: 16 }}>
                Let&rsquo;s Talk About Your Project
              </h2>
              <p style={{ color: C.textLight, marginBottom: 36, fontSize: "1.05rem" }}>
                Whether you need a one-time cleanup or year-round care, we&rsquo;d love to hear from you. Reach out for a free estimate or just to ask a question.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {[
                  {
                    icon: (
                      <svg viewBox="0 0 24 24" fill="none" stroke={C.greenMid} strokeWidth={1.5} style={{ width: 22, height: 22 }}>
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                      </svg>
                    ),
                    label: "Phone",
                    content: <a href="tel:6145550192" style={{ color: C.greenMid, fontWeight: 500, textDecoration: "none" }}>(614) 555-0192</a>,
                  },
                  {
                    icon: (
                      <svg viewBox="0 0 24 24" fill="none" stroke={C.greenMid} strokeWidth={1.5} style={{ width: 22, height: 22 }}>
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    ),
                    label: "Location",
                    content: (
                      <>742 Birchwood Lane<br />Maplewood, OH 43050</>
                    ),
                  },
                  {
                    icon: (
                      <svg viewBox="0 0 24 24" fill="none" stroke={C.greenMid} strokeWidth={1.5} style={{ width: 22, height: 22 }}>
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    ),
                    label: "Hours",
                    content: (
                      <>Mon &ndash; Sat: 8:00 AM &ndash; 6:00 PM<br />Sun: Closed</>
                    ),
                  },
                ].map((m) => (
                  <div key={m.label} style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        background: C.greenPale,
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {m.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: "0.82rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, color: C.textLight, marginBottom: 4 }}>
                        {m.label}
                      </div>
                      <div style={{ fontSize: "1rem", color: C.text, fontWeight: 500 }}>
                        {m.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact form */}
            <div
              style={{
                background: C.cream,
                borderRadius: 12,
                padding: 40,
              }}
            >
              {formDone ? (
                <div style={{ textAlign: "center", padding: "40px 20px" }}>
                  <div style={{ fontSize: "3rem", marginBottom: 12, color: C.greenMid }}>&#10003;</div>
                  <h3 className="lawn-serif" style={{ fontSize: "1.5rem", color: C.greenDark, marginBottom: 8 }}>Thank You!</h3>
                  <p style={{ color: C.textLight }}>
                    We&rsquo;ll be in touch within 24 hours. In the meantime, feel free to call us at{" "}
                    <a href="tel:6145550192" style={{ color: C.greenMid, fontWeight: 600, textDecoration: "none" }}>
                      (614) 555-0192
                    </a>
                    .
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="lawn-serif" style={{ fontSize: "1.5rem", color: C.greenDark, marginBottom: 8 }}>
                    Request a Free Estimate
                  </h3>
                  <p style={{ fontSize: "0.9rem", color: C.textLight, marginBottom: 28 }}>
                    Fill out the form and we&rsquo;ll get back to you within 24 hours.
                  </p>
                  <form onSubmit={handleSubmit}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                      <div>
                        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 500, color: C.text, marginBottom: 6 }}>
                          Full Name *
                        </label>
                        <input required placeholder="John Smith" className="lawn-input" style={{}} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 500, color: C.text, marginBottom: 6 }}>
                          Phone Number *
                        </label>
                        <input type="tel" required placeholder="(614) 555-0123" className="lawn-input" />
                      </div>
                    </div>
                    <div style={{ marginBottom: 20 }}>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 500, color: C.text, marginBottom: 6 }}>
                        Email Address
                      </label>
                      <input type="email" placeholder="john@example.com" className="lawn-input" />
                    </div>
                    <div style={{ marginBottom: 20 }}>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 500, color: C.text, marginBottom: 6 }}>
                        Service Needed
                      </label>
                      <select className="lawn-input" defaultValue="">
                        <option value="">Select a service...</option>
                        <option>Landscape Design &amp; Installation</option>
                        <option>Lawn Maintenance</option>
                        <option>Spring / Fall Cleanup</option>
                        <option>Shrub Trimming &amp; Pruning</option>
                        <option>Weeding &amp; Bed Care</option>
                        <option>Mulching &amp; Bed Refresh</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div style={{ marginBottom: 20 }}>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 500, color: C.text, marginBottom: 6 }}>
                        Tell Us About Your Project
                      </label>
                      <textarea
                        className="lawn-input"
                        placeholder="Describe what you're looking for — we'll take it from there..."
                        style={{ resize: "vertical", minHeight: 120 }}
                      />
                    </div>
                    <button
                      type="submit"
                      className="lawn-btn-primary"
                      style={{
                        ...btn(C.greenMid, "#fff"),
                        width: "100%",
                        justifyContent: "center",
                        padding: 16,
                        fontSize: "1rem",
                      }}
                    >
                      Send Request &rarr;
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICE AREAS ── */}
      <section style={{ background: C.greenPale, padding: "60px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
          <h3 className="lawn-serif" style={{ fontSize: "1.3rem", color: C.greenDark, marginBottom: 20 }}>
            Proudly Serving Central Ohio
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12 }}>
            {AREAS.map((area) => (
              <span key={area} className="lawn-area-tag">{area}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: C.greenDark, color: "rgba(255,255,255,0.7)", padding: "60px 0 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr",
              gap: 40,
              marginBottom: 48,
            }}
          >
            <div>
              <h3 className="lawn-serif" style={{ color: C.white, fontSize: "1.4rem", marginBottom: 12 }}>Greenfield Lawn Co.</h3>
              <p style={{ fontSize: "0.9rem", lineHeight: 1.7 }}>
                Family-owned and operated since 1995. We bring the expertise, professionalism, and personal care that your property deserves.
              </p>
            </div>
            <div>
              <h4 style={{ color: C.white, fontFamily: "Inter, sans-serif", fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>
                Services
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {["Landscape Design", "Lawn Maintenance", "Seasonal Cleanups", "Shrub Trimming"].map((s) => (
                  <li key={s} style={{ marginBottom: 10 }}>
                    <button
                      onClick={() => scrollTo("services")}
                      style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", fontSize: "0.9rem", cursor: "pointer", padding: 0, transition: "color 0.3s" }}
                    >
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 style={{ color: C.white, fontFamily: "Inter, sans-serif", fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>
                Company
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {[
                  { label: "About Us", id: "about" },
                  { label: "Our Work", id: "gallery" },
                  { label: "Reviews", id: "testimonials" },
                  { label: "Contact", id: "contact" },
                ].map((l) => (
                  <li key={l.id} style={{ marginBottom: 10 }}>
                    <button
                      onClick={() => scrollTo(l.id)}
                      style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", fontSize: "0.9rem", cursor: "pointer", padding: 0, transition: "color 0.3s" }}
                    >
                      {l.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 style={{ color: C.white, fontFamily: "Inter, sans-serif", fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>
                Contact
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                <li style={{ marginBottom: 10 }}>
                  <a href="tel:6145550192" style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem", textDecoration: "none" }}>(614) 555-0192</a>
                </li>
                <li style={{ marginBottom: 10, fontSize: "0.9rem" }}>742 Birchwood Lane</li>
                <li style={{ marginBottom: 10, fontSize: "0.9rem" }}>Maplewood, OH 43050</li>
                <li style={{ fontSize: "0.9rem" }}>Mon&ndash;Sat: 8AM&ndash;6PM</li>
              </ul>
            </div>
          </div>
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.1)",
              paddingTop: 24,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.85rem",
            }}
          >
            <span>&copy; 2026 Greenfield Lawn Co. All rights reserved.</span>
            <span>Serving Maplewood &amp; Central Ohio since 1995</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
