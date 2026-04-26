"use client";

import { useState, useEffect, useRef } from "react";
import type { IndustryProfile } from "@/lib/industries";

// ── The Pearl Kitchen & Bar colour palette ────────────────────────────────────
const C = {
  black:      "#0A0A0A",
  dark:       "#111111",
  darkCard:   "#161616",
  darkBorder: "#2A2A2A",
  gold:       "#C9A96E",
  goldLight:  "#E0C992",
  goldDim:    "rgba(201,169,110,0.15)",
  white:      "#FFFFFF",
  offWhite:   "#F5F0EB",
  cream:      "#E8E0D4",
  textLight:  "#999999",
  textMid:    "#BBBBBB",
} as const;

type Tab = "starters" | "mains" | "platters" | "desserts";

const MENU: Record<Tab, { name: string; price: string; desc: string; tag?: string }[]> = {
  starters: [
    { name: "Pacific Oysters",       price: "$24", desc: "Half dozen, freshly shucked with champagne mignonette, lemon & Tabasco", tag: "Chef's Pick" },
    { name: "Lemon Pepper Calamari", price: "$19", desc: "Flash-fried with preserved lemon aioli and micro herbs" },
    { name: "Tuna Tartare",          price: "$22", desc: "Yellowfin tuna, avocado mousse, sesame, crispy wonton" },
    { name: "Gratinated Scallops",   price: "$26", desc: "King scallops with garlic herb butter, gruyère & panko crust", tag: "Popular" },
    { name: "Soft Shell Crab",       price: "$21", desc: "Tempura battered, yuzu kosho, pickled daikon slaw" },
    { name: "Smoked Salmon Plate",   price: "$20", desc: "House-cured with crème fraîche, capers, toasted brioche" },
  ],
  mains: [
    { name: "Pan-Seared Barramundi", price: "$42", desc: "Crispy skin, saffron risotto, beurre blanc, seasonal greens", tag: "Chef's Pick" },
    { name: "Lobster Linguine",      price: "$48", desc: "Half lobster, cherry tomato, chili, garlic, white wine & fresh herbs" },
    { name: "Grilled Tiger Prawns",  price: "$44", desc: "Char-grilled, chimichurri, roasted corn salsa, lime" },
    { name: "Spanish Seafood Paella",price: "$52", desc: "Prawns, mussels, calamari, saffron, sofrito — serves two", tag: "For Two" },
    { name: "Oven-Roasted Snapper",  price: "$39", desc: "Whole fish, fennel, olive tapenade, roasted potatoes" },
    { name: "Wagyu Ribeye",          price: "$56", desc: "300g, truffle mash, red wine jus, roasted bone marrow" },
  ],
  platters: [
    { name: "The Pearl Platter",     price: "$120", desc: "Oysters, prawns, lobster tail, Moreton Bay bugs, smoked salmon, crab — serves 2–3", tag: "Signature" },
    { name: "Cold Seafood Tower",    price: "$95",  desc: "Three tiers of oysters, prawns, crab, ceviche & accompaniments" },
    { name: "Hot Shellfish Platter", price: "$110", desc: "Grilled lobster, garlic prawns, scallops, mussels, crusty bread" },
    { name: "Sunset Tasting Board",  price: "$75",  desc: "Chef's selection of five courses paired with house wines — per person", tag: "Popular" },
  ],
  desserts: [
    { name: "Crème Brûlée",          price: "$16", desc: "Madagascar vanilla bean, caramelized sugar, fresh berries" },
    { name: "Chocolate Fondant",     price: "$18", desc: "Warm molten centre, salted caramel, vanilla bean ice cream", tag: "Chef's Pick" },
    { name: "Passionfruit Panna Cotta", price: "$15", desc: "Set coconut cream, tropical coulis, toasted meringue" },
    { name: "Cheese Selection",      price: "$22", desc: "Three artisan cheeses, honeycomb, fig paste, lavosh" },
  ],
};

const GALLERY_IMGS = [
  { src: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80&fit=crop",  alt: "Grilled lobster dish",        wide: true  },
  { src: "https://images.unsplash.com/photo-1482275548304-a58859dc31b7?w=600&q=80&fit=crop", alt: "Cocktail being prepared",    wide: false },
  { src: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=80&fit=crop",   alt: "Chef plating dish",          wide: false },
  { src: "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=800&q=80&fit=crop", alt: "Restaurant dining room",    wide: true  },
  { src: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80&fit=crop", alt: "Beautifully plated seafood", wide: false },
  { src: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=600&q=80&fit=crop", alt: "Waterfront dining view",    wide: false },
];

const TESTIMONIALS = [
  {
    quote: "The Pearl Platter was absolutely stunning — the oysters were briny perfection and the lobster tail melted in my mouth. The waterfront terrace at sunset made it feel like we were on vacation. Already booked our next visit.",
    initials: "AH", name: "A. Henderson", src: "Google Review",
  },
  {
    quote: "We celebrated our anniversary here and it was genuinely the best dining experience we've had in years. The chef came out and recommended the paella — absolutely unforgettable. Service was flawless, atmosphere was magical.",
    initials: "KM", name: "K. & M. Torres", src: "OpenTable Review",
  },
  {
    quote: "As a chef myself, I don't impress easily. The barramundi was cooked to textbook perfection — crispy skin, moist flesh, the beurre blanc was restrained and elegant. The Pearl is the real deal. Worth every dollar.",
    initials: "JL", name: "J. Larsson", src: "TripAdvisor Review",
  },
];

const starPath = "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";

const Stars = () => (
  <div style={{ display: "flex", gap: 3, marginBottom: 16 }}>
    {[0,1,2,3,4].map(i => (
      <svg key={i} viewBox="0 0 24 24" style={{ width: 14, height: 14, fill: C.gold }}>
        <path d={starPath} />
      </svg>
    ))}
  </div>
);

export default function RestaurantsShowcase({ industry }: { industry: IndustryProfile }) {
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("starters");
  const [resDone, setResDone] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(`rest-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  return (
    <div
      ref={containerRef}
      style={{ fontFamily: "'Montserrat', sans-serif", background: C.black, color: C.white, lineHeight: 1.6, WebkitFontSmoothing: "antialiased", overflowX: "hidden" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Montserrat:wght@300;400;500;600;700&display=swap');
        .rest-nav-link { font-size:0.7rem; font-weight:600; letter-spacing:2px; text-transform:uppercase; color:${C.textMid}; transition:color 0.4s ease; position:relative; text-decoration:none; cursor:pointer; background:none; border:none; font-family:inherit; }
        .rest-nav-link:hover { color:${C.gold}; }
        .rest-gallery-item { overflow:hidden; border-radius:4px; cursor:pointer; }
        .rest-gallery-item img { width:100%; height:100%; object-fit:cover; transition:transform 0.8s ease; }
        .rest-gallery-item:hover img { transform:scale(1.08); }
        .rest-test-card { background:${C.darkCard}; border:1px solid ${C.darkBorder}; border-radius:4px; padding:40px; transition:all 0.4s ease; }
        .rest-test-card:hover { border-color:${C.goldDim}; transform:translateY(-4px); }
        .rest-menu-tab { padding:12px 28px; font-family:'Montserrat',sans-serif; font-size:0.65rem; font-weight:600; letter-spacing:2px; text-transform:uppercase; background:transparent; border:1px solid ${C.darkBorder}; color:${C.textLight}; cursor:pointer; transition:all 0.4s ease; }
        .rest-menu-tab:hover { border-color:${C.gold}; color:${C.gold}; }
        .rest-menu-tab.active { background:${C.gold}; border-color:${C.gold}; color:${C.black}; }
        .rest-about-img { border-radius:4px; overflow:hidden; aspect-ratio:3/4; }
        .rest-about-img img { width:100%; height:100%; object-fit:cover; transition:transform 0.8s ease; }
        .rest-about-img:hover img { transform:scale(1.05); }
        .rest-btn-gold { display:inline-flex; align-items:center; gap:10px; font-family:'Montserrat',sans-serif; font-size:0.7rem; font-weight:700; letter-spacing:3px; text-transform:uppercase; padding:18px 40px; background:${C.gold}; color:${C.black}; border:none; cursor:pointer; transition:all 0.4s ease; text-decoration:none; }
        .rest-btn-gold:hover { background:${C.goldLight}; transform:translateY(-2px); box-shadow:0 6px 30px rgba(201,169,110,0.3); }
        .rest-btn-outline { display:inline-flex; align-items:center; gap:10px; font-family:'Montserrat',sans-serif; font-size:0.7rem; font-weight:700; letter-spacing:3px; text-transform:uppercase; padding:18px 40px; background:transparent; color:${C.gold}; border:1px solid ${C.gold}; cursor:pointer; transition:all 0.4s ease; text-decoration:none; }
        .rest-btn-outline:hover { background:${C.gold}; color:${C.black}; }
        .rest-res-input { width:100%; padding:14px 16px; background:${C.dark}; border:1px solid ${C.darkBorder}; border-radius:4px; color:${C.white}; font-family:'Montserrat',sans-serif; font-size:0.9rem; transition:border-color 0.4s ease; box-sizing:border-box; }
        .rest-res-input:focus { outline:none; border-color:${C.gold}; }
        .rest-footer-link { font-size:0.85rem; color:${C.textLight}; font-weight:300; transition:color 0.4s ease; text-decoration:none; cursor:pointer; }
        .rest-footer-link:hover { color:${C.gold}; }
        .rest-header-reserve { font-size:0.65rem; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:${C.gold}; border:1px solid ${C.gold}; padding:12px 28px; transition:all 0.4s ease; text-decoration:none; cursor:pointer; background:none; font-family:inherit; }
        .rest-header-reserve:hover { background:${C.gold}; color:${C.black}; }
        @keyframes rest-scroll-line { 0%{opacity:1;transform:scaleY(1);}50%{opacity:0.3;transform:scaleY(0.5);}100%{opacity:1;transform:scaleY(1);} }
        .rest-scroll-line { width:1px; height:50px; background:linear-gradient(to bottom, ${C.gold}, transparent); animation:rest-scroll-line 2s infinite; }
      `}</style>

      {/* ── Header ── */}
      <header
        id="rest-header"
        style={{
          position: "sticky",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: "0 40px",
          transition: "all 0.4s ease",
          background: scrolled ? "rgba(10,10,10,0.95)" : "transparent",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          borderBottom: scrolled ? `1px solid ${C.darkBorder}` : "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: scrolled ? "16px 0" : "24px 0", maxWidth: 1200, margin: "0 auto", transition: "padding 0.4s ease" }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", fontWeight: 600, letterSpacing: 2, color: C.white }}>
            The <em style={{ fontStyle: "normal", color: C.gold, fontWeight: 400 }}>Pearl</em>
          </div>
          <nav style={{ display: "flex", alignItems: "center", gap: 36 }}>
            {[["about","Our Story"],["menu","Menu"],["gallery","Gallery"],["reviews","Reviews"],["reservations","Contact"]].map(([id, label]) => (
              <button key={id} className="rest-nav-link" onClick={() => scrollTo(id)}>{label}</button>
            ))}
          </nav>
          <button className="rest-header-reserve" onClick={() => scrollTo("reservations")}>
            Reserve a Table
          </button>
        </div>
      </header>

      {/* ── Hero ── */}
      <section style={{ position: "relative", height: "100vh", minHeight: 700, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&q=85&fit=crop') center/cover no-repeat" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(10,10,10,0.5) 0%, rgba(10,10,10,0.3) 40%, rgba(10,10,10,0.6) 70%, rgba(10,10,10,0.95) 100%)" }} />
        <div style={{ position: "relative", zIndex: 2, textAlign: "center", maxWidth: 800, padding: "0 24px" }}>
          <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "0.65rem", fontWeight: 600, letterSpacing: 5, textTransform: "uppercase" as const, color: C.gold, marginBottom: 24 }}>
            Fine Seafood & Waterfront Dining
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(3rem, 7vw, 5.5rem)", fontWeight: 400, lineHeight: 1.05, marginBottom: 24 }}>
            Where the Ocean<br />Meets <em style={{ fontStyle: "italic", color: C.gold }}>the Table</em>
          </h1>
          <p style={{ fontSize: "1rem", fontWeight: 300, color: C.textMid, maxWidth: 500, margin: "0 auto 40px", lineHeight: 1.9 }}>
            An elevated dining experience featuring the freshest catches, handcrafted cocktails, and waterfront views that turn an evening into a memory.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="rest-btn-gold" onClick={() => scrollTo("reservations")}>Reserve Your Table</button>
            <button className="rest-btn-outline" onClick={() => scrollTo("menu")}>Explore the Menu</button>
          </div>
        </div>
        {/* Scroll indicator */}
        <div style={{ position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, color: C.textLight, fontSize: "0.6rem", letterSpacing: 3, textTransform: "uppercase" as const, zIndex: 2 }}>
          Scroll
          <div className="rest-scroll-line" />
        </div>
      </section>

      {/* ── About ── */}
      <section id="rest-about" style={{ padding: "120px 24px", background: C.dark }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="rest-about-img" style={{ marginTop: 40 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=80&fit=crop" alt="Chef preparing fresh seafood" />
              </div>
              <div className="rest-about-img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80&fit=crop" alt="Elegant restaurant interior" />
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: 4, textTransform: "uppercase" as const, color: C.gold, marginBottom: 16 }}>Our Story</div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.2rem, 5vw, 3.5rem)", fontWeight: 400, lineHeight: 1.15, marginBottom: 8 }}>
                Crafted with Passion,<br />Served with <span style={{ color: C.gold }}>Soul</span>
              </h2>
              <div style={{ width: 60, height: 1, background: C.gold, margin: "20px 0" }} />
              <p style={{ fontSize: "0.95rem", color: C.textLight, fontWeight: 300, lineHeight: 1.8, marginBottom: 16 }}>
                The Pearl Kitchen & Bar was born from a simple belief: that great seafood deserves more than a plate — it deserves an experience. Our chefs source daily from local fishermen and craft each dish to honor the ocean's bounty.
              </p>
              <p style={{ fontSize: "0.95rem", color: C.textLight, fontWeight: 300, lineHeight: 1.8 }}>
                Perched on the waterfront with sweeping views and an intimate dining room, we've become the destination for those who appreciate the finer things — without the pretension.
              </p>
              <div style={{ display: "flex", gap: 40, paddingTop: 32, borderTop: `1px solid ${C.darkBorder}`, marginTop: 32 }}>
                {[["12","Years Open"],["Daily","Fresh Sourced"],["4.8","Star Rating"]].map(([num, lbl]) => (
                  <div key={lbl}>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.5rem", fontWeight: 400, color: C.gold, lineHeight: 1 }}>{num}</div>
                    <div style={{ fontSize: "0.7rem", color: C.textLight, letterSpacing: 1, textTransform: "uppercase" as const, marginTop: 4 }}>{lbl}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Menu ── */}
      <section id="rest-menu" style={{ padding: "120px 24px", background: C.black }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 70 }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: 4, textTransform: "uppercase" as const, color: C.gold, marginBottom: 16 }}>The Menu</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.2rem, 5vw, 3.5rem)", fontWeight: 400, lineHeight: 1.15, marginBottom: 8 }}>
              A Taste of the <span style={{ color: C.gold }}>Sea</span>
            </h2>
            <div style={{ width: 60, height: 1, background: C.gold, margin: "20px auto" }} />
            <p style={{ fontSize: "0.95rem", color: C.textLight, fontWeight: 300, lineHeight: 1.8, maxWidth: 520, margin: "0 auto" }}>
              Each dish is thoughtfully prepared with the freshest seasonal ingredients. Our menu changes with the tides.
            </p>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 50, flexWrap: "wrap" }}>
            {(["starters","mains","platters","desserts"] as Tab[]).map(tab => (
              <button
                key={tab}
                className={`rest-menu-tab${activeTab === tab ? " active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Menu items */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px 80px" }}>
            {MENU[activeTab].map(item => (
              <div key={item.name} style={{ paddingBottom: 24, borderBottom: `1px solid ${C.darkBorder}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.35rem", fontWeight: 500, color: C.white }}>{item.name}</span>
                  <span style={{ flex: 1, borderBottom: `1px dotted ${C.darkBorder}`, margin: "0 12px 6px" }} />
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", color: C.gold, whiteSpace: "nowrap" as const, marginLeft: 16 }}>{item.price}</span>
                </div>
                <p style={{ fontSize: "0.82rem", color: C.textLight, fontWeight: 300, lineHeight: 1.6 }}>{item.desc}</p>
                {item.tag && (
                  <span style={{ display: "inline-block", fontSize: "0.6rem", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" as const, color: C.gold, border: `1px solid ${C.goldDim}`, padding: "3px 10px", borderRadius: 2, marginTop: 8 }}>
                    {item.tag}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 60 }}>
            <button className="rest-btn-outline" onClick={() => scrollTo("reservations")}>Reserve & Dine With Us</button>
          </div>
        </div>
      </section>

      {/* ── Full-Width Image Break ── */}
      <div style={{ position: "relative", height: 500, overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=1600&q=80&fit=crop"
          alt="Seafood platter close-up"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "rgba(10,10,10,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", color: C.white }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 400, marginBottom: 8 }}>
              Fresh. Every <em style={{ fontStyle: "italic", color: C.gold }}>Single</em> Day.
            </h2>
            <p style={{ fontSize: "0.9rem", color: C.textMid, fontWeight: 300 }}>Sourced from local fishermen each morning before sunrise.</p>
          </div>
        </div>
      </div>

      {/* ── Gallery ── */}
      <section id="rest-gallery" style={{ padding: "120px 24px", background: C.dark }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: 4, textTransform: "uppercase" as const, color: C.gold, marginBottom: 16 }}>Gallery</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.2rem, 5vw, 3.5rem)", fontWeight: 400, lineHeight: 1.15, marginBottom: 8 }}>
              A Feast for the <span style={{ color: C.gold }}>Eyes</span>
            </h2>
            <div style={{ width: 60, height: 1, background: C.gold, margin: "20px auto" }} />
            <p style={{ fontSize: "0.95rem", color: C.textLight, fontWeight: 300, lineHeight: 1.8, maxWidth: 520, margin: "0 auto" }}>
              The ambiance, the plates, the moments — take a look inside The Pearl.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gridTemplateRows: "280px 280px", gap: 12 }}>
            {GALLERY_IMGS.map((img) => (
              <div
                key={img.src}
                className="rest-gallery-item"
                style={{ gridColumn: img.wide ? "span 2" : "span 1" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.src} alt={img.alt} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="rest-reviews" style={{ padding: "120px 24px", background: C.black }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: 4, textTransform: "uppercase" as const, color: C.gold, marginBottom: 16 }}>Guest Reviews</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.2rem, 5vw, 3.5rem)", fontWeight: 400, lineHeight: 1.15, marginBottom: 8 }}>
              What Our Guests <span style={{ color: C.gold }}>Say</span>
            </h2>
            <div style={{ width: 60, height: 1, background: C.gold, margin: "20px auto" }} />
            <p style={{ fontSize: "0.95rem", color: C.textLight, fontWeight: 300, lineHeight: 1.8, maxWidth: 520, margin: "0 auto" }}>
              Don't take our word for it — hear from the people who dine with us.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 24 }}>
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="rest-test-card">
                <Stars />
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", fontStyle: "italic", color: C.cream, lineHeight: 1.8, marginBottom: 24, position: "relative" }}>
                  <span style={{ display: "block", fontFamily: "'Cormorant Garamond', serif", fontSize: "3rem", color: C.gold, lineHeight: 0.5, marginBottom: 16 }}>"</span>
                  {t.quote}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: C.goldDim, border: `1px solid ${C.gold}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", color: C.gold, fontWeight: 600, flexShrink: 0 }}>
                    {t.initials}
                  </div>
                  <div>
                    <div style={{ fontSize: "0.9rem", fontWeight: 600, color: C.white }}>{t.name}</div>
                    <div style={{ fontSize: "0.75rem", color: C.textLight }}>{t.src}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Reservations ── */}
      <section
        id="rest-reservations"
        style={{
          position: "relative",
          padding: "120px 24px",
          background: "url('https://images.unsplash.com/photo-1550966871-3ed3cdb51f3a?w=1600&q=80&fit=crop') center/cover no-repeat",
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: "rgba(10,10,10,0.88)" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
            {/* Info */}
            <div>
              <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: 4, textTransform: "uppercase" as const, color: C.gold, marginBottom: 16 }}>Reservations</div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.2rem, 5vw, 3.5rem)", fontWeight: 400, lineHeight: 1.15, marginBottom: 8 }}>
                Reserve Your <span style={{ color: C.gold }}>Table</span>
              </h2>
              <div style={{ width: 60, height: 1, background: C.gold, margin: "20px 0" }} />
              <p style={{ fontSize: "0.95rem", color: C.textLight, fontWeight: 300, lineHeight: 1.8, marginBottom: 32 }}>
                Join us for an unforgettable evening on the waterfront. Walk-ins welcome, but reservations are recommended — especially on weekends.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {[
                  { icon: "📍", label: "Location",  value: "88 Harborview Drive\nMaplewood, OH 43050" },
                  { icon: "🕐", label: "Hours",      value: "Tue – Thu: 5:00 PM – 10:00 PM\nFri – Sat: 5:00 PM – 11:00 PM\nSun: 12:00 PM – 9:00 PM\nMon: Closed" },
                  { icon: "📞", label: "Phone",      value: "(614) 555-0218" },
                ].map(item => (
                  <div key={item.label} style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                    <div style={{ width: 44, height: 44, border: `1px solid ${C.darkBorder}`, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "1.1rem" }}>
                      {item.icon}
                    </div>
                    <div>
                      <h4 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "0.7rem", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" as const, color: C.textLight, marginBottom: 4 }}>{item.label}</h4>
                      <p style={{ fontSize: "0.95rem", color: C.white, fontWeight: 400, whiteSpace: "pre-line" as const }}>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div style={{ background: C.darkCard, border: `1px solid ${C.darkBorder}`, borderRadius: 4, padding: 48 }}>
              {resDone ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <div style={{ fontSize: "2.5rem", marginBottom: 12, color: C.gold }}>✓</div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem", marginBottom: 8 }}>Reservation Requested</h3>
                  <p style={{ color: C.textLight, fontSize: "0.9rem", lineHeight: 1.7 }}>We'll confirm via text within the hour.<br />See you at The Pearl.</p>
                </div>
              ) : (
                <>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.8rem", textAlign: "center", marginBottom: 8 }}>Book a Table</h3>
                  <p style={{ textAlign: "center", fontSize: "0.8rem", color: C.textLight, marginBottom: 32 }}>We'll confirm your reservation within the hour.</p>
                  <form onSubmit={e => { e.preventDefault(); setResDone(true); }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <div style={{ marginBottom: 20 }}>
                        <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" as const, color: C.textLight, marginBottom: 8 }}>Full Name</label>
                        <input className="rest-res-input" type="text" placeholder="Jane Doe" required />
                      </div>
                      <div style={{ marginBottom: 20 }}>
                        <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" as const, color: C.textLight, marginBottom: 8 }}>Phone</label>
                        <input className="rest-res-input" type="tel" placeholder="(614) 555-0000" required />
                      </div>
                      <div style={{ marginBottom: 20 }}>
                        <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" as const, color: C.textLight, marginBottom: 8 }}>Date</label>
                        <input className="rest-res-input" type="date" required />
                      </div>
                      <div style={{ marginBottom: 20 }}>
                        <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" as const, color: C.textLight, marginBottom: 8 }}>Time</label>
                        <select className="rest-res-input" style={{ appearance: "auto" as const }}>
                          {["5:00 PM","5:30 PM","6:00 PM","6:30 PM","7:00 PM","7:30 PM","8:00 PM","8:30 PM","9:00 PM"].map(t => <option key={t} style={{ background: C.dark }}>{t}</option>)}
                        </select>
                      </div>
                      <div style={{ marginBottom: 20 }}>
                        <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" as const, color: C.textLight, marginBottom: 8 }}>Party Size</label>
                        <select className="rest-res-input" style={{ appearance: "auto" as const }}>
                          {["1 Guest","2 Guests","3 Guests","4 Guests","5 Guests","6 Guests","7+ Guests"].map(g => <option key={g} style={{ background: C.dark }}>{g}</option>)}
                        </select>
                      </div>
                      <div style={{ marginBottom: 20 }}>
                        <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" as const, color: C.textLight, marginBottom: 8 }}>Occasion</label>
                        <select className="rest-res-input" style={{ appearance: "auto" as const }}>
                          {["Just Dining","Birthday","Anniversary","Date Night","Business Dinner","Special Event"].map(o => <option key={o} style={{ background: C.dark }}>{o}</option>)}
                        </select>
                      </div>
                    </div>
                    <button type="submit" className="rest-btn-gold" style={{ width: "100%", justifyContent: "center", marginTop: 8 }}>
                      Request Reservation
                    </button>
                    <p style={{ textAlign: "center", fontSize: "0.75rem", color: C.textLight, marginTop: 16 }}>
                      For parties of 8+, please call us directly at{" "}
                      <a href="tel:6145550218" style={{ color: C.gold, textDecoration: "none" }}>(614) 555-0218</a>
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: C.dark, borderTop: `1px solid ${C.darkBorder}`, padding: "60px 24px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 48 }}>
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", fontWeight: 600, letterSpacing: 2, color: C.white, marginBottom: 16 }}>
                The <em style={{ fontStyle: "normal", color: C.gold, fontWeight: 400 }}>Pearl</em>
              </div>
              <p style={{ fontSize: "0.85rem", color: C.textLight, fontWeight: 300, lineHeight: 1.8 }}>
                Fine seafood and waterfront dining in the heart of Maplewood. An experience crafted for those who appreciate the art of a perfect meal.
              </p>
            </div>
            {[
              { heading: "Explore", links: ["Our Story","Menu","Gallery","Reviews"] },
              { heading: "Dining",  links: ["Reservations","Private Events","Gift Cards","Catering"] },
              { heading: "Contact", links: ["(614) 555-0218","88 Harborview Drive","Maplewood, OH 43050","info@thepearlkitchen.com"] },
            ].map(col => (
              <div key={col.heading}>
                <h4 style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" as const, color: C.gold, marginBottom: 20 }}>{col.heading}</h4>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {col.links.map(link => (
                    <li key={link} style={{ marginBottom: 12 }}>
                      <span className="rest-footer-link">{link}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ borderTop: `1px solid ${C.darkBorder}`, paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", color: C.textLight, flexWrap: "wrap", gap: 8 }}>
            <span>© 2026 The Pearl Kitchen & Bar. All rights reserved.</span>
            <span>This is a fictional demo website.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
