"use client";

import { useState, useRef } from "react";
import type { IndustryProfile } from "@/lib/industries";

// ── Crestwood Legal Group colour palette ──────────────────────────────────────
const C = {
  navy:       "#0B1D3A",
  navyMid:    "#132E5B",
  navyLight:  "#1C4587",
  gold:       "#C9A84C",
  goldPale:   "#FDF8EC",
  red:        "#C0392B",
  white:      "#FFFFFF",
  offWhite:   "#F7F8FA",
  gray200:    "#E2E6EA",
  gray400:    "#8E99A4",
  gray600:    "#5A6474",
  text:       "#1A1F26",
} as const;

const starPath = "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";

const Stars = () => (
  <div style={{ display: "flex", gap: 3, marginBottom: 16 }}>
    {[0,1,2,3,4].map(i => (
      <svg key={i} viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: C.gold }}>
        <path d={starPath} />
      </svg>
    ))}
  </div>
);

const PRACTICE_AREAS = [
  { img: "https://images.unsplash.com/photo-1449965408869-ecd309fba004?w=600&q=80&fit=crop", title: "Auto Accidents",      sub: "Car, truck & motorcycle crashes" },
  { img: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&q=80&fit=crop", title: "Medical Malpractice", sub: "Surgical errors & misdiagnosis" },
  { img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80&fit=crop", title: "Workplace Injuries",  sub: "Workers' comp & third-party claims" },
  { img: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80&fit=crop", title: "Slip & Fall",         sub: "Premises liability cases" },
];

const RESULTS = [
  { amount: "$12.4M", type: "Trucking Accident",   desc: "Multi-vehicle collision caused by fatigued commercial driver" },
  { amount: "$8.7M",  type: "Medical Malpractice", desc: "Delayed cancer diagnosis leading to advanced-stage treatment" },
  { amount: "$5.2M",  type: "Workplace Injury",    desc: "Construction site fall due to inadequate safety equipment" },
  { amount: "$3.1M",  type: "Slip & Fall",         desc: "Spinal injury from unmarked hazard at commercial property" },
];

const TESTIMONIALS = [
  { result: "Settled — $1.2M", quote: "After my car accident, I didn't know where to turn. Crestwood handled everything — the insurance companies, the paperwork, the doctors. I just focused on healing. They got me more than I ever expected.", initials: "RN", name: "R. Navarro",    caseType: "Auto Accident · Maplewood, OH" },
  { result: "Verdict — $3.8M", quote: "My employer said my injury wasn't their fault. Crestwood proved otherwise. They took my case to trial and won. I was able to afford the surgery I needed and support my family during recovery.",        initials: "TW", name: "T. Williams",  caseType: "Workplace Injury · Cedar Hills, OH" },
  { result: "Settled — $925K", quote: "I slipped on an icy walkway at a shopping center and broke my hip. The property owner denied responsibility. Crestwood fought for me and settled for nearly a million dollars. Life-changing.",         initials: "PG", name: "P. Gonzalez", caseType: "Slip & Fall · Oakdale, OH" },
];

const STEP_OPTIONS = [
  [
    { icon: "🚗", label: "Car / Truck Accident",   value: "auto" },
    { icon: "⚠️", label: "Slip & Fall Injury",      value: "slip" },
    { icon: "🏗",  label: "Workplace Injury",         value: "work" },
    { icon: "🏥", label: "Medical Malpractice",      value: "medical" },
    { icon: "📝", label: "Other Injury / Not Sure",  value: "other" },
  ],
  [
    { icon: "📅", label: "Within the last 30 days", value: "days" },
    { icon: "📅", label: "1 – 6 months ago",         value: "months" },
    { icon: "📅", label: "6 – 12 months ago",        value: "year" },
    { icon: "📅", label: "Over a year ago",          value: "over-year" },
  ],
  [
    { icon: "🚑", label: "Yes — Emergency Room",        value: "yes-er" },
    { icon: "🩺", label: "Yes — Doctor / Urgent Care",  value: "yes-doc" },
    { icon: "🏥", label: "Yes — Still in Treatment",    value: "ongoing" },
    { icon: "✕",  label: "No, I haven't yet",           value: "no" },
  ],
];

const STEP_TITLES = [
  "What happened to you?",
  "When did this happen?",
  "Did you receive medical treatment?",
  "Almost done! How can we reach you?",
];

const STEP_HINTS = [
  "Select the option that best describes your situation.",
  "The timing matters for your claim's eligibility.",
  "Medical records strengthen your case significantly.",
  "Your information is 100% confidential and protected by attorney-client privilege.",
];

export default function LawFirmsShowcase({ industry }: { industry: IndustryProfile }) {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);
  const [quizDone, setQuizDone] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollTo = (id: string) => {
    const el = document.getElementById(`law-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const selectOption = (val: string) => {
    setSelected(val);
    if (step < 3) {
      setTimeout(() => {
        setStep(s => s + 1);
        setSelected(null);
      }, 400);
    }
  };

  const progressPct = quizDone ? 100 : ((step - 1) / 3) * 100;

  return (
    <div
      ref={containerRef}
      style={{ fontFamily: "'DM Sans', sans-serif", color: C.text, background: C.white, lineHeight: 1.6, WebkitFontSmoothing: "antialiased" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        .law-pa-card { position:relative; border-radius:12px; overflow:hidden; height:280px; cursor:pointer; }
        .law-pa-card img { width:100%; height:100%; object-fit:cover; transition:transform 0.6s ease; }
        .law-pa-card:hover img { transform:scale(1.06); }
        .law-pa-overlay { position:absolute; inset:0; background:linear-gradient(transparent 30%, rgba(11,29,58,0.85)); display:flex; flex-direction:column; justify-content:flex-end; padding:28px; transition:background 0.3s ease; }
        .law-pa-card:hover .law-pa-overlay { background:linear-gradient(transparent 10%, rgba(11,29,58,0.92)); }
        .law-result-card { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:32px 24px; text-align:center; transition:all 0.3s ease; }
        .law-result-card:hover { background:rgba(255,255,255,0.08); transform:translateY(-4px); }
        .law-test-card { background:${C.offWhite}; border-radius:12px; padding:36px; border:1px solid ${C.gray200}; transition:all 0.3s ease; }
        .law-test-card:hover { box-shadow:0 4px 24px rgba(11,29,58,0.08); transform:translateY(-4px); }
        .law-quiz-option { display:flex; align-items:center; gap:14px; padding:16px 20px; border:2px solid ${C.gray200}; border-radius:8px; cursor:pointer; transition:all 0.3s ease; font-size:0.95rem; font-weight:500; background:white; text-align:left; width:100%; font-family:inherit; }
        .law-quiz-option:hover { border-color:${C.navyLight}; background:${C.offWhite}; }
        .law-quiz-option.selected { border-color:${C.navy}; background:rgba(11,29,58,0.04); }
        .law-quiz-icon { width:40px; height:40px; min-width:40px; background:${C.offWhite}; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:1.2rem; }
        .law-quiz-option.selected .law-quiz-icon { background:${C.navy}; }
        .law-btn-gold { padding:18px 40px; background:${C.gold}; color:${C.navy}; border-radius:50px; font-weight:700; font-size:1.05rem; transition:all 0.3s ease; box-shadow:0 4px 20px rgba(201,168,76,0.3); display:inline-flex; align-items:center; gap:8px; cursor:pointer; border:none; font-family:inherit; text-decoration:none; }
        .law-btn-gold:hover { background:#B8963E; transform:translateY(-2px); }
        .law-btn-outline { padding:18px 40px; background:transparent; color:white; border:2px solid rgba(255,255,255,0.4); border-radius:50px; font-weight:700; font-size:1.05rem; transition:all 0.3s ease; display:inline-flex; align-items:center; gap:8px; cursor:pointer; font-family:inherit; text-decoration:none; }
        .law-btn-outline:hover { background:rgba(255,255,255,0.1); border-color:white; }
        .law-footer-link { transition:color 0.3s ease; }
        .law-footer-link:hover { color:${C.gold} !important; }
        @keyframes law-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(192,57,43,0.4);} 50%{box-shadow:0 0 0 8px rgba(192,57,43,0);} }
        .law-pulse { display:inline-block; width:8px; height:8px; background:${C.red}; border-radius:50%; animation:law-pulse 2s infinite; flex-shrink:0; }
        .law-quiz-input { width:100%; padding:14px 16px; border:2px solid ${C.gray200}; border-radius:8px; font-family:inherit; font-size:0.95rem; outline:none; box-sizing:border-box; }
        .law-quiz-input:focus { border-color:${C.navy}; }
      `}</style>

      {/* ── Top Bar ── */}
      <div style={{ background: C.navy, color: C.white, padding: "10px 24px", fontSize: "0.85rem", textAlign: "center" }}>
        <strong style={{ color: C.gold }}>Free Case Review</strong>
        {" — "}You Pay <strong style={{ color: C.gold }}>$0</strong> Unless We Win.{" "}
        <button
          onClick={() => scrollTo("quiz")}
          style={{ color: C.gold, fontWeight: 600, background: "none", border: "none", cursor: "pointer", fontSize: "inherit", padding: 0 }}
        >
          Start Now →
        </button>
      </div>

      {/* ── Header ── */}
      <header style={{ background: C.white, borderBottom: `1px solid ${C.gray200}`, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
            <div style={{ width: 42, height: 42, background: C.navy, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <div style={{ width: 18, height: 18, border: `3px solid ${C.gold}`, borderRadius: "50%" }} />
            </div>
            <div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.3rem", color: C.navy }}>Crestwood Legal</div>
              <div style={{ fontSize: "0.65rem", letterSpacing: 2, textTransform: "uppercase" as const, color: C.gray400, fontWeight: 600 }}>Injury & Accident Attorneys</div>
            </div>
          </div>
          <a href="tel:6145550347" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "1.1rem", fontWeight: 700, color: C.navy, textDecoration: "none" }}>
            <div>
              <div style={{ fontSize: "0.7rem", fontWeight: 500, color: C.gray400, textTransform: "uppercase" as const, letterSpacing: 1 }}>Free 24/7 Consultation</div>
              (614) 555-0347
            </div>
          </a>
        </div>
      </header>

      {/* ── Hero + Quiz ── */}
      <section
        id="law-quiz"
        style={{
          position: "relative",
          background: "url('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1920&q=80&fit=crop') center/cover no-repeat",
          minHeight: "92vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(11,29,58,0.92) 0%, rgba(19,46,91,0.88) 50%, rgba(28,69,135,0.82) 100%)" }} />
        <div style={{ position: "relative", zIndex: 2, display: "grid", gridTemplateColumns: "1fr 480px", gap: 60, alignItems: "center", padding: "80px 24px", maxWidth: 1200, margin: "0 auto", width: "100%" }}>

          {/* Hero Text */}
          <div style={{ color: C.white }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(192,57,43,0.2)", border: "1px solid rgba(192,57,43,0.4)", padding: "8px 18px", borderRadius: 50, fontSize: "0.8rem", fontWeight: 600, color: "#F5A6A0", marginBottom: 24, textTransform: "uppercase" as const, letterSpacing: 1 }}>
              <span className="law-pulse" />
              Limited time to file your claim
            </div>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(2.4rem, 5vw, 3.6rem)", marginBottom: 20, lineHeight: 1.1 }}>
              Injured? You Deserve{" "}
              <em style={{ fontStyle: "normal", color: C.gold }}>Justice & Compensation.</em>
            </h1>
            <p style={{ fontSize: "1.15rem", color: "rgba(255,255,255,0.75)", marginBottom: 32, maxWidth: 520, lineHeight: 1.8 }}>
              Our attorneys have recovered over $750 million for people just like you. Find out what your case is worth in under 60 seconds — completely free, completely confidential.
            </p>
            <div style={{ display: "flex", gap: 40, paddingTop: 32, borderTop: "1px solid rgba(255,255,255,0.12)" }}>
              {[["$750M+","Recovered"],["15,000+","Cases Won"],["98%","Success Rate"]].map(([num, lbl]) => (
                <div key={lbl}>
                  <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "2.2rem", color: C.gold }}>{num}</div>
                  <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" as const, letterSpacing: 1, marginTop: 2 }}>{lbl}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quiz Card */}
          <div style={{ background: C.white, borderRadius: 16, boxShadow: "0 12px 48px rgba(11,29,58,0.15)", overflow: "hidden" }}>
            {/* Quiz header */}
            <div style={{ background: C.navy, padding: "24px 32px", textAlign: "center", color: C.white }}>
              <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.4rem", marginBottom: 4 }}>Free Case Evaluation</h2>
              <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)" }}>Find out what your case is worth</p>
              <div style={{ height: 4, background: "rgba(255,255,255,0.1)", marginTop: 12 }}>
                <div style={{ height: "100%", background: C.gold, width: `${progressPct}%`, transition: "width 0.5s ease" }} />
              </div>
            </div>

            {/* Quiz body */}
            {quizDone ? (
              <div style={{ textAlign: "center", padding: "48px 32px" }}>
                <div style={{ width: 72, height: 72, background: "#27AE60", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                  <svg viewBox="0 0 24 24" style={{ width: 36, height: 36, stroke: "white", fill: "none", strokeWidth: 3 }}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.5rem", color: C.navy, marginBottom: 8 }}>We're Reviewing Your Case</h3>
                <p style={{ color: C.gray600, lineHeight: 1.7 }}>
                  A member of our legal team will contact you within <strong>15 minutes</strong> during business hours. If urgent, call us at{" "}
                  <a href="tel:6145550347" style={{ color: C.gold, fontWeight: 700, textDecoration: "none" }}>(614) 555-0347</a>.
                </p>
              </div>
            ) : (
              <div style={{ padding: 32, minHeight: 340, display: "flex", flexDirection: "column" }}>
                <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.2rem", color: C.navy, marginBottom: 4 }}>{STEP_TITLES[step - 1]}</h3>
                <p style={{ fontSize: "0.85rem", color: C.gray400, marginBottom: 16 }}>{STEP_HINTS[step - 1]}</p>

                {step < 4 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                    {STEP_OPTIONS[step - 1].map(opt => (
                      <button
                        key={opt.value}
                        className={`law-quiz-option${selected === opt.value ? " selected" : ""}`}
                        onClick={() => selectOption(opt.value)}
                      >
                        <span className="law-quiz-icon">{opt.icon}</span>
                        <span>{opt.label}</span>
                      </button>
                    ))}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: 20 }}>
                      {step > 1 ? (
                        <button
                          onClick={() => { setStep(s => s - 1); setSelected(null); }}
                          style={{ background: "none", border: "none", color: C.gray400, fontSize: "0.9rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}
                        >
                          ← Back
                        </button>
                      ) : <span />}
                      <button
                        onClick={() => { if (selected) { setStep(s => s + 1); setSelected(null); } }}
                        disabled={!selected}
                        style={{ padding: "14px 32px", background: selected ? C.gold : "#ddd", color: selected ? C.navy : "#999", border: "none", borderRadius: 50, fontFamily: "inherit", fontSize: "1rem", fontWeight: 700, cursor: selected ? "pointer" : "not-allowed", transition: "all 0.3s ease", boxShadow: selected ? "0 4px 20px rgba(201,168,76,0.3)" : "none" }}
                      >
                        Continue →
                      </button>
                    </div>
                  </div>
                ) : (
                  <form
                    onSubmit={e => { e.preventDefault(); setQuizDone(true); }}
                    style={{ display: "flex", flexDirection: "column", flex: 1 }}
                  >
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, flex: 1 }}>
                      <input className="law-quiz-input" type="text" placeholder="First Name *" required />
                      <input className="law-quiz-input" type="text" placeholder="Last Name *" required />
                      <input className="law-quiz-input" type="tel" placeholder="Phone Number *" required />
                      <input className="law-quiz-input" type="email" placeholder="Email Address *" required />
                      <textarea className="law-quiz-input" rows={3} placeholder="Briefly describe what happened (optional)" style={{ gridColumn: "span 2", resize: "vertical" }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 20, marginTop: "auto" }}>
                      <button
                        type="button"
                        onClick={() => { setStep(3); setSelected(null); }}
                        style={{ background: "none", border: "none", color: C.gray400, fontSize: "0.9rem", cursor: "pointer", fontFamily: "inherit" }}
                      >
                        ← Back
                      </button>
                      <button
                        type="submit"
                        style={{ padding: "14px 28px", background: C.gold, color: C.navy, border: "none", borderRadius: 50, fontFamily: "inherit", fontSize: "1rem", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 20px rgba(201,168,76,0.3)" }}
                      >
                        Get My Free Evaluation →
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Quiz trust */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "16px 32px", background: C.offWhite, fontSize: "0.75rem", color: C.gray400, flexWrap: "wrap" }}>
              🔒 256-bit encryption
              <span style={{ color: C.gray200 }}>|</span>
              🔒 Attorney-client privilege
              <span style={{ color: C.gray200 }}>|</span>
              100% confidential
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust Bar ── */}
      <div style={{ background: C.offWhite, borderTop: `1px solid ${C.gray200}`, borderBottom: `1px solid ${C.gray200}`, padding: "28px 24px" }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 48, flexWrap: "wrap", maxWidth: 1200, margin: "0 auto" }}>
          {[
            { bg: C.goldPale,             color: C.gold,    text: "No Fees Unless We Win" },
            { bg: "rgba(11,29,58,0.08)", color: C.navy,    text: "24/7 Free Consultations" },
            { bg: C.goldPale,             color: C.gold,    text: "$750M+ Recovered" },
            { bg: "rgba(11,29,58,0.08)", color: C.navy,    text: "50+ Attorneys Nationwide" },
          ].map(item => (
            <div key={item.text} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.9rem", fontWeight: 600, color: C.gray600 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: item.bg, color: item.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, fill: "none", stroke: item.color, strokeWidth: 2 }}>
                  <path d={starPath} />
                </svg>
              </div>
              {item.text}
            </div>
          ))}
        </div>
      </div>

      {/* ── Practice Areas ── */}
      <section id="law-practice-areas" style={{ padding: "100px 24px", background: C.white }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div style={{ display: "inline-block", fontSize: "0.7rem", fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase" as const, color: C.gold, marginBottom: 12 }}>Practice Areas</div>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(2rem, 4vw, 2.75rem)", color: C.navy, marginBottom: 16 }}>We Fight For You</h2>
            <p style={{ fontSize: "1.05rem", color: C.gray600, maxWidth: 560, margin: "0 auto", lineHeight: 1.8 }}>Our experienced attorneys handle a wide range of personal injury and accident cases. If you've been wronged, we can help.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
            {PRACTICE_AREAS.map(pa => (
              <div key={pa.title} className="law-pa-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={pa.img} alt={pa.title} />
                <div className="law-pa-overlay">
                  <h3 style={{ fontFamily: "'DM Serif Display', serif", color: C.white, fontSize: "1.2rem", marginBottom: 4 }}>{pa.title}</h3>
                  <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem" }}>{pa.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Results ── */}
      <section style={{ padding: "100px 24px", background: C.navy, color: C.white }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase" as const, color: C.gold, marginBottom: 12 }}>Proven Results</div>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(2rem, 4vw, 2.75rem)", color: C.white, marginBottom: 16 }}>We've Won Millions for Our Clients</h2>
            <p style={{ fontSize: "1.05rem", color: "rgba(255,255,255,0.5)", maxWidth: 560, margin: "0 auto", lineHeight: 1.8 }}>Every number represents a real person whose life we helped rebuild. Here are some of our notable case results.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
            {RESULTS.map(r => (
              <div key={r.amount} className="law-result-card">
                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "2.4rem", color: C.gold, marginBottom: 8 }}>{r.amount}</div>
                <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" as const, letterSpacing: 1, marginBottom: 8 }}>{r.type}</div>
                <div style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>{r.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section style={{ padding: "100px 24px", background: C.offWhite }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase" as const, color: C.gold, marginBottom: 12 }}>How It Works</div>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(2rem, 4vw, 2.75rem)", color: C.navy, marginBottom: 16 }}>Three Simple Steps to Justice</h2>
            <p style={{ fontSize: "1.05rem", color: C.gray600, maxWidth: 560, margin: "0 auto", lineHeight: 1.8 }}>Getting the compensation you deserve shouldn't be complicated. We make it easy.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32, position: "relative" }}>
            <div style={{ position: "absolute", top: 40, left: "16%", right: "16%", height: 2, background: C.gray200 }} />
            {[
              { num: "1", title: "Tell Us Your Story", desc: "Complete our 60-second case evaluation quiz or call us directly. It's free and confidential." },
              { num: "2", title: "We Build Your Case", desc: "Our legal team investigates, gathers evidence, and builds the strongest possible case on your behalf." },
              { num: "3", title: "You Get Paid",       desc: "We negotiate aggressively or go to trial. You pay nothing unless we win your case." },
            ].map(s => (
              <div key={s.num} style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
                <div style={{ width: 80, height: 80, background: C.white, border: `3px solid ${C.gold}`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Serif Display', serif", fontSize: "1.8rem", color: C.navy, margin: "0 auto 20px", boxShadow: "0 4px 24px rgba(11,29,58,0.08)" }}>
                  {s.num}
                </div>
                <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.2rem", color: C.navy, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: "0.9rem", color: C.gray600, lineHeight: 1.7, maxWidth: 280, margin: "0 auto" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="law-reviews" style={{ padding: "100px 24px", background: C.white }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase" as const, color: C.gold, marginBottom: 12 }}>Client Testimonials</div>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(2rem, 4vw, 2.75rem)", color: C.navy, marginBottom: 16 }}>Real Clients, Real Results</h2>
            <p style={{ fontSize: "1.05rem", color: C.gray600, maxWidth: 560, margin: "0 auto", lineHeight: 1.8 }}>Don't just take our word for it. Hear from people we've helped get the compensation they deserved.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="law-test-card">
                <Stars />
                <div style={{ display: "inline-block", background: "rgba(39,174,96,0.1)", color: "#1E8449", fontSize: "0.8rem", fontWeight: 700, padding: "4px 12px", borderRadius: 50, marginBottom: 16, textTransform: "uppercase" as const, letterSpacing: 0.5 }}>
                  {t.result}
                </div>
                <blockquote style={{ fontSize: "1rem", color: C.text, lineHeight: 1.8, marginBottom: 20, fontStyle: "italic" }}>
                  "{t.quote}"
                </blockquote>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: C.navy, display: "flex", alignItems: "center", justifyContent: "center", color: C.gold, fontWeight: 700, fontSize: "0.9rem", flexShrink: 0 }}>
                    {t.initials}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.95rem", color: C.text }}>{t.name}</div>
                    <div style={{ fontSize: "0.8rem", color: C.gray400 }}>{t.caseType}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section style={{ position: "relative", background: "url('https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1600&q=80&fit=crop') center/cover no-repeat", padding: "100px 24px", textAlign: "center", color: C.white }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(11,29,58,0.93), rgba(19,46,91,0.88))" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(2rem, 4vw, 3rem)", marginBottom: 16 }}>
            Your Case Evaluation is <em style={{ fontStyle: "normal", color: C.gold }}>100% Free.</em>
          </h2>
          <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.65)", maxWidth: 560, margin: "0 auto 36px", lineHeight: 1.8 }}>
            Every minute you wait could affect your case. Statutes of limitations apply. Get your free evaluation now — there's zero risk and zero obligation.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="law-btn-gold" onClick={() => scrollTo("quiz")}>
              Start Free Case Review →
            </button>
            <a href="tel:6145550347" className="law-btn-outline">
              Call (614) 555-0347
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: C.navy, color: "rgba(255,255,255,0.5)", padding: "60px 24px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 48 }}>
            <div>
              <h3 style={{ fontFamily: "'DM Serif Display', serif", color: C.white, fontSize: "1.4rem", marginBottom: 12 }}>Crestwood Legal Group</h3>
              <p style={{ fontSize: "0.9rem", lineHeight: 1.7 }}>Fighting for the rights of injured people since 2002. We've recovered over $750 million for our clients and we don't stop until justice is served.</p>
            </div>
            {[
              { heading: "Practice Areas", items: ["Auto Accidents","Medical Malpractice","Workplace Injuries","Slip & Fall"] },
              { heading: "Firm",           items: ["Client Reviews","Free Case Review","Our Attorneys","Office Locations"] },
              { heading: "Contact",        items: ["(614) 555-0347","200 Crestwood Blvd, Ste 400","Maplewood, OH 43050","Available 24/7"] },
            ].map(col => (
              <div key={col.heading}>
                <h4 style={{ color: C.white, fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 1.5, marginBottom: 16 }}>{col.heading}</h4>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {col.items.map(item => (
                    <li key={item} style={{ marginBottom: 10 }}>
                      <span className="law-footer-link" style={{ fontSize: "0.9rem", cursor: "pointer", color: "rgba(255,255,255,0.5)" }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem", flexWrap: "wrap", gap: 12 }}>
            <span>© 2026 Crestwood Legal Group. All rights reserved.</span>
            <span>Serving clients across Ohio</span>
          </div>
          <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.3)", lineHeight: 1.7, maxWidth: 600, marginTop: 20 }}>
            Disclaimer: This is a sample/demo website for a fictional law firm. The information on this site is not legal advice. Every case is different. Past results do not guarantee future outcomes. This site is for demonstration purposes only.
          </p>
        </div>
      </footer>
    </div>
  );
}
