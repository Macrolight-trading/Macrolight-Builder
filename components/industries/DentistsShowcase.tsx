"use client";

import { useState, useEffect } from "react";
import type { IndustryProfile } from "@/lib/industries";

// ── BrightSmile Dental colour palette ───────────────────────────────────────
const C = {
  tealDk:  "#00574f",
  teal:    "#00897b",
  tealLt:  "#e0f5f3",
  tealMid: "#b2dfdb",
  coral:   "#ff6b35",
  coralLt: "#fff3ef",
  gray:    "#4a5568",
  light:   "#f8fbfc",
  white:   "#ffffff",
  text:    "#1a2e2c",
  textLt:  "#5a6a68",
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
    img: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&q=80&fit=crop",
    title: "Cleanings & Exams",
    desc: "Routine checkups, professional cleanings, and digital X-rays to keep your teeth and gums healthy for life.",
  },
  {
    img: "https://images.unsplash.com/photo-1588776814546-1ffea5d2e3b7?w=600&q=80&fit=crop",
    title: "Teeth Whitening",
    desc: "In-office Zoom! whitening or custom take-home trays — get noticeably brighter in just one visit.",
  },
  {
    img: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&q=80&fit=crop",
    title: "Dental Implants",
    desc: "Permanent, natural-looking tooth replacements that restore full function and lasting confidence.",
  },
  {
    img: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=600&q=80&fit=crop",
    title: "Invisalign®",
    desc: "Clear aligner therapy to straighten your teeth discreetly — no brackets, no wires, no hesitation to smile.",
  },
  {
    img: "https://images.unsplash.com/photo-1598257006263-e5e7cdf6e5f7?w=600&q=80&fit=crop",
    title: "Crowns & Veneers",
    desc: "Porcelain crowns and custom veneers that blend seamlessly with your natural smile for a stunning result.",
  },
  {
    img: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=600&q=80&fit=crop",
    title: "Pediatric Dentistry",
    desc: "Kid-friendly care that makes dental visits fun and builds healthy habits that last a lifetime.",
  },
];

const GALLERY = [
  { bg: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=900&q=80&fit=crop", label: "State-of-the-Art Treatment Rooms", span2: true },
  { bg: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&q=80&fit=crop", label: "Modern Equipment" },
  { bg: "https://images.unsplash.com/photo-1588776814546-1ffea5d2e3b7?w=600&q=80&fit=crop", label: "Comfortable Environment" },
  { bg: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&q=80&fit=crop", label: "Expert Care" },
  { bg: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=600&q=80&fit=crop", label: "Cosmetic Results" },
];

const TESTIMONIALS = [
  {
    initials: "MT", name: "Marcus T.", location: "Patient since 2019",
    quote: "I used to have terrible dental anxiety but Dr. Chen and her team made me feel completely at ease. I actually look forward to my checkups now — I never thought I'd say that!",
  },
  {
    initials: "PN", name: "Priya N.", location: "Invisalign Patient",
    quote: "Got Invisalign here and my smile transformed in under a year. The whole process was seamless, the staff always made time for my questions, and the results are absolutely stunning.",
  },
  {
    initials: "AW", name: "Ashley W.", location: "Parent of Two",
    quote: "Brought my kids (ages 5 and 8) and they both loved it. Dr. Chen was incredible with them — patient, warm, and so good at making it feel like an adventure instead of an appointment.",
  },
];

const INSURANCE = ["Delta Dental", "Cigna", "Aetna", "MetLife", "United", "BlueCross"];

export default function DentistsShowcase({ industry: _industry }: { industry: IndustryProfile }) {
  const [scrolled, setScrolled] = useState(false);
  const [formDone, setFormDone] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(`dent-${id}`)?.scrollIntoView({ behavior: "smooth" });
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
        .dent-nav-link { font-size: 0.9rem; font-weight: 500; color: ${C.textLt}; text-decoration: none; transition: color 0.2s; cursor: pointer; background: none; border: none; padding: 0; }
        .dent-nav-link:hover { color: ${C.teal}; }
        .dent-card { background: ${C.white}; border-radius: 12px; overflow: hidden; border: 1px solid #cce8e5; transition: all 0.25s ease; }
        .dent-card:hover { transform: translateY(-5px); box-shadow: 0 12px 32px rgba(0,137,123,0.13); border-color: #9dd6d1; }
        .dent-gallery-item { border-radius: 12px; overflow: hidden; position: relative; cursor: pointer; }
        .dent-gallery-bg { width: 100%; height: 100%; background-size: cover; background-position: center; transition: transform 0.5s ease; }
        .dent-gallery-item:hover .dent-gallery-bg { transform: scale(1.06); }
        .dent-gallery-overlay { position: absolute; inset: 0; background: linear-gradient(transparent 45%, rgba(0,0,0,0.6)); display: flex; align-items: flex-end; padding: 20px; opacity: 0; transition: opacity 0.3s; }
        .dent-gallery-item:hover .dent-gallery-overlay { opacity: 1; }
        .dent-testi-card { background: ${C.white}; border-radius: 12px; padding: 36px; box-shadow: 0 2px 16px rgba(0,0,0,0.06); border-top: 4px solid ${C.teal}; transition: transform 0.25s; }
        .dent-testi-card:hover { transform: translateY(-4px); }
        .dent-input { width: 100%; padding: 13px 16px; border: 1.5px solid #b2dfdb; border-radius: 8px; font-family: 'Inter', sans-serif; font-size: 0.95rem; transition: border-color 0.2s; background: #fff; box-sizing: border-box; color: ${C.text}; }
        .dent-input:focus { outline: none; border-color: ${C.teal}; box-shadow: 0 0 0 3px rgba(0,137,123,0.1); }
        .dent-btn-primary { background: ${C.coral}; color: #fff; }
        .dent-btn-primary:hover { background: #e05520; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(255,107,53,0.35); }
        .dent-btn-teal { background: ${C.teal}; color: #fff; }
        .dent-btn-teal:hover { background: ${C.tealDk}; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,137,123,0.35); }
        .dent-btn-outline { background: transparent; border: 2px solid rgba(255,255,255,0.65); color: #fff; }
        .dent-btn-outline:hover { background: rgba(255,255,255,0.12); }
        .dent-ins-badge { background: ${C.white}; border: 1px solid #b2dfdb; border-radius: 6px; padding: 6px 14px; font-size: 0.82rem; font-weight: 600; color: ${C.tealDk}; }
        .dent-stat-box { background: ${C.white}; border: 1px solid #cce8e5; border-radius: 10px; padding: 18px 20px; }
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
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: `linear-gradient(135deg, ${C.tealDk}, ${C.teal})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>🦷</div>
            <div>
              <div style={{ fontSize: "1.05rem", fontWeight: 800, color: C.tealDk, letterSpacing: -0.3 }}>BrightSmile <span style={{ color: C.teal }}>Dental</span></div>
              <div style={{ fontSize: "0.6rem", color: C.textLt, letterSpacing: 1.5, textTransform: "uppercase" }}>General · Cosmetic · Family</div>
            </div>
          </div>
          <nav style={{ display: "flex", alignItems: "center", gap: 28 }}>
            {[["services","Services"],["team","Our Team"],["gallery","Gallery"],["testimonials","Reviews"],["appointment","Appointment"]].map(([id,label]) => (
              <button key={id} onClick={() => scrollTo(id)} className="dent-nav-link">{label}</button>
            ))}
          </nav>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <a href="tel:+15559876543" style={{ fontSize: "0.9rem", fontWeight: 600, color: C.tealDk, textDecoration: "none" }}>📞 (555) 987-6543</a>
            <button onClick={() => scrollTo("appointment")} className="dent-btn-primary" style={btn(C.coral, "#fff")}>Book Appointment</button>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section id="dent-home" style={{
        position: "relative", minHeight: "100vh", display: "flex", alignItems: "center",
        backgroundImage: "url('https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1920&q=80&fit=crop')",
        backgroundSize: "cover", backgroundPosition: "center", overflow: "hidden",
      }}>
        <div aria-hidden style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, rgba(0,87,79,0.93) 0%, rgba(0,137,123,0.88) 55%, rgba(77,182,172,0.83) 100%)` }} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 1200, margin: "0 auto", padding: "120px 5% 80px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center", width: "100%" }}>
          {/* Left */}
          <div style={{ color: C.white }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 50, padding: "7px 18px", fontSize: "0.82rem", marginBottom: 28 }}>
              <span style={{ color: "#ffd54f" }}>★★★★★</span>
              <span>4.9 Rating · 300+ Reviews</span>
            </div>
            <h1 style={{ fontSize: "clamp(2.4rem, 4.5vw, 3.6rem)", fontWeight: 800, lineHeight: 1.1, marginBottom: 20, letterSpacing: -0.5 }}>
              A Healthier Smile{" "}
              <span style={{ color: "#b2ebf2" }}>Starts Here</span>
            </h1>
            <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.82)", marginBottom: 36, maxWidth: 480, lineHeight: 1.8 }}>
              BrightSmile Dental offers gentle, modern care for the whole family — from routine cleanings to complete smile makeovers, in a warm and anxiety-free environment.
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 44 }}>
              <button onClick={() => scrollTo("appointment")} className="dent-btn-primary" style={btn(C.coral, "#fff")}>Book an Appointment →</button>
              <a href="tel:+15559876543" className="dent-btn-outline" style={btn("transparent", "#fff", "2px solid rgba(255,255,255,0.6)")}>📞 (555) 987-6543</a>
            </div>
            <div style={{ display: "flex", gap: 0, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.15)" }}>
              {[
                { num: "8,400+", lbl: "Happy Patients" },
                { num: "4.9 ★", lbl: "Google Rating" },
                { num: "15 yrs", lbl: "In Practice" },
              ].map((s, i) => (
                <div key={s.lbl} style={{ paddingRight: i < 2 ? 32 : 0, marginRight: i < 2 ? 32 : 0, borderRight: i < 2 ? "1px solid rgba(255,255,255,0.15)" : "none" }}>
                  <div style={{ fontSize: "1.9rem", fontWeight: 800, color: C.white, lineHeight: 1 }}>{s.num}</div>
                  <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.55)", marginTop: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Right: new patient card */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 16, padding: 28 }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: "rgba(255,255,255,0.5)", marginBottom: 16 }}>New Patient Special</div>
              <div style={{ fontSize: "2.6rem", fontWeight: 800, color: C.white, lineHeight: 1 }}>$99</div>
              <div style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.65)", marginTop: 4, marginBottom: 20 }}>Comprehensive Exam + X-Rays · Reg. $265</div>
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.12)", paddingTop: 16 }}>
                <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, color: "rgba(255,255,255,0.45)", marginBottom: 12 }}>Includes</div>
                {["Full mouth X-rays", "Comprehensive exam", "Cleaning consultation", "Treatment plan & options"].map((item) => (
                  <div key={item} style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 9 }}>
                    <div style={{ width: 16, height: 16, borderRadius: "50%", background: "rgba(178,235,242,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg viewBox="0 0 12 12" fill="none" style={{ width: 8, height: 8 }}><polyline points="2 6 5 9 10 3" stroke="#b2ebf2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <span style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.8)" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: C.coral, borderRadius: 12, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: "1rem", fontWeight: 700, color: C.white }}>Same-Day Appointments</div>
                <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.82)", marginTop: 2 }}>Most insurance accepted</div>
              </div>
              <button onClick={() => scrollTo("appointment")} style={{ background: C.white, color: C.coral, padding: "10px 20px", borderRadius: 50, fontWeight: 700, fontSize: "0.9rem", border: "none", cursor: "pointer" }}>Book Now</button>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <div style={{ background: C.tealLt, borderBottom: `1px solid ${C.tealMid}`, padding: "16px 5%", display: "flex", justifyContent: "center", gap: 40, flexWrap: "wrap" }}>
        {["✅ Board-Certified Dentists", "⭐ 4.9-Star Rated", "👨‍👩‍👧 All Ages Welcome", "🏥 Most Insurance Accepted", "📅 Same-Day Appointments"].map((t) => (
          <span key={t} style={{ fontSize: "0.88rem", fontWeight: 600, color: C.tealDk }}>{t}</span>
        ))}
      </div>

      {/* ── SERVICES ── */}
      <section id="dent-services" style={{ background: C.white, padding: "100px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 5%" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.teal, display: "block", marginBottom: 10 }}>Our Services</span>
            <h2 style={{ fontSize: "clamp(1.9rem, 3.5vw, 2.6rem)", fontWeight: 800, color: C.tealDk, marginBottom: 14, letterSpacing: -0.3 }}>Complete Dental Care Under One Roof</h2>
            <p style={{ fontSize: "1.05rem", color: C.textLt, maxWidth: 560, margin: "0 auto" }}>From your first checkup to advanced cosmetic work, we provide everything your smile needs.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            {SERVICES.map((svc) => (
              <div key={svc.title} className="dent-card">
                <img src={svc.img} alt={svc.title} style={{ width: "100%", height: 175, objectFit: "cover", display: "block" }} />
                <div style={{ padding: "24px 26px" }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: C.tealDk, marginBottom: 8 }}>{svc.title}</h3>
                  <p style={{ fontSize: "0.9rem", color: C.textLt, margin: 0, lineHeight: 1.7 }}>{svc.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MEET THE TEAM ── */}
      <section id="dent-team" style={{ background: C.light, padding: "100px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 5%" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
            {/* Photo collage */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <img src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=600&q=80&fit=crop" alt="Dentist" style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", borderRadius: 12, gridRow: "span 2" }} />
              <img src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=80&fit=crop" alt="Dental team" style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", borderRadius: 12 }} />
              <img src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&q=80&fit=crop" alt="Dental office" style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", borderRadius: 12 }} />
            </div>
            {/* Text */}
            <div>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.teal, display: "block", marginBottom: 12 }}>Meet the Doctor</span>
              <h2 style={{ fontSize: "clamp(1.9rem, 3.5vw, 2.5rem)", fontWeight: 800, color: C.tealDk, marginBottom: 6, letterSpacing: -0.3 }}>Dr. Sarah Chen, DDS</h2>
              <div style={{ fontSize: "0.92rem", color: C.teal, fontWeight: 600, marginBottom: 20 }}>Lead Dentist & Founder · BrightSmile Dental</div>
              <p style={{ color: C.textLt, marginBottom: 16, fontSize: "1.02rem" }}>
                Dr. Chen graduated with honors from the UC School of Dentistry and has been serving patients for over 15 years. She is passionate about creating a relaxed, judgment-free environment where patients of all ages feel at ease.
              </p>
              <p style={{ color: C.textLt, marginBottom: 28, fontSize: "1.02rem" }}>
                Her areas of special interest include cosmetic smile design, anxiety-free dentistry, and advanced implant restoration.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 32 }}>
                {["DDS – UC San Francisco", "Fellow, AGD", "Invisalign Certified", "Zoom! Provider", "Implant Restoration"].map((c) => (
                  <span key={c} style={{ background: C.tealLt, color: C.tealDk, padding: "5px 14px", borderRadius: 20, fontSize: "0.82rem", fontWeight: 600 }}>{c}</span>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {[
                  { stat: "8,400+", lbl: "Patients Seen" },
                  { stat: "4.9 ★", lbl: "Average Rating" },
                  { stat: "15 yrs", lbl: "In Practice" },
                  { stat: "98%", lbl: "Retention Rate" },
                ].map((s) => (
                  <div key={s.lbl} className="dent-stat-box">
                    <div style={{ fontSize: "1.7rem", fontWeight: 800, color: C.teal, lineHeight: 1 }}>{s.stat}</div>
                    <div style={{ fontSize: "0.78rem", color: C.textLt, marginTop: 4 }}>{s.lbl}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── GALLERY ── */}
      <section id="dent-gallery" style={{ background: C.white, padding: "100px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 5%" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.teal, display: "block", marginBottom: 10 }}>Our Practice</span>
            <h2 style={{ fontSize: "clamp(1.9rem, 3.5vw, 2.6rem)", fontWeight: 800, color: C.tealDk, marginBottom: 14, letterSpacing: -0.3 }}>A Space Built for Your Comfort</h2>
            <p style={{ fontSize: "1.05rem", color: C.textLt, maxWidth: 560, margin: "0 auto" }}>Modern equipment, calming design, and a team that puts your comfort first — every single visit.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gridTemplateRows: "repeat(2, 235px)", gap: 14 }}>
            {GALLERY.map((item, i) => (
              <div key={i} className="dent-gallery-item" style={{ gridRow: item.span2 ? "span 2" : undefined }}>
                <div className="dent-gallery-bg" style={{ height: "100%", backgroundImage: `url('${item.bg}')` }} />
                <div className="dent-gallery-overlay">
                  <span style={{ color: C.white, fontWeight: 600, fontSize: "0.9rem" }}>{item.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="dent-testimonials" style={{ background: C.light, padding: "100px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 5%" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.teal, display: "block", marginBottom: 10 }}>Patient Reviews</span>
            <h2 style={{ fontSize: "clamp(1.9rem, 3.5vw, 2.6rem)", fontWeight: 800, color: C.tealDk, marginBottom: 14, letterSpacing: -0.3 }}>What Our Patients Are Saying</h2>
            <p style={{ fontSize: "1.05rem", color: C.textLt, maxWidth: 560, margin: "0 auto" }}>4.9 stars across Google & Yelp. We let our patients do the talking.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="dent-testi-card">
                <div style={{ color: "#f5a623", fontSize: "1.1rem", marginBottom: 14 }}>★★★★★</div>
                <blockquote style={{ fontSize: "0.97rem", color: C.gray, fontStyle: "italic", lineHeight: 1.8, marginBottom: 20 }}>"{t.quote}"</blockquote>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: C.tealLt, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: C.tealDk, fontSize: "0.95rem", flexShrink: 0 }}>{t.initials}</div>
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
        backgroundImage: "url('https://images.unsplash.com/photo-1588776814546-1ffea5d2e3b7?w=1600&q=80&fit=crop')",
        backgroundSize: "cover", backgroundPosition: "center",
        padding: "80px 5%", textAlign: "center", position: "relative",
      }}>
        <div aria-hidden style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, rgba(255,107,53,0.93), rgba(220,80,30,0.92))` }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)", fontWeight: 800, color: C.white, marginBottom: 14, letterSpacing: -0.3 }}>Your Best Smile Is One Appointment Away</h2>
          <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.9)", marginBottom: 36, maxWidth: 560, margin: "0 auto 36px" }}>
            New patients receive a comprehensive exam, X-rays, and cleaning consultation for just $99. Same-day appointments available.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => scrollTo("appointment")} style={{ ...btn(C.white, C.coral), boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>Claim My New Patient Special →</button>
            <a href="tel:+15559876543" style={{ ...btn("transparent", C.white, "2px solid rgba(255,255,255,0.7)") }}>📞 (555) 987-6543</a>
          </div>
        </div>
      </section>

      {/* ── APPOINTMENT ── */}
      <section id="dent-appointment" style={{ background: C.white, padding: "100px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 5%" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 70, alignItems: "start" }}>
            {/* Info */}
            <div>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.teal, display: "block", marginBottom: 12 }}>Schedule a Visit</span>
              <h2 style={{ fontSize: "clamp(1.9rem, 3.5vw, 2.5rem)", fontWeight: 800, color: C.tealDk, marginBottom: 16, letterSpacing: -0.3 }}>Book Your Appointment</h2>
              <p style={{ color: C.textLt, marginBottom: 32, fontSize: "1.02rem" }}>We're accepting new patients. Same-day and Saturday appointments are available for your convenience.</p>
              {[
                { icon: "📞", label: "Phone", val: "(555) 987-6543", href: "tel:+15559876543" },
                { icon: "📍", label: "Address", val: "142 Wellness Blvd, Suite 300 · Metro City, ST 00000", href: undefined },
                { icon: "🕐", label: "Hours", val: "Mon–Thu 8am–6pm · Fri 8am–4pm · Sat 9am–2pm", href: undefined },
              ].map((m) => (
                <div key={m.label} style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 22 }}>
                  <div style={{ width: 46, height: 46, background: C.tealLt, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", flexShrink: 0 }}>{m.icon}</div>
                  <div>
                    <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: C.textLt, marginBottom: 3 }}>{m.label}</div>
                    {m.href
                      ? <a href={m.href} style={{ fontSize: "0.97rem", fontWeight: 600, color: C.teal, textDecoration: "none" }}>{m.val}</a>
                      : <div style={{ fontSize: "0.97rem", color: C.text, fontWeight: 500 }}>{m.val}</div>}
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 32 }}>
                <div style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: C.textLt, marginBottom: 14 }}>Insurance We Accept</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {INSURANCE.map((ins) => <span key={ins} className="dent-ins-badge">{ins}</span>)}
                </div>
              </div>
            </div>
            {/* Form */}
            <div style={{ background: C.light, borderRadius: 14, padding: 40 }}>
              {formDone ? (
                <div style={{ textAlign: "center", padding: "40px 20px" }}>
                  <div style={{ fontSize: "3rem", color: C.teal, marginBottom: 12 }}>✅</div>
                  <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: C.tealDk, marginBottom: 8 }}>Request Received!</h3>
                  <p style={{ color: C.textLt }}>We'll call to confirm your appointment within 1 hour. Questions? <a href="tel:+15559876543" style={{ color: C.teal, fontWeight: 600, textDecoration: "none" }}>(555) 987-6543</a></p>
                </div>
              ) : (
                <>
                  <h3 style={{ fontSize: "1.35rem", fontWeight: 700, color: C.tealDk, marginBottom: 6 }}>Request an Appointment</h3>
                  <p style={{ fontSize: "0.88rem", color: C.textLt, marginBottom: 28 }}>We'll call to confirm within 1 hour during business hours.</p>
                  <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <input required placeholder="Full Name" className="dent-input" />
                    <input required type="tel" placeholder="Phone Number" className="dent-input" />
                    <input type="email" placeholder="Email Address" className="dent-input" />
                    <input type="date" className="dent-input" />
                    <select className="dent-input" defaultValue="">
                      <option value="">Select Service</option>
                      <option>New Patient Exam & X-Rays ($99 Special)</option>
                      <option>Routine Cleaning</option>
                      <option>Teeth Whitening</option>
                      <option>Invisalign Consultation</option>
                      <option>Dental Implant Consultation</option>
                      <option>Crowns / Veneers</option>
                      <option>Pediatric Dentistry</option>
                      <option>Emergency / Tooth Pain</option>
                    </select>
                    <select className="dent-input" defaultValue="">
                      <option value="">Insurance (optional)</option>
                      {INSURANCE.map((ins) => <option key={ins}>{ins}</option>)}
                      <option>Self-Pay / No Insurance</option>
                      <option>Other</option>
                    </select>
                    <button type="submit" className="dent-btn-teal" style={{ ...btn(C.teal, "#fff"), width: "100%", justifyContent: "center", padding: "15px", fontSize: "1rem" }}>
                      Request My Appointment →
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#0d2423", color: "rgba(255,255,255,0.55)", padding: "60px 0 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 5%" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 48 }}>
            <div>
              <div style={{ fontSize: "1.25rem", fontWeight: 800, color: C.white, marginBottom: 12 }}>BrightSmile <span style={{ color: "#80cbc4" }}>Dental</span></div>
              <p style={{ fontSize: "0.9rem", lineHeight: 1.7 }}>Board-certified dental care for the whole family. Gentle, modern, and designed around your comfort — because a great smile changes everything.</p>
            </div>
            <div>
              <h4 style={{ color: C.white, fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 14 }}>Services</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {["Cleanings & Exams","Teeth Whitening","Dental Implants","Invisalign®","Crowns & Veneers"].map((s) => (
                  <li key={s} style={{ marginBottom: 9, fontSize: "0.88rem" }}>{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 style={{ color: C.white, fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 14 }}>Company</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {[["team","Meet the Doctor"],["gallery","Our Practice"],["testimonials","Reviews"],["appointment","Book Appointment"]].map(([id,label]) => (
                  <li key={id} style={{ marginBottom: 9 }}>
                    <button onClick={() => scrollTo(id)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.55)", fontSize: "0.88rem", cursor: "pointer", padding: 0 }}>{label}</button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 style={{ color: C.white, fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 14 }}>Contact</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "0.88rem" }}>
                <li style={{ marginBottom: 9 }}><a href="tel:+15559876543" style={{ color: "rgba(255,255,255,0.55)", textDecoration: "none" }}>(555) 987-6543</a></li>
                <li style={{ marginBottom: 9 }}>142 Wellness Blvd, Suite 300</li>
                <li style={{ marginBottom: 9 }}>Mon–Thu: 8am – 6pm</li>
                <li>Sat: 9am – 2pm</li>
              </ul>
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 24, display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
            <span>© 2026 BrightSmile Dental. All rights reserved. · License #DDS-77341</span>
            <span>Designed for healthy smiles. ❤️</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
