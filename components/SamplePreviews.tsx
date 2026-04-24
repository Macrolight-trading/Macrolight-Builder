import Link from "next/link";
import Section from "./Section";

// ── Per-site preview definitions ──────────────────────────────────────────────
// Each entry mirrors the visual identity of its Sample Sites HTML file.

const PREVIEWS = [
  // ── Greenfield Lawn Co. ──────────────────────────────────────────────────────
  {
    href: "/lawn-care",
    label: "Lawn Care",
    siteName: "Greenfield Lawn Co.",
    tagline: "Your Yard Deserves the Best Care.",
    url: "greenfield-lawn.com",
    badge: "⭐ 4.8  ·  124 Reviews",
    cta: "Get Your Free Estimate →",
    phoneCta: "(614) 555-0192",
    stats: [
      { num: "30+", lbl: "Years" },
      { num: "4.8★", lbl: "Rating" },
      { num: "2,500+", lbl: "Clients" },
    ],
    // hero gradient: deep greens from index-lawn.html
    heroBg: "url('https://images.unsplash.com/photo-1558904541-efa843a96f01?w=1200&q=70&fit=crop')",
    heroOverlay:
      "linear-gradient(135deg, rgba(26,58,10,0.90) 0%, rgba(45,80,22,0.84) 40%, rgba(61,100,32,0.80) 100%)",
    accentColor: "#6BA33E",
    accentDark: "#2D5016",
    navBg: "rgba(255,255,255,0.97)",
    navText: "#2D5016",
    fontFamily: "'Playfair Display', Georgia, serif",
    bodyFont: "'Inter', system-ui, sans-serif",
    ctaBg: "#4A7C23",
    ctaText: "#fff",
    theme: "light" as const,
    // trust chips shown below stats
    chips: ["Family-Owned", "Licensed & Insured", "Free Estimates"],
  },

  // ── Crestwood Legal Group ────────────────────────────────────────────────────
  {
    href: "/law-firms",
    label: "Law Firm",
    siteName: "Crestwood Legal Group",
    tagline: "You Deserve Justice. We Deliver It.",
    url: "crestwoodlegal.com",
    badge: "🔴 Free Case Evaluation — 60 sec",
    cta: "Start My Free Case Eval →",
    phoneCta: "(800) 555-0188",
    stats: [
      { num: "$750M+", lbl: "Recovered" },
      { num: "98%", lbl: "Win Rate" },
      { num: "14,000+", lbl: "Cases Won" },
    ],
    heroBg:
      "url('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&q=70&fit=crop')",
    heroOverlay:
      "linear-gradient(135deg, rgba(11,29,58,0.93) 0%, rgba(19,46,91,0.89) 50%, rgba(28,69,135,0.83) 100%)",
    accentColor: "#C9A84C",
    accentDark: "#0B1D3A",
    navBg: "#ffffff",
    navText: "#0B1D3A",
    fontFamily: "'DM Serif Display', Georgia, serif",
    bodyFont: "'DM Sans', system-ui, sans-serif",
    ctaBg: "#C9A84C",
    ctaText: "#0B1D3A",
    theme: "light" as const,
    chips: ["No Fee Unless We Win", "24/7 Availability", "Free Consultation"],
  },

  // ── The Pearl Kitchen & Bar ──────────────────────────────────────────────────
  {
    href: "/restaurants",
    label: "Restaurant",
    siteName: "The Pearl Kitchen & Bar",
    tagline: "An Elevated Seafood Experience.",
    url: "thepearlkitchen.com",
    badge: "WATERFRONT DINING",
    cta: "Reserve Your Table",
    phoneCta: "View Menu",
    stats: [
      { num: "Est.", lbl: "2009" },
      { num: "4.9★", lbl: "Dining" },
      { num: "Fri–Sat", lbl: "Live Music" },
    ],
    heroBg:
      "url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=70&fit=crop')",
    heroOverlay:
      "linear-gradient(to bottom, rgba(10,10,10,0.50) 0%, rgba(10,10,10,0.30) 40%, rgba(10,10,10,0.65) 70%, rgba(10,10,10,0.95) 100%)",
    accentColor: "#C9A96E",
    accentDark: "#111111",
    navBg: "transparent",
    navText: "#fff",
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    bodyFont: "'Montserrat', system-ui, sans-serif",
    ctaBg: "#C9A96E",
    ctaText: "#0A0A0A",
    theme: "dark" as const,
    chips: ["Waterfront Views", "Craft Cocktails", "Private Events"],
  },
] as const;

// ── Helper: small star row ─────────────────────────────────────────────────────
function Stars({ color }: { color: string }) {
  return (
    <span style={{ display: "inline-flex", gap: 1 }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          fill={color}
          style={{ width: 9, height: 9 }}
          aria-hidden
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.163c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118L10 14.347l-3.368 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.645 9.384c-.784-.57-.38-1.81.588-1.81h4.163a1 1 0 00.95-.69l1.286-3.957z" />
        </svg>
      ))}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SamplePreviews() {
  return (
    <Section
      id="sample-previews"
      padding="xl"
      className="border-t border-white/5"
    >
      {/* Section header */}
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-violet-300">
          Real examples
        </p>
        <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
          See what we build — for your industry.
        </h2>
        <p className="mt-4 text-lg text-white/60">
          Every site is purpose-built for its niche. Browse three live examples
          to see the design, copy, and conversion system in action.
        </p>
      </div>

      {/* Preview grid */}
      <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {PREVIEWS.map((site) => (
          <Link
            key={site.href}
            href={site.href}
            className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 rounded-2xl"
            aria-label={`View ${site.siteName} preview`}
          >
            {/* Card wrapper */}
            <div className="overflow-hidden rounded-2xl border border-zinc-700/60 bg-zinc-900/40 shadow-2xl shadow-black/40 ring-1 ring-white/[0.06] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-zinc-600/80 group-hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)]">

              {/* Browser chrome */}
              <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900 px-3 py-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" aria-hidden />
                <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" aria-hidden />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" aria-hidden />
                <div className="mx-auto min-w-0 max-w-[180px] flex-1 flex items-center justify-center gap-1 rounded border border-zinc-700/70 bg-zinc-950/70 px-2 py-1 text-[10px] text-zinc-500">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-2.5 w-2.5 shrink-0 text-zinc-600" aria-hidden>
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span className="truncate text-zinc-400">{site.url}</span>
                </div>
                <div className="w-6 shrink-0" aria-hidden />
              </div>

              {/* Mini site preview */}
              <div style={{ fontFamily: site.bodyFont, lineHeight: 1.5 }}>

                {/* Mini navbar */}
                <div
                  style={{
                    background: site.theme === "dark" ? "rgba(10,10,10,0.0)" : site.navBg,
                    borderBottom:
                      site.theme === "dark"
                        ? "none"
                        : "1px solid rgba(0,0,0,0.07)",
                    padding: "8px 14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    position: "relative",
                    zIndex: 2,
                    ...(site.theme === "dark" && {
                      position: "absolute" as const,
                      top: 38,
                      left: 0,
                      right: 0,
                    }),
                  }}
                >
                  <span
                    style={{
                      fontFamily: site.fontFamily,
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      color: site.theme === "dark" ? "#fff" : site.navText,
                      letterSpacing: site.theme === "dark" ? 1.5 : 0,
                    }}
                  >
                    {site.siteName}
                  </span>
                  <div style={{ display: "flex", gap: 10 }}>
                    {["Services", "About", "Contact"].map((l) => (
                      <span
                        key={l}
                        style={{
                          fontSize: "0.58rem",
                          color:
                            site.theme === "dark"
                              ? "rgba(255,255,255,0.55)"
                              : "rgba(0,0,0,0.45)",
                          fontWeight: 500,
                        }}
                      >
                        {l}
                      </span>
                    ))}
                  </div>
                  <span
                    style={{
                      fontSize: "0.58rem",
                      fontWeight: 700,
                      background: site.ctaBg,
                      color: site.ctaText,
                      padding: "4px 10px",
                      borderRadius: 50,
                    }}
                  >
                    {site.theme === "dark" ? "Reserve" : "Free Estimate"}
                  </span>
                </div>

                {/* Hero */}
                <div
                  style={{
                    position: "relative",
                    height: 230,
                    backgroundImage: site.heroBg,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    overflow: "hidden",
                    marginTop: site.theme === "dark" ? 0 : undefined,
                  }}
                >
                  {/* Gradient overlay */}
                  <div
                    aria-hidden
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: site.heroOverlay,
                    }}
                  />

                  {/* Hero content */}
                  <div
                    style={{
                      position: "relative",
                      zIndex: 1,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems:
                        site.theme === "dark" ? "center" : "flex-start",
                      justifyContent: "center",
                      padding:
                        site.theme === "dark" ? "50px 20px 20px" : "20px",
                      color: "#fff",
                      textAlign: site.theme === "dark" ? "center" : "left",
                    }}
                  >
                    {/* Badge */}
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        background: "rgba(255,255,255,0.12)",
                        border: "1px solid rgba(255,255,255,0.18)",
                        borderRadius: 50,
                        padding: "3px 10px",
                        fontSize: "0.55rem",
                        fontWeight: 600,
                        letterSpacing:
                          site.theme === "dark" ? 2 : 0.5,
                        textTransform:
                          site.theme === "dark" ? "uppercase" : undefined,
                        color: site.theme === "dark" ? site.accentColor : "#fff",
                        marginBottom: 8,
                      }}
                    >
                      {site.badge}
                    </div>

                    {/* Headline */}
                    <div
                      style={{
                        fontFamily: site.fontFamily,
                        fontSize: site.theme === "dark" ? "1.4rem" : "1.1rem",
                        fontWeight: site.theme === "dark" ? 400 : 700,
                        lineHeight: 1.15,
                        color: "#fff",
                        marginBottom: 8,
                        maxWidth: site.theme === "dark" ? 260 : 200,
                      }}
                    >
                      {site.tagline}
                      {site.theme === "dark" && (
                        <span style={{ color: site.accentColor }}> </span>
                      )}
                    </div>

                    {/* Sub / description hint */}
                    <p
                      style={{
                        fontSize: "0.6rem",
                        color: "rgba(255,255,255,0.65)",
                        marginBottom: 12,
                        maxWidth: 200,
                        lineHeight: 1.6,
                      }}
                    >
                      {site.theme === "dark"
                        ? "Fresh catches · Craft cocktails · Unforgettable evenings"
                        : site.label === "Law Firm"
                        ? "No fees unless we win · Free consultation · 24/7"
                        : "Family-owned since 1995 · Licensed & insured · Maplewood, OH"}
                    </p>

                    {/* CTA buttons */}
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <span
                        style={{
                          fontSize: "0.58rem",
                          fontWeight: 700,
                          background: site.ctaBg,
                          color: site.ctaText,
                          padding: "5px 12px",
                          borderRadius:
                            site.theme === "dark" ? 0 : 50,
                          letterSpacing:
                            site.theme === "dark" ? 1.5 : 0,
                          textTransform:
                            site.theme === "dark" ? "uppercase" : undefined,
                        }}
                      >
                        {site.cta}
                      </span>
                      <span
                        style={{
                          fontSize: "0.58rem",
                          fontWeight: 600,
                          background: "transparent",
                          color:
                            site.theme === "dark"
                              ? site.accentColor
                              : "rgba(255,255,255,0.85)",
                          padding: "5px 12px",
                          borderRadius:
                            site.theme === "dark" ? 0 : 50,
                          border:
                            site.theme === "dark"
                              ? `1px solid ${site.accentColor}`
                              : "1px solid rgba(255,255,255,0.45)",
                          letterSpacing:
                            site.theme === "dark" ? 1.5 : 0,
                          textTransform:
                            site.theme === "dark" ? "uppercase" : undefined,
                        }}
                      >
                        {site.phoneCta}
                      </span>
                    </div>

                    {/* Stats row */}
                    {site.theme !== "dark" && (
                      <div
                        style={{
                          display: "flex",
                          gap: 16,
                          marginTop: 14,
                          paddingTop: 10,
                          borderTop: "1px solid rgba(255,255,255,0.15)",
                          width: "100%",
                          maxWidth: 260,
                        }}
                      >
                        {site.stats.map((s) => (
                          <div key={s.lbl}>
                            <div
                              style={{
                                fontFamily: site.fontFamily,
                                fontSize: "0.9rem",
                                fontWeight: 700,
                                color:
                                  site.label === "Law Firm"
                                    ? site.accentColor
                                    : "#fff",
                                lineHeight: 1,
                              }}
                            >
                              {s.num}
                            </div>
                            <div
                              style={{
                                fontSize: "0.5rem",
                                color: "rgba(255,255,255,0.5)",
                                marginTop: 2,
                                textTransform: "uppercase",
                                letterSpacing: 0.5,
                              }}
                            >
                              {s.lbl}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Trust chips strip */}
                <div
                  style={{
                    background:
                      site.theme === "dark" ? "#111111" : "#f9fafb",
                    borderTop:
                      site.theme === "dark"
                        ? "1px solid #2a2a2a"
                        : "1px solid #e5e7eb",
                    padding: "8px 14px",
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  {site.chips.map((chip) => (
                    <span
                      key={chip}
                      style={{
                        fontSize: "0.52rem",
                        fontWeight: 600,
                        color:
                          site.theme === "dark"
                            ? site.accentColor
                            : site.accentDark,
                        background:
                          site.theme === "dark"
                            ? "rgba(201,169,110,0.1)"
                            : undefined,
                        border:
                          site.theme === "dark"
                            ? `1px solid rgba(201,169,110,0.2)`
                            : undefined,
                        padding:
                          site.theme === "dark" ? "2px 7px" : undefined,
                        borderRadius: 3,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        style={{ width: 8, height: 8, flexShrink: 0 }}
                        aria-hidden
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0l-3.5-3.5a1 1 0 111.4-1.4L8.5 12l6.8-6.7a1 1 0 011.4 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {chip}
                    </span>
                  ))}
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: "0.5rem",
                      color:
                        site.theme === "dark"
                          ? "rgba(255,255,255,0.3)"
                          : "rgba(0,0,0,0.3)",
                    }}
                  >
                    {site.label === "Lawn Care"
                      ? "Maplewood, OH"
                      : site.label === "Law Firm"
                      ? "Personal Injury · Family Law"
                      : "Waterfront · Fine Dining"}
                  </span>
                </div>
              </div>

              {/* Card footer: industry tag + CTA */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800">
                <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400">
                  <span
                    className="inline-block h-1.5 w-1.5 rounded-full"
                    style={{ background: site.accentColor }}
                    aria-hidden
                  />
                  {site.label}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-white/70 transition-colors group-hover:text-white">
                  View full preview
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Bottom note */}
      <p className="mt-8 text-center text-sm text-white/40">
        Each site is a scrollable, fully interactive preview &mdash; click any
        card to explore it end-to-end.
      </p>
    </Section>
  );
}
