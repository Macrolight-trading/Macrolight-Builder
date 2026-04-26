"use client";

import { useState, useEffect } from "react";
import type { IndustryProfile } from "@/lib/industries";

// ── ArcticBreeze HVAC colour palette ────────────────────────────────────────
const C = {
  navyDk:  "#0a3060",
  navy:    "#0f4f90",
  blue:    "#1a6fc4",
  blueLt:  "#e8f2fc",
  orange:  "#e85d04",
  orangeLt:"#fff3ee",
  gray:    "#4a5568",
  light:   "#f7f9fc",
  white:   "#ffffff",
  text:    "#1a2e3b",
  textLt:  "#5a6a7a",
} as const;

const btn = (bg: string, color: string, border?: string): React.CSSProperties => ({
  display: "inline-flex", alignItems: "center", gap: 8,
  padding: "14px 28px", fontFamily: "Inter, sans-serif",
  fontSize: "0.95rem", fontWeight: 600, borderRadius: 50,
  border: border ?? "none", cursor: "pointer", background: bg,
  color, transition: "all 0.2s ease", textDecoration: "none",
  whiteSpace: "nowrap" as const,
});

const SERVICES = [
  {
    img: "https://images.unsplash.com/photo-1631563019676-dade0f38b5a8?w=600&q=80&fit=crop",
    title: "AC Installation & Repair",
    desc: "New system installs, refrigerant recharges, compressor replacements, and same-day AC repairs to keep you cool when it matters most.",
  },
  {
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80&fit=crop",
    title: "Heating & Furnace",
    desc: "Gas, electric, and heat-pump furnace service. We diagnose and repair heating problems fast before cold nights hit.",
  },
  {
    img: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80&fit=crop",
    title: "Air Quality & Filtration",
    desc: "Whole-home air purifiers, UV light systems, humidity control, and HEPA upgrades for cleaner, healthier indoor air.",
  },
  {
    img: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=80&fit=crop",
    title: "Preventive Maintenance",
    desc: "Bi-annual tune-up plans that extend equipment life, cut energy bills, and prevent costly emergency breakdowns.",
  },
  {
    img: "https://images.unsplash.com/photo-1558002038-1055907df827?w=600&q=80&fit=crop",
    title: "Smart Thermostat Setup",
    desc: "Nest, Ecobee, and Honeywell smart thermostat installation and programming for effortless, schedule-aware climate control.",
  },
  {
    img: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&q=80&fit=crop",
    title: "Commercial HVAC",
    desc: "Rooftop units, ductless mini-splits, and full commercial HVAC design-build for offices, restaurants, and retail spaces.",
  },
];

const GALLERY = [
  { bg: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=900&q=80&fit=crop", label: "Full System Replacement", span2: true },
  { bg: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&q=80&fit=crop", label: "AC Unit Installation" },
  { bg: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80&fit=crop", label: "Smart Home Integration" },
  { bg: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80&fit=crop", label: "New Construction" },
  { bg: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&q=80&fit=crop", label: "Commercial Rooftop Unit" },
];

const TESTIMONIALS = [
  {
    initials: "JM", name: "Jennifer M.", location: "Metro City",
    quote: "AC died on the hottest day of July. ArcticBreeze had a tech at my door within 90 minutes and it was fixed before dinner. Absolutely incredible response time — and the price was fair.",
  },
  {
    initials: "DR", name: "David R.", location: "Westside",
    quote: "Replaced our 20-year-old furnace last fall. The crew was professional, cleaned up completely, and the new system cut our heating bill by 30%. Cannot recommend them highly enough.",
  },
  {
    initials: "SK", name: "Sandra K.", location: "Downtown",
    quote: "We use ArcticBreeze for all three of our restaurant locations. Fast, reliable, and their maintenance plan means we've had zero emergency closures. Worth every single penny.",
  },
];

const AREAS = ["Metro City", "Westside", "Lakeview", "Northpark", "Eastgate", "Millbrook", "Riverdale", "Cedar Crest", "Pinehurst"];

export default function HVACShowcase({ industry: _industry }: { industry: IndustryProfile }) {
  const [scrolled, setScrolled] = useState(false);
  const [formDone, setFormDone] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(`hvac-${id}`)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormDone(true);
  };

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", background: C.light, color: C.text, lineHeight: 1.7 }}>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .hvac-nav-link { font-size: 0.9rem; font-weight: 500; color: ${C.textLt}; text-decoration: none; transition: color 0.2s; cursor: pointer; background: none; border: none; padding: 0; }
        .hvac-nav-link:hover { color: ${C.blue}; }
        .hvac-card { background: ${C.white}; border-radius: 12px; overflow: hidden; border: 1px solid #e2eaf4; transition: all 0.25s ease; }
        .hvac-card:hover { transform: translateY(-5px); box-shadow: 0 12px 32px rgba(26,111,196,0.14); border-color: #c5d9f0; }
        .hvac-gallery-item { border-radius: 12px; overflow: hidden; position: relative; cursor: pointer; }
        .hvac-gallery-bg { width: 100%; height: 100%; background-size: cover; background-position: center; transition: transform 0.5s ease; }
        .hvac-gallery-item:hover .hvac-gallery-bg { transform: scale(1.06); }
        .hvac-gallery-overlay { position: absolute; inset: 0; background: linear-gradient(transparent 45%, rgba(0,0,0,0.65)); display: flex; align-items: flex-end; padding: 20px; opacity: 0; transition: opacity 0.3s; }
        .hvac-gallery-item:hover .hvac-gallery-overlay { opacity: 1; }
        .hvac-testi-card { background: ${C.white}; border-radius: 12px; padding: 36px; box-shadow: 0 2px 16px rgba(0,0,0,0.06); border-left: 4px solid ${C.blue}; transition: transform 0.25s; }
        .hvac-testi-card:hover { transform: translateY(-4px); }
        .hvac-input { width: 100%; padding: 13px 16px; border: 1.5px solid #d0d9e8; border-radius: 8px; font-family: 'Inter', sans-serif; font-size: 0.95rem; transition: border-color 0.2s; background: #fff; box-sizing: border-box; color: ${C.text}; }
        .hvac-input:focus { outline: none; border-color: ${C.blue}; box-shadow: 0 0 0 3px rgba(26,111,196,0.1); }
        .hvac-btn-primary { background: ${C.orange}; color: #fff; }
        .hvac-btn-primary:hover { background: #c94d00; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(232,93,4,0.35); }
        .hvac-btn-outline { background: transparent; border: 2px solid rgba(255,255,255,0.65); color: #fff; }
        .hvac-btn-outline:hover { background: rgba(255,255,255,0.12); }
        .hvac-area-tag { background: #fff; padding: 9px 22px; border-radius: 50px; font-size: 0.88rem; font-weight: 500; color: ${C.text}; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .hvac-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2); border-radius: 50px; padding: 7px 18px; font-size: 0.82rem; color: rgba(255,255,255,0.9); }
        .hvac-stat { border-right: 1px solid rgba(255,255,255,0.15); padding-right: 32px; margin-right: 32px; }
        .hvac-stat:last-child { border-right: none; padding-right: 0; margin-right: 0; }
      `}</style>

      {/* ── STICKY NAV ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 1000,
        background: "rgba(255,255,255,0.96)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.08)" : "none",
        transition: "box-shadow 0.3s",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 5%", maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 8, background: `linear-gradient(135deg, ${C.navy}, ${C.blue})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} style={{ width: 20, height: 20 }}>
                <path d="M12 2a10 10 0 110 20A10 10 0 0112 2z" />
                <path d="M8 12h8M12 8v8" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: "1.05rem", fontWeight: 800, color: C.navyDk, letterSpacing: -0.3 }}>ArcticBreeze <span style={{ color: C.blue }}>HVAC</span></div>
              <div style={{ fontSize: "0.6rem", color: C.textLt, letterSpacing: 1.5, textTransform: "uppercase" }}>Heating · Cooling · Air Quality</div>
            </div>
          </div>
          <nav style={{ display: "flex", alignItems: "center", gap: 28 }}>
            {[["services","Services"],["about","About"],["gallery","Our Work"],["testimonials","Reviews"],["contact","Contact"]].map(([id,label]) => (
              <button key={id} onClick={() => scrollTo(id)} className="hvac-nav-link">{label}</button>
            ))}
          </nav>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <a href="tel:+15551234567" style={{ fontSize: "0.9rem", fontWeight: 600, color: C.navy, textDecoration: "none" }}>📞 (555) 123-4567</a>
            <button onClick={() => scrollTo("contact")} className="hvac-btn-primary" style={btn(C.orange, "#fff")}>Free Quote</button>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section id="hvac-home" style={{
        position: "relative", minHeight: "100vh", display: "flex", alignItems: "center",
        backgroundImage: "url('https://images.unsplash.com/photo-1449247666642-264389f5f5b1?w=1920&q=80&fit=crop')",
        backgroundSize: "cover", backgroundPosition: "center", overflow: "hidden",
      }}>
        <div aria-hidden style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, rgba(10,48,96,0.92) 0%, rgba(15,79,144,0.88) 50%, rgba(26,111,196,0.84) 100%)` }} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 1200, margin: "0 auto", padding: "120px 5% 80px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center", width: "100%" }}>
          {/* Left: headline */}
          <div style={{ color: C.white }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 28 }}>
              <span className="hvac-badge">⭐ 4.9-Star Rated</span>
              <span className="hvac-badge">⚡ 24/7 Emergency Service</span>
            </div>
            <h1 style={{ fontSize: "clamp(2.4rem, 4.5vw, 3.6rem)", fontWeight: 800, lineHeight: 1.1, marginBottom: 20, letterSpacing: -0.5 }}>
              Stay Comfortable{" "}
              <span style={{ color: "#7ec8f7" }}>Year-Round</span>{" "}
              with Expert HVAC
            </h1>
            <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.8)", marginBottom: 36, maxWidth: 480, lineHeight: 1.8 }}>
              From emergency repairs to full system installations, ArcticBreeze keeps your home or business at the perfect temperature — guaranteed.
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 44 }}>
              <button onClick={() => scrollTo("contact")} className="hvac-btn-primary" style={btn(C.orange, "#fff")}>Get a Free Quote →</button>
              <a href="tel:+15551234567" className="hvac-btn-outline" style={btn("transparent", "#fff", "2px solid rgba(255,255,255,0.6)")}>📞 (555) 123-4567</a>
            </div>
            <div style={{ display: "flex", paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.15)" }}>
              {[
                { num: "5,200+", lbl: "Systems Installed" },
                { num: "4.9 ★", lbl: "Google Rating" },
                { num: "20+ yrs", lbl: "Experience" },
              ].map((s) => (
                <div key={s.lbl} className="hvac-stat">
                  <div style={{ fontSize: "1.9rem", fontWeight: 800, color: C.white, lineHeight: 1 }}>{s.num}</div>
                  <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.55)", marginTop: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Right: trust card */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 16, padding: 28 }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: "rgba(255,255,255,0.5)", marginBottom: 20 }}>Why Homeowners Choose Us</div>
              {[
                { icon: "✅", label: "Licensed & Fully Insured" },
                { icon: "🔧", label: "All Makes & Models Serviced" },
                { icon: "💰", label: "Upfront Pricing — No Hidden Fees" },
                { icon: "⚡", label: "Same-Day Emergency Response" },
                { icon: "🏆", label: "100% Satisfaction Guarantee" },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  <span style={{ fontSize: "1.1rem" }}>{item.icon}</span>
                  <span style={{ fontSize: "0.92rem", color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>{item.label}</span>
                </div>
              ))}
            </div>
            <div style={{ background: C.orange, borderRadius: 12, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: "1rem", fontWeight: 700, color: C.white }}>24/7 Emergency Line</div>
                <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.8)", marginTop: 2 }}>AC down? Heat out? Call now.</div>
              </div>
              <a href="tel:+15551234567" style={{ background: C.white, color: C.orange, padding: "10px 20px", borderRadius: 50, fontWeight: 700, fontSize: "0.9rem", textDecoration: "none" }}>Call Now</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <div style={{ background: C.blueLt, borderBottom: "1px solid #d0e4f7", padding: "16px 5%", display: "flex", justifyContent: "center", gap: 40, flexWrap: "wrap" }}>
        {["✅ Licensed & Insured", "⭐ 4.9-Star Rated", "🏆 20+ Years Experience", "💰 No Hidden Fees", "🔧 All Brands Serviced"].map((t) => (
          <span key={t} style={{ fontSize: "0.88rem", fontWeight: 600, color: C.navy }}>{t}</span>
        ))}
      </div>

      {/* ── SERVICES ── */}
      <section id="hvac-services" style={{ background: C.white, padding: "100px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 5%" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.blue, display: "block", marginBottom: 10 }}>What We Do</span>
            <h2 style={{ fontSize: "clamp(1.9rem, 3.5vw, 2.6rem)", fontWeight: 800, color: C.navyDk, marginBottom: 14, letterSpacing: -0.3 }}>Comprehensive HVAC Services</h2>
            <p style={{ fontSize: "1.05rem", color: C.textLt, maxWidth: 560, margin: "0 auto" }}>Whether you need routine maintenance or an urgent fix, our certified technicians have you covered.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            {SERVICES.map((svc) => (
              <div key={svc.title} className="hvac-card">
                <img src={svc.img} alt={svc.title} style={{ width: "100%", height: 175, objectFit: "cover", display: "block" }} />
                <div style={{ padding: "24px 26px" }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: C.navyDk, marginBottom: 8 }}>{svc.title}</h3>
                  <p style={{ fontSize: "0.9rem", color: C.textLt, margin: 0, lineHeight: 1.7 }}>{svc.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT / WHY US ── */}
      <section id="hvac-about" style={{ background: C.light, padding: "100px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 5%" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
            {/* Photo collage */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, position: "relative" }}>
              <img src="https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&q=80&fit=crop" alt="HVAC technician" style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", borderRadius: 12 }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80&fit=crop" alt="Comfortable home" style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", borderRadius: 12 }} />
                <img src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&q=80&fit=crop" alt="AC unit" style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", borderRadius: 12 }} />
              </div>
              {/* Floating badge */}
              <div style={{ position: "absolute", bottom: -16, left: "50%", transform: "translateX(-50%)", background: C.orange, color: C.white, borderRadius: 10, padding: "14px 24px", textAlign: "center", boxShadow: "0 8px 24px rgba(232,93,4,0.3)", whiteSpace: "nowrap" }}>
                <div style={{ fontSize: "1.8rem", fontWeight: 800, lineHeight: 1 }}>2 hr</div>
                <div style={{ fontSize: "0.75rem", opacity: 0.9, marginTop: 2 }}>Avg. Response Time</div>
              </div>
            </div>
            {/* Text */}
            <div>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.blue, display: "block", marginBottom: 12 }}>Why ArcticBreeze</span>
              <h2 style={{ fontSize: "clamp(1.9rem, 3.5vw, 2.5rem)", fontWeight: 800, color: C.navyDk, marginBottom: 20, letterSpacing: -0.3 }}>Numbers That Speak for Themselves</h2>
              <p style={{ color: C.textLt, marginBottom: 16, fontSize: "1.02rem" }}>
                For over 20 years, ArcticBreeze has served homeowners and businesses across the metro area with honest pricing, expert technicians, and lasting results.
              </p>
              <p style={{ color: C.textLt, marginBottom: 36, fontSize: "1.02rem" }}>
                We show up on time, explain everything in plain English, and never upsell you on something you don't need. That's the ArcticBreeze promise.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 36 }}>
                {[
                  { stat: "5,200+", lbl: "Systems Installed" },
                  { stat: "4.9 ★", lbl: "Google Rating" },
                  { stat: "< 2 hrs", lbl: "Emergency Response" },
                  { stat: "100%", lbl: "Satisfaction Guarantee" },
                ].map((s) => (
                  <div key={s.lbl} style={{ background: C.white, border: `1px solid #d8e8f7`, borderRadius: 10, padding: "18px 20px" }}>
                    <div style={{ fontSize: "1.7rem", fontWeight: 800, color: C.navy, lineHeight: 1 }}>{s.stat}</div>
                    <div style={{ fontSize: "0.8rem", color: C.textLt, marginTop: 4 }}>{s.lbl}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => scrollTo("contact")} className="hvac-btn-primary" style={btn(C.orange, "#fff")}>Schedule a Service Call →</button>
            </div>
          </div>
        </div>
      </section>

      {/* ── GALLERY ── */}
      <section id="hvac-gallery" style={{ background: C.white, padding: "100px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 5%" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.blue, display: "block", marginBottom: 10 }}>Our Work</span>
            <h2 style={{ fontSize: "clamp(1.9rem, 3.5vw, 2.6rem)", fontWeight: 800, color: C.navyDk, marginBottom: 14, letterSpacing: -0.3 }}>Recent Installations & Repairs</h2>
            <p style={{ fontSize: "1.05rem", color: C.textLt, maxWidth: 560, margin: "0 auto" }}>From single-family homes to multi-unit commercial buildings, we handle it all.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gridTemplateRows: "repeat(2, 235px)", gap: 14 }}>
            {GALLERY.map((item, i) => (
              <div key={i} className="hvac-gallery-item" style={{ gridRow: item.span2 ? "span 2" : undefined }}>
                <div className="hvac-gallery-bg" style={{ height: "100%", backgroundImage: `url('${item.bg}')` }} />
                <div className="hvac-gallery-overlay">
                  <span style={{ color: C.white, fontWeight: 600, fontSize: "0.9rem" }}>{item.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="hvac-testimonials" style={{ background: C.light, padding: "100px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 5%" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.blue, display: "block", marginBottom: 10 }}>Customer Reviews</span>
            <h2 style={{ fontSize: "clamp(1.9rem, 3.5vw, 2.6rem)", fontWeight: 800, color: C.navyDk, marginBottom: 14, letterSpacing: -0.3 }}>What Our Customers Say</h2>
            <p style={{ fontSize: "1.05rem", color: C.textLt, maxWidth: 560, margin: "0 auto" }}>Rated 4.9 stars with 300+ reviews. Real stories from real homeowners and businesses.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="hvac-testi-card">
                <div style={{ color: "#f5a623", fontSize: "1.1rem", marginBottom: 14 }}>★★★★★</div>
                <blockquote style={{ fontSize: "0.97rem", color: C.gray, fontStyle: "italic", lineHeight: 1.8, marginBottom: 20 }}>"{t.quote}"</blockquote>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: C.blueLt, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: C.navy, fontSize: "0.95rem", flexShrink: 0 }}>{t.initials}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.92rem", color: C.text }}>{t.name}</div>
                    <div style={{ fontSize: "0.78rem", color: C.textLt }}>{t.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1600&q=80&fit=crop')",
        backgroundSize: "cover", backgroundPosition: "center",
        padding: "80px 5%", textAlign: "center", position: "relative",
      }}>
        <div aria-hidden style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, rgba(232,93,4,0.93), rgba(200,70,0,0.9))` }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)", fontWeight: 800, color: C.white, marginBottom: 14, letterSpacing: -0.3 }}>Don't Wait Until It Breaks</h2>
          <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.88)", marginBottom: 36, maxWidth: 560, margin: "0 auto 36px" }}>
            Schedule your seasonal tune-up today and get 15% off your first maintenance visit. Protect your system before peak season hits.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => scrollTo("contact")} style={{ ...btn(C.white, C.orange), boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>Book My Tune-Up →</button>
            <a href="tel:+15551234567" style={{ ...btn("transparent", C.white, "2px solid rgba(255,255,255,0.7)"), boxShadow: "none" }}>📞 (555) 123-4567</a>
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="hvac-contact" style={{ background: C.white, padding: "100px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 5%" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 70, alignItems: "start" }}>
            {/* Info */}
            <div>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.blue, display: "block", marginBottom: 12 }}>Get in Touch</span>
              <h2 style={{ fontSize: "clamp(1.9rem, 3.5vw, 2.5rem)", fontWeight: 800, color: C.navyDk, marginBottom: 16, letterSpacing: -0.3 }}>Request a Free Quote</h2>
              <p style={{ color: C.textLt, marginBottom: 36, fontSize: "1.02rem" }}>Our team will respond within 1 business hour. For emergencies, call us directly for immediate dispatch.</p>
              {[
                { icon: "📞", label: "Phone", val: "(555) 123-4567", href: "tel:+15551234567" },
                { icon: "✉️", label: "Email", val: "info@arcticbreezehhvac.com", href: "mailto:info@arcticbreezehhvac.com" },
                { icon: "🕐", label: "Hours", val: "Mon–Fri 7am–8pm · Sat 8am–5pm · 24/7 Emergency", href: undefined },
                { icon: "📍", label: "Service Area", val: "Metro City and communities within 50 miles", href: undefined },
              ].map((m) => (
                <div key={m.label} style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 24 }}>
                  <div style={{ width: 46, height: 46, background: C.blueLt, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", flexShrink: 0 }}>{m.icon}</div>
                  <div>
                    <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: C.textLt, marginBottom: 3 }}>{m.label}</div>
                    {m.href
                      ? <a href={m.href} style={{ fontSize: "0.97rem", fontWeight: 600, color: C.blue, textDecoration: "none" }}>{m.val}</a>
                      : <div style={{ fontSize: "0.97rem", color: C.text, fontWeight: 500 }}>{m.val}</div>}
                  </div>
                </div>
              ))}
            </div>
            {/* Form */}
            <div style={{ background: C.light, borderRadius: 14, padding: 40 }}>
              {formDone ? (
                <div style={{ textAlign: "center", padding: "40px 20px" }}>
                  <div style={{ fontSize: "3rem", color: C.blue, marginBottom: 12 }}>✅</div>
                  <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: C.navyDk, marginBottom: 8 }}>Request Sent!</h3>
                  <p style={{ color: C.textLt }}>We'll call you within 1 hour. For urgent issues, call <a href="tel:+15551234567" style={{ color: C.blue, fontWeight: 600, textDecoration: "none" }}>(555) 123-4567</a>.</p>
                </div>
              ) : (
                <>
                  <h3 style={{ fontSize: "1.35rem", fontWeight: 700, color: C.navyDk, marginBottom: 6 }}>Get Your Free Quote</h3>
                  <p style={{ fontSize: "0.88rem", color: C.textLt, marginBottom: 28 }}>Fill out the form and we'll get back to you within 1 hour.</p>
                  <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <input required placeholder="Your Name" className="hvac-input" />
                    <input required type="tel" placeholder="Phone Number" className="hvac-input" />
                    <input type="email" placeholder="Email Address" className="hvac-input" />
                    <select className="hvac-input" defaultValue="">
                      <option value="">Select Service Needed</option>
                      <option>AC Repair or Installation</option>
                      <option>Heating / Furnace Service</option>
                      <option>Preventive Maintenance</option>
                      <option>Air Quality / Filtration</option>
                      <option>Smart Thermostat Setup</option>
                      <option>Commercial HVAC</option>
                      <option>Emergency Service</option>
                    </select>
                    <textarea placeholder="Describe your issue or question…" className="hvac-input" style={{ resize: "vertical", minHeight: 100 }} />
                    <button type="submit" className="hvac-btn-primary" style={{ ...btn(C.orange, "#fff"), width: "100%", justifyContent: "center", padding: "15px", fontSize: "1rem" }}>
                      Send My Request →
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICE AREAS ── */}
      <section style={{ background: C.blueLt, padding: "60px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 5%", textAlign: "center" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: C.navyDk, marginBottom: 20 }}>Proudly Serving Metro City & Surrounding Areas</h3>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}>
            {AREAS.map((a) => <span key={a} className="hvac-area-tag">{a}</span>)}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: C.navyDk, color: "rgba(255,255,255,0.6)", padding: "60px 0 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 5%" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 48 }}>
            <div>
              <div style={{ fontSize: "1.25rem", fontWeight: 800, color: C.white, marginBottom: 12 }}>ArcticBreeze <span style={{ color: "#7ec8f7" }}>HVAC</span></div>
              <p style={{ fontSize: "0.9rem", lineHeight: 1.7 }}>Licensed and insured HVAC experts serving Metro City for over 20 years. We build, service, and maintain systems that keep you comfortable year-round.</p>
            </div>
            <div>
              <h4 style={{ color: C.white, fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 14 }}>Services</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {["AC Installation","Heating & Furnace","Air Quality","Maintenance Plans","Smart Thermostats"].map((s) => (
                  <li key={s} style={{ marginBottom: 9, fontSize: "0.88rem" }}>{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 style={{ color: C.white, fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 14 }}>Company</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {[["about","About Us"],["gallery","Our Work"],["testimonials","Reviews"],["contact","Contact"]].map(([id,label]) => (
                  <li key={id} style={{ marginBottom: 9 }}>
                    <button onClick={() => scrollTo(id)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontSize: "0.88rem", cursor: "pointer", padding: 0 }}>{label}</button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 style={{ color: C.white, fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 14 }}>Contact</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "0.88rem" }}>
                <li style={{ marginBottom: 9 }}><a href="tel:+15551234567" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>(555) 123-4567</a></li>
                <li style={{ marginBottom: 9 }}>info@arcticbreezehhvac.com</li>
                <li style={{ marginBottom: 9 }}>Mon–Fri: 7am – 8pm</li>
                <li>24/7 Emergency Line</li>
              </ul>
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 24, display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
            <span>© 2026 ArcticBreeze HVAC. All rights reserved. · License #HV-20485</span>
            <span>Built for comfort. Built to last.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
