/**
 * Industry preview components — compact mockups that read as actual
 * website previews when shown inside a browser-chrome frame in
 * LiveSamples.
 *
 * Modeled on the larger SamplePreviews slides in the original homepage
 * but scaled down to ~260px tall and stripped to the visual cues that
 * carry the industry: brand color, layout pattern, headline, CTA shape.
 *
 * All previews use inline styles for typography precision — Tailwind's
 * class strings would balloon and the values here are intentionally
 * non-design-token (we want them to look like actual third-party sites,
 * not Macrolight's own design system).
 */

import type { CSSProperties } from "react";

const baseFontStack: CSSProperties["fontFamily"] =
  "Inter, system-ui, -apple-system, Segoe UI, sans-serif";

/* ─────────────────────────────────────────────────────────────────── */
/*  Lawn Care — Greenfield Lawn Co.                                    */
/*  Photo + dark-green content panel split                             */
/* ─────────────────────────────────────────────────────────────────── */
export function LawnCarePreview() {
  return (
    <div style={{ fontFamily: baseFontStack, color: "#0a0a0a" }}>
      {/* Nav */}
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          padding: "7px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "0.6rem",
            fontWeight: 700,
            color: "#2D5016",
          }}
        >
          Greenfield Lawn Co.
        </span>
        <div style={{ display: "flex", gap: 10 }}>
          {["Services", "Gallery", "Contact"].map((l) => (
            <span
              key={l}
              style={{ fontSize: "0.48rem", color: "rgba(0,0,0,0.4)", fontWeight: 500 }}
            >
              {l}
            </span>
          ))}
        </div>
        <span
          style={{
            fontSize: "0.48rem",
            fontWeight: 700,
            background: "#4A7C23",
            color: "#fff",
            padding: "4px 10px",
            borderRadius: 50,
          }}
        >
          Free Estimate
        </span>
      </div>

      {/* Hero: split */}
      <div style={{ display: "flex", height: 220 }}>
        {/* Photo */}
        <div
          style={{
            flex: 1,
            backgroundImage:
              "url('https://images.unsplash.com/photo-1558904541-efa843a96f01?w=900&q=80&fit=crop')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              background: "rgba(45,80,22,0.85)",
              borderRadius: 50,
              padding: "3px 9px",
            }}
          >
            <span
              style={{
                fontSize: "0.42rem",
                color: "rgba(255,255,255,0.95)",
                fontWeight: 600,
                letterSpacing: 0.4,
              }}
            >
              Family-Owned · Est. 1995
            </span>
          </div>
        </div>

        {/* Content panel */}
        <div
          style={{
            width: "44%",
            background: "#1a3a0a",
            padding: "16px 14px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 9,
          }}
        >
          <div
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "0.95rem",
              fontWeight: 700,
              color: "#fff",
              lineHeight: 1.2,
            }}
          >
            Your Yard Deserves
            <br />
            the Best Care.
          </div>
          <div style={{ display: "flex", gap: 10, paddingTop: 6, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            {[
              ["30+", "Years"],
              ["2,500+", "Clients"],
              ["Free", "Estimates"],
            ].map(([n, l]) => (
              <div key={l}>
                <div
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: "#6BA33E",
                    lineHeight: 1,
                  }}
                >
                  {n}
                </div>
                <div
                  style={{
                    fontSize: "0.4rem",
                    color: "rgba(255,255,255,0.4)",
                    marginTop: 2,
                    textTransform: "uppercase",
                    letterSpacing: 0.4,
                  }}
                >
                  {l}
                </div>
              </div>
            ))}
          </div>
          <span
            style={{
              fontSize: "0.48rem",
              fontWeight: 700,
              background: "#4A7C23",
              color: "#fff",
              padding: "6px 11px",
              borderRadius: 50,
              alignSelf: "flex-start",
            }}
          >
            Get Free Estimate →
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  Law Firm — Crestwood Legal Group                                   */
/*  Dark navy prestige + big gold recovery number                      */
/* ─────────────────────────────────────────────────────────────────── */
export function LawFirmPreview() {
  return (
    <div style={{ fontFamily: baseFontStack }}>
      {/* Nav */}
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          padding: "7px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "0.6rem",
            fontWeight: 400,
            color: "#0B1D3A",
            letterSpacing: 0.3,
          }}
        >
          Crestwood Legal Group
        </span>
        <div style={{ display: "flex", gap: 10 }}>
          {["Practice", "Attorneys", "Results"].map((l) => (
            <span key={l} style={{ fontSize: "0.48rem", color: "rgba(0,0,0,0.4)" }}>
              {l}
            </span>
          ))}
        </div>
        <span
          style={{
            fontSize: "0.48rem",
            fontWeight: 700,
            background: "#C9A84C",
            color: "#0B1D3A",
            padding: "4px 10px",
          }}
        >
          Free Consult
        </span>
      </div>

      {/* Dark hero */}
      <div style={{ height: 220, background: "#0B1D3A", display: "flex" }}>
        {/* Big number */}
        <div
          style={{
            width: "42%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px 12px",
            borderRight: "1px solid rgba(201,168,76,0.15)",
          }}
        >
          <div
            style={{
              fontSize: "0.4rem",
              fontWeight: 600,
              color: "rgba(201,168,76,0.7)",
              letterSpacing: 2.5,
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            Total Recovered
          </div>
          <div
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: "2.2rem",
              fontWeight: 400,
              color: "#C9A84C",
              lineHeight: 1,
              letterSpacing: -1.5,
            }}
          >
            $750M
            <span style={{ fontSize: "1.3rem" }}>+</span>
          </div>
          <div
            style={{
              width: 24,
              height: 1,
              background: "rgba(201,168,76,0.35)",
              margin: "10px 0",
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 5, width: "100%" }}>
            {[
              ["98%", "Win Rate"],
              ["14,000+", "Cases"],
              ["30+", "Yrs Exp."],
            ].map(([n, l]) => (
              <div
                key={l}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <span style={{ fontSize: "0.45rem", color: "rgba(255,255,255,0.4)" }}>{l}</span>
                <span
                  style={{
                    fontFamily: "'DM Serif Display', Georgia, serif",
                    fontSize: "0.6rem",
                    color: "#C9A84C",
                  }}
                >
                  {n}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "16px 18px",
          }}
        >
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
            {["Super Lawyers®", "AV Preeminent®"].map((c) => (
              <span
                key={c}
                style={{
                  fontSize: "0.4rem",
                  fontWeight: 600,
                  color: "#C9A84C",
                  border: "1px solid rgba(201,168,76,0.35)",
                  padding: "2px 6px",
                }}
              >
                {c}
              </span>
            ))}
          </div>
          <div
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: "1rem",
              fontWeight: 400,
              color: "#fff",
              lineHeight: 1.25,
              marginBottom: 8,
            }}
          >
            You Deserve Justice.
            <br />
            We Deliver It.
          </div>
          <p
            style={{
              fontSize: "0.48rem",
              color: "rgba(255,255,255,0.5)",
              lineHeight: 1.6,
              margin: "0 0 12px",
            }}
          >
            No fee unless we win. Our trial attorneys have recovered three-quarters of a billion dollars for injured clients.
          </p>
          <span
            style={{
              fontSize: "0.48rem",
              fontWeight: 700,
              background: "#C9A84C",
              color: "#0B1D3A",
              padding: "6px 12px",
              letterSpacing: 0.3,
              alignSelf: "flex-start",
            }}
          >
            Start My Free Case Eval →
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  Restaurant — The Pearl                                             */
/*  Full-bleed editorial photo with reservation strip                  */
/* ─────────────────────────────────────────────────────────────────── */
export function RestaurantPreview() {
  return (
    <div style={{ fontFamily: "'Montserrat', system-ui, sans-serif", position: "relative" }}>
      {/* Floating nav */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          padding: "9px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "0.7rem",
            fontWeight: 400,
            color: "#fff",
            letterSpacing: 2,
          }}
        >
          THE PEARL
        </span>
        <div style={{ display: "flex", gap: 12 }}>
          {["Menu", "Reserve", "Events"].map((l) => (
            <span
              key={l}
              style={{
                fontSize: "0.45rem",
                color: "rgba(255,255,255,0.7)",
                fontWeight: 500,
                letterSpacing: 0.4,
              }}
            >
              {l}
            </span>
          ))}
        </div>
        <span
          style={{
            fontSize: "0.45rem",
            fontWeight: 700,
            color: "#C9A96E",
            padding: "3px 8px",
            border: "1px solid rgba(201,169,110,0.6)",
            letterSpacing: 1.2,
            textTransform: "uppercase",
          }}
        >
          Reserve
        </span>
      </div>

      <div style={{ height: 252, position: "relative", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&q=80&fit=crop')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(5,5,5,0.55) 0%, rgba(5,5,5,0.15) 40%, rgba(5,5,5,0.7) 75%, rgba(5,5,5,0.97) 100%)",
          }}
        />

        {/* Centered content */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            paddingBottom: 50,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "0.4rem",
              fontWeight: 600,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "#C9A96E",
              marginBottom: 9,
            }}
          >
            Waterfront Dining · Est. 2009
          </div>
          <div
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "1.5rem",
              fontWeight: 400,
              color: "#fff",
              lineHeight: 1.15,
              maxWidth: 280,
            }}
          >
            An Elevated Seafood Experience.
          </div>
          <div style={{ width: 28, height: 1, background: "rgba(201,169,110,0.5)", margin: "10px 0" }} />
          <div style={{ fontSize: "0.45rem", color: "rgba(255,255,255,0.5)" }}>
            ⭐⭐⭐⭐⭐ &nbsp;4.9 on Google &nbsp;·&nbsp; Live Music Fri &amp; Sat
          </div>
        </div>

        {/* Reservation bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            background: "rgba(8,8,8,0.94)",
            borderTop: "1px solid rgba(201,169,110,0.18)",
            padding: "8px 14px",
            display: "flex",
            gap: 5,
            alignItems: "center",
          }}
        >
          {[
            ["📅", "Tonight"],
            ["🕗", "8:00 PM"],
            ["👥", "2 Guests"],
          ].map(([icon, label]) => (
            <div
              key={String(label)}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 3,
                padding: "5px 8px",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span style={{ fontSize: "0.5rem" }}>{icon}</span>
              <span style={{ fontSize: "0.45rem", color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>
                {label}
              </span>
            </div>
          ))}
          <div
            style={{
              background: "#C9A96E",
              color: "#0A0A0A",
              fontSize: "0.48rem",
              fontWeight: 700,
              padding: "6px 13px",
              borderRadius: 2,
              whiteSpace: "nowrap",
              letterSpacing: 0.4,
            }}
          >
            Find a Table
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  HVAC — ArcticBreeze                                                */
/*  Blue/orange split with service checklist + photo                   */
/* ─────────────────────────────────────────────────────────────────── */
export function HvacPreview() {
  return (
    <div style={{ fontFamily: baseFontStack }}>
      {/* Nav */}
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          padding: "7px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: "0.6rem", fontWeight: 700, color: "#0f4f90" }}>
          ArcticBreeze HVAC
        </span>
        <div style={{ display: "flex", gap: 10 }}>
          {["Services", "Financing", "Reviews"].map((l) => (
            <span key={l} style={{ fontSize: "0.48rem", color: "rgba(0,0,0,0.4)" }}>
              {l}
            </span>
          ))}
        </div>
        <span
          style={{
            fontSize: "0.48rem",
            fontWeight: 700,
            background: "#e85d04",
            color: "#fff",
            padding: "4px 10px",
            borderRadius: 4,
          }}
        >
          Free Quote
        </span>
      </div>

      <div style={{ display: "flex", height: 220 }}>
        {/* Left content */}
        <div
          style={{
            width: "46%",
            background: "#0f4f90",
            padding: "14px 14px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignSelf: "flex-start",
              alignItems: "center",
              gap: 4,
              background: "#e85d04",
              borderRadius: 4,
              padding: "2px 7px",
            }}
          >
            <span style={{ fontSize: "0.5rem" }}>⚡</span>
            <span
              style={{
                fontSize: "0.4rem",
                fontWeight: 700,
                color: "#fff",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              24/7 Emergency
            </span>
          </div>
          <div
            style={{
              fontSize: "0.9rem",
              fontWeight: 700,
              color: "#fff",
              lineHeight: 1.2,
            }}
          >
            Stay Comfortable
            <br />
            Year-Round.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {["AC Install & Repair", "Furnace & Heating", "Maintenance Plans"].map((s) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span
                  style={{
                    display: "inline-block",
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "rgba(96,184,245,0.25)",
                    border: "1px solid rgba(96,184,245,0.45)",
                  }}
                />
                <span
                  style={{
                    fontSize: "0.45rem",
                    color: "rgba(255,255,255,0.85)",
                    fontWeight: 500,
                  }}
                >
                  {s}
                </span>
              </div>
            ))}
          </div>
          <span
            style={{
              fontSize: "0.48rem",
              fontWeight: 700,
              background: "#e85d04",
              color: "#fff",
              padding: "6px 11px",
              borderRadius: 4,
              alignSelf: "flex-start",
            }}
          >
            Get Free Quote →
          </span>
        </div>

        {/* Right photo + overlays */}
        <div
          style={{
            flex: 1,
            backgroundImage:
              "url('https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=900&q=80&fit=crop')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to right, #0f4f90 0%, transparent 25%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              background: "rgba(255,255,255,0.95)",
              borderRadius: 6,
              padding: "6px 10px",
              textAlign: "center",
              boxShadow: "0 3px 12px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ fontSize: "0.62rem", fontWeight: 800, color: "#0f4f90", lineHeight: 1 }}>
              4.9★
            </div>
            <div style={{ fontSize: "0.38rem", color: "#6b7280", marginTop: 1.5 }}>
              5,200+ Systems
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  Dentists — BrightSmile                                             */
/*  Photo banner + teal booking strip                                  */
/* ─────────────────────────────────────────────────────────────────── */
export function DentistPreview() {
  return (
    <div style={{ fontFamily: baseFontStack }}>
      {/* Nav */}
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          padding: "7px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: "0.6rem", fontWeight: 700, color: "#00574f" }}>
          BrightSmile Dental
        </span>
        <div style={{ display: "flex", gap: 10 }}>
          {["Services", "Insurance", "Patients"].map((l) => (
            <span key={l} style={{ fontSize: "0.48rem", color: "rgba(0,0,0,0.4)" }}>
              {l}
            </span>
          ))}
        </div>
        <span
          style={{
            fontSize: "0.48rem",
            fontWeight: 700,
            background: "#ff6b35",
            color: "#fff",
            padding: "4px 10px",
            borderRadius: 50,
          }}
        >
          Book Now
        </span>
      </div>

      <div style={{ height: 220, display: "flex", flexDirection: "column" }}>
        {/* Photo banner */}
        <div
          style={{
            flex: 1,
            backgroundImage:
              "url('https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=1400&q=80&fit=crop')",
            backgroundSize: "cover",
            backgroundPosition: "center top",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, rgba(0,87,79,0.45) 0%, rgba(0,87,79,0.15) 50%, rgba(0,87,79,0.7) 100%)",
            }}
          />

          <div
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              background: "#ff6b35",
              color: "#fff",
              fontSize: "0.45rem",
              fontWeight: 700,
              padding: "4px 9px",
              borderRadius: 4,
            }}
          >
            🦷 New Patient Special — $99
          </div>
          <div
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              background: "rgba(255,255,255,0.97)",
              borderRadius: 5,
              padding: "4px 8px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
            }}
          >
            <div style={{ fontSize: "0.5rem", fontWeight: 700, color: "#00574f" }}>⭐ 4.9</div>
            <div style={{ fontSize: "0.38rem", color: "#6b7280", marginTop: 1 }}>8,400+ Patients</div>
          </div>

          {/* Services chips strip */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: "rgba(0,87,79,0.85)",
              padding: "6px 14px",
              display: "flex",
              gap: 5,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {["General", "Cosmetic", "Invisalign", "Emergency"].map((s) => (
              <span
                key={s}
                style={{
                  fontSize: "0.4rem",
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.9)",
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  padding: "2px 6px",
                  borderRadius: 50,
                }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Booking strip */}
        <div
          style={{
            background: "#00574f",
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            gap: 9,
            flexShrink: 0,
          }}
        >
          <div>
            <div style={{ fontSize: "0.6rem", fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>
              A Healthier Smile.
            </div>
            <div style={{ fontSize: "0.4rem", color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
              Book online in 60 seconds
            </div>
          </div>
          <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
            {["9:00 AM", "11:30 AM"].map((t) => (
              <div
                key={t}
                style={{
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  borderRadius: 4,
                  padding: "3px 7px",
                  fontSize: "0.4rem",
                  color: "#fff",
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                }}
              >
                {t}
              </div>
            ))}
          </div>
          <div
            style={{
              background: "#ff6b35",
              color: "#fff",
              fontSize: "0.48rem",
              fontWeight: 700,
              padding: "6px 11px",
              borderRadius: 4,
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            Book →
          </div>
        </div>
      </div>
    </div>
  );
}
