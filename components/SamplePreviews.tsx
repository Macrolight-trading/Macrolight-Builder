"use client";

import Link from "next/link";
import Section from "./Section";
import { useState, useEffect, useCallback, useRef } from "react";

const SLIDE_INTERVAL = 5000;

/* ─── Slide metadata (browser chrome + footer only) ─────────────── */
const SLIDES = [
  { href: "/lawn-care",   label: "Lawn Care",   url: "greenfield-lawn.com",     siteName: "Greenfield Lawn Co.",    accentColor: "#6BA33E" },
  { href: "/law-firms",   label: "Law Firm",    url: "crestwoodlegal.com",       siteName: "Crestwood Legal Group",  accentColor: "#C9A84C" },
  { href: "/restaurants", label: "Restaurant",  url: "thepearlkitchen.com",      siteName: "The Pearl Kitchen & Bar",accentColor: "#C9A96E" },
  { href: "/hvac",        label: "HVAC",        url: "arcticbreezehhvac.com",    siteName: "ArcticBreeze HVAC",      accentColor: "#1a6fc4" },
  { href: "/dentists",    label: "Dentists",    url: "brightsmile-dental.com",   siteName: "BrightSmile Dental",     accentColor: "#00897b" },
] as const;


/* ═══════════════════════════════════════════════════════════════════
   HERO 1 — Lawn Care
   Layout: photo left / dark-green content panel right
   ═══════════════════════════════════════════════════════════════════ */
function LawnCareSlide() {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Navbar */}
      <div style={{ background: "rgba(255,255,255,0.97)", borderBottom: "1px solid rgba(0,0,0,0.07)", padding: "9px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "0.72rem", fontWeight: 700, color: "#2D5016" }}>Greenfield Lawn Co.</span>
        <div style={{ display: "flex", gap: 14 }}>
          {["Services", "Gallery", "Contact"].map(l => <span key={l} style={{ fontSize: "0.58rem", color: "rgba(0,0,0,0.4)", fontWeight: 500 }}>{l}</span>)}
        </div>
        <span style={{ fontSize: "0.58rem", fontWeight: 700, background: "#4A7C23", color: "#fff", padding: "5px 12px", borderRadius: 50 }}>Free Estimate</span>
      </div>

      {/* Hero: split */}
      <div style={{ display: "flex", height: 300 }}>
        {/* Left: photo */}
        <div style={{ flex: 1, backgroundImage: "url('https://images.unsplash.com/photo-1558904541-efa843a96f01?w=900&q=80&fit=crop')", backgroundSize: "cover", backgroundPosition: "center", position: "relative" }}>
          {/* Rating card */}
          <div style={{ position: "absolute", bottom: 14, left: 14, background: "rgba(255,255,255,0.97)", borderRadius: 8, padding: "7px 12px", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}>
            <span style={{ fontSize: "1rem", lineHeight: 1 }}>⭐</span>
            <div>
              <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#1a3a0a", lineHeight: 1 }}>4.8 / 5.0</div>
              <div style={{ fontSize: "0.5rem", color: "#6b7280", marginTop: 2 }}>124 Google Reviews</div>
            </div>
          </div>
          {/* "Est. 1995" stamp */}
          <div style={{ position: "absolute", top: 14, left: 14, background: "rgba(45,80,22,0.85)", borderRadius: 50, padding: "4px 12px" }}>
            <span style={{ fontSize: "0.52rem", color: "rgba(255,255,255,0.9)", fontWeight: 600, letterSpacing: 0.5 }}>Family-Owned · Est. 1995</span>
          </div>
        </div>

        {/* Right: content */}
        <div style={{ width: "42%", background: "#1a3a0a", padding: "22px 20px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 12 }}>
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.15rem", fontWeight: 700, color: "#fff", lineHeight: 1.25 }}>
            Your Yard Deserves<br />the Best Care.
          </div>
          <p style={{ fontSize: "0.58rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.75, margin: 0 }}>
            Maplewood's most-trusted lawn &amp; landscape crew for 30+ years. Mowing, cleanups, mulching, full installs.
          </p>
          {/* Stats */}
          <div style={{ display: "flex", gap: 16, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            {[["30+", "Years"], ["2,500+", "Clients"], ["Free", "Estimates"]].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "0.9rem", fontWeight: 700, color: "#6BA33E", lineHeight: 1 }}>{n}</div>
                <div style={{ fontSize: "0.47rem", color: "rgba(255,255,255,0.35)", marginTop: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>{l}</div>
              </div>
            ))}
          </div>
          {/* CTAs */}
          <div style={{ display: "flex", gap: 7 }}>
            <span style={{ fontSize: "0.58rem", fontWeight: 700, background: "#4A7C23", color: "#fff", padding: "7px 13px", borderRadius: 50 }}>Get Free Estimate →</span>
            <span style={{ fontSize: "0.58rem", fontWeight: 500, color: "rgba(255,255,255,0.6)", padding: "7px 11px", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 50 }}>(614) 555-0192</span>
          </div>
        </div>
      </div>

      {/* Trust chips */}
      <div style={{ background: "#f9fafb", borderTop: "1px solid #e5e7eb", padding: "9px 18px", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        {["Family-Owned", "Licensed & Insured", "Free Estimates"].map(chip => (
          <span key={chip} style={{ fontSize: "0.52rem", fontWeight: 600, color: "#2D5016", display: "inline-flex", alignItems: "center", gap: 4 }}>
            <svg viewBox="0 0 12 12" fill="none" style={{ width: 8, height: 8 }} aria-hidden><path d="M2 6l3 3 5-5" stroke="#6BA33E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            {chip}
          </span>
        ))}
        <span style={{ marginLeft: "auto", fontSize: "0.5rem", color: "rgba(0,0,0,0.28)" }}>Maplewood, OH</span>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════
   HERO 2 — Law Firm
   Layout: dark navy full-bleed, centered prestige typography + big recovery number
   ═══════════════════════════════════════════════════════════════════ */
function LawFirmSlide() {
  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      {/* Navbar */}
      <div style={{ background: "#fff", borderBottom: "1px solid rgba(0,0,0,0.07)", padding: "9px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "0.72rem", fontWeight: 400, color: "#0B1D3A", letterSpacing: 0.3 }}>Crestwood Legal Group</span>
        <div style={{ display: "flex", gap: 14 }}>
          {["Practice Areas", "Attorneys", "Results"].map(l => <span key={l} style={{ fontSize: "0.58rem", color: "rgba(0,0,0,0.4)" }}>{l}</span>)}
        </div>
        <span style={{ fontSize: "0.58rem", fontWeight: 700, background: "#C9A84C", color: "#0B1D3A", padding: "5px 12px" }}>Free Consultation</span>
      </div>

      {/* Hero: dark prestige */}
      <div style={{ height: 300, background: "#0B1D3A", display: "flex", position: "relative", overflow: "hidden" }}>
        {/* Faint background texture */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "url('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&q=30&fit=crop')", backgroundSize: "cover", backgroundPosition: "center", opacity: 0.07 }} />

        {/* Left: big number */}
        <div style={{ width: "40%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 20px", borderRight: "1px solid rgba(201,168,76,0.15)", position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: "0.48rem", fontWeight: 600, color: "rgba(201,168,76,0.7)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>Total Recovered</div>
          <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "3rem", fontWeight: 400, color: "#C9A84C", lineHeight: 1, letterSpacing: -2 }}>$750M<span style={{ fontSize: "1.8rem" }}>+</span></div>
          <div style={{ width: 32, height: 1, background: "rgba(201,168,76,0.35)", margin: "14px 0" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 7, width: "100%" }}>
            {[["98%", "Win Rate"], ["14,000+", "Cases Won"], ["30+", "Years Exp."]].map(([n, l]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: "0.55rem", color: "rgba(255,255,255,0.4)", letterSpacing: 0.3 }}>{l}</span>
                <span style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "0.75rem", fontWeight: 400, color: "#C9A84C" }}>{n}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "24px 28px", position: "relative", zIndex: 1 }}>
          {/* Credential chips */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
            {["Super Lawyers® Rated", "AV Preeminent®", "BBB A+"].map(c => (
              <span key={c} style={{ fontSize: "0.47rem", fontWeight: 600, color: "#C9A84C", border: "1px solid rgba(201,168,76,0.35)", padding: "3px 8px", letterSpacing: 0.3 }}>{c}</span>
            ))}
          </div>
          <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "1.3rem", fontWeight: 400, color: "#fff", lineHeight: 1.25, marginBottom: 10, maxWidth: 260 }}>
            You Deserve Justice.<br />We Deliver It.
          </div>
          <p style={{ fontSize: "0.57rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.75, margin: "0 0 18px", maxWidth: 260 }}>
            No fee unless we win. Our trial attorneys have recovered over three-quarters of a billion dollars for injured clients across the state.
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <span style={{ fontSize: "0.58rem", fontWeight: 700, background: "#C9A84C", color: "#0B1D3A", padding: "8px 16px", letterSpacing: 0.3 }}>Start My Free Case Eval →</span>
            <span style={{ fontSize: "0.58rem", fontWeight: 500, color: "rgba(255,255,255,0.55)", padding: "8px 12px", border: "1px solid rgba(255,255,255,0.15)" }}>(800) 555-0188</span>
          </div>
        </div>
      </div>

      {/* Trust chips */}
      <div style={{ background: "#0d2040", borderTop: "1px solid rgba(201,168,76,0.15)", padding: "9px 18px", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        {["No Fee Unless We Win", "24/7 Availability", "Free Consultation"].map(chip => (
          <span key={chip} style={{ fontSize: "0.52rem", fontWeight: 600, color: "#C9A84C", display: "inline-flex", alignItems: "center", gap: 4 }}>
            <svg viewBox="0 0 12 12" fill="none" style={{ width: 8, height: 8 }} aria-hidden><path d="M2 6l3 3 5-5" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            {chip}
          </span>
        ))}
        <span style={{ marginLeft: "auto", fontSize: "0.5rem", color: "rgba(255,255,255,0.2)" }}>Personal Injury · Family Law</span>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════
   HERO 3 — Restaurant
   Layout: full-bleed editorial photo, bottom-anchored reservation bar
   ═══════════════════════════════════════════════════════════════════ */
function RestaurantSlide() {
  return (
    <div style={{ fontFamily: "'Montserrat', system-ui, sans-serif", position: "relative" }}>
      {/* Navbar: transparent, overlaid on photo */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10, padding: "11px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "0.82rem", fontWeight: 400, color: "#fff", letterSpacing: 2 }}>THE PEARL</span>
        <div style={{ display: "flex", gap: 16 }}>
          {["Menu", "Reservations", "Events"].map(l => <span key={l} style={{ fontSize: "0.55rem", color: "rgba(255,255,255,0.65)", fontWeight: 500, letterSpacing: 0.5 }}>{l}</span>)}
        </div>
        <span style={{ fontSize: "0.55rem", fontWeight: 700, background: "transparent", color: "#C9A96E", padding: "5px 12px", border: "1px solid rgba(201,169,110,0.6)", letterSpacing: 1.5, textTransform: "uppercase" }}>Reserve</span>
      </div>

      {/* Full-bleed hero */}
      <div style={{ height: 300, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&q=80&fit=crop')", backgroundSize: "cover", backgroundPosition: "center" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(5,5,5,0.55) 0%, rgba(5,5,5,0.15) 40%, rgba(5,5,5,0.65) 70%, rgba(5,5,5,0.97) 100%)" }} />

        {/* Centered content */}
        <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingBottom: 60, textAlign: "center" }}>
          <div style={{ fontSize: "0.48rem", fontWeight: 600, letterSpacing: 5, textTransform: "uppercase", color: "#C9A96E", marginBottom: 12 }}>Waterfront Dining · Est. 2009</div>
          <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "2rem", fontWeight: 400, color: "#fff", lineHeight: 1.15, maxWidth: 360 }}>
            An Elevated Seafood Experience.
          </div>
          <div style={{ width: 36, height: 1, background: "rgba(201,169,110,0.5)", margin: "14px 0" }} />
          <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
            <span style={{ fontSize: "0.55rem", color: "rgba(255,255,255,0.5)" }}>⭐⭐⭐⭐⭐ &nbsp;4.9 on Google</span>
            <div style={{ width: 1, height: 10, background: "rgba(255,255,255,0.2)" }} />
            <span style={{ fontSize: "0.55rem", color: "rgba(255,255,255,0.5)" }}>Fri &amp; Sat Live Music</span>
            <div style={{ width: 1, height: 10, background: "rgba(255,255,255,0.2)" }} />
            <span style={{ fontSize: "0.55rem", color: "rgba(255,255,255,0.5)" }}>Private Events</span>
          </div>
        </div>

        {/* Reservation bar */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(8,8,8,0.94)", backdropFilter: "blur(10px)", borderTop: "1px solid rgba(201,169,110,0.18)", padding: "10px 18px", display: "flex", gap: 7, alignItems: "center" }}>
          {[["📅", "Tonight"], ["🕗", "8:00 PM"], ["👥", "2 Guests"]].map(([icon, label]) => (
            <div key={String(label)} style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 3, padding: "6px 10px", display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ fontSize: "0.6rem" }}>{icon}</span>
              <span style={{ fontSize: "0.55rem", color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>{label}</span>
              <svg viewBox="0 0 12 12" fill="none" style={{ width: 8, height: 8, marginLeft: "auto" }} aria-hidden><path d="M3 4.5l3 3 3-3" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" strokeLinecap="round"/></svg>
            </div>
          ))}
          <div style={{ background: "#C9A96E", color: "#0A0A0A", fontSize: "0.58rem", fontWeight: 700, padding: "7px 16px", borderRadius: 2, whiteSpace: "nowrap", letterSpacing: 0.5 }}>
            Find a Table
          </div>
        </div>
      </div>

      {/* Trust chips */}
      <div style={{ background: "#0d0d0d", borderTop: "1px solid #222", padding: "9px 18px", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        {["Waterfront Views", "Craft Cocktails", "Private Events"].map(chip => (
          <span key={chip} style={{ fontSize: "0.52rem", fontWeight: 600, color: "#C9A96E", border: "1px solid rgba(201,169,110,0.2)", padding: "2px 8px", borderRadius: 2, display: "inline-flex", alignItems: "center", gap: 4 }}>
            <svg viewBox="0 0 12 12" fill="none" style={{ width: 8, height: 8 }} aria-hidden><path d="M2 6l3 3 5-5" stroke="#C9A96E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            {chip}
          </span>
        ))}
        <span style={{ marginLeft: "auto", fontSize: "0.5rem", color: "rgba(255,255,255,0.2)" }}>Waterfront · Fine Dining</span>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════
   HERO 4 — HVAC
   Layout: navy content panel left / photo right with service grid
   ═══════════════════════════════════════════════════════════════════ */
function HVACSlide() {
  return (
    <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif" }}>
      {/* Navbar */}
      <div style={{ background: "rgba(255,255,255,0.97)", borderBottom: "1px solid rgba(0,0,0,0.07)", padding: "9px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#0f4f90" }}>ArcticBreeze HVAC</span>
        <div style={{ display: "flex", gap: 14 }}>
          {["Services", "Financing", "Reviews"].map(l => <span key={l} style={{ fontSize: "0.58rem", color: "rgba(0,0,0,0.4)" }}>{l}</span>)}
        </div>
        <span style={{ fontSize: "0.58rem", fontWeight: 700, background: "#e85d04", color: "#fff", padding: "5px 12px", borderRadius: 4 }}>Free Quote</span>
      </div>

      {/* Hero: two-column */}
      <div style={{ display: "flex", height: 300 }}>
        {/* Left: content panel */}
        <div style={{ width: "44%", background: "#0f4f90", padding: "22px 20px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 11 }}>
          {/* Emergency badge */}
          <div style={{ display: "inline-flex", alignSelf: "flex-start", alignItems: "center", gap: 5, background: "#e85d04", borderRadius: 4, padding: "3px 9px" }}>
            <span style={{ fontSize: "0.62rem" }}>⚡</span>
            <span style={{ fontSize: "0.5rem", fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: 0.5 }}>24/7 Emergency Service</span>
          </div>
          {/* Tagline */}
          <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>
            Stay Comfortable<br />Year-Round.
          </div>
          {/* Service list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {["AC Installation & Repair", "Furnace & Heating", "Annual Maintenance Plans", "Indoor Air Quality"].map(s => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <svg viewBox="0 0 12 12" fill="none" style={{ width: 11, height: 11, flexShrink: 0 }} aria-hidden>
                  <circle cx="6" cy="6" r="5.5" fill="rgba(66,165,245,0.15)" stroke="rgba(66,165,245,0.4)"/>
                  <path d="M3.5 6l1.8 1.8L8.5 4" stroke="#60b8f5" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{ fontSize: "0.57rem", color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>{s}</span>
              </div>
            ))}
          </div>
          {/* CTAs */}
          <div style={{ display: "flex", gap: 6 }}>
            <span style={{ fontSize: "0.58rem", fontWeight: 700, background: "#e85d04", color: "#fff", padding: "7px 13px", borderRadius: 4 }}>Get Free Quote →</span>
            <span style={{ fontSize: "0.58rem", fontWeight: 500, color: "rgba(255,255,255,0.6)", padding: "7px 11px", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 4 }}>Call Now</span>
          </div>
        </div>

        {/* Right: photo + overlays */}
        <div style={{ flex: 1, backgroundImage: "url('https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=900&q=80&fit=crop')", backgroundSize: "cover", backgroundPosition: "center", position: "relative" }}>
          {/* Gradient blend */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, #0f4f90 0%, transparent 25%)" }} />
          {/* Rating card */}
          <div style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,255,255,0.95)", borderRadius: 8, padding: "8px 12px", textAlign: "center", boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#0f4f90", lineHeight: 1 }}>4.9★</div>
            <div style={{ fontSize: "0.47rem", color: "#6b7280", marginTop: 2 }}>5,200+ Systems</div>
          </div>
          {/* Service area badge */}
          <div style={{ position: "absolute", bottom: 14, right: 14, background: "rgba(15,79,144,0.92)", borderRadius: 50, padding: "5px 13px" }}>
            <span style={{ fontSize: "0.52rem", color: "#fff", fontWeight: 500 }}>📍 Serving Metro Area</span>
          </div>
          {/* Financing tag */}
          <div style={{ position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.75)", borderRadius: 50, padding: "4px 12px", whiteSpace: "nowrap" }}>
            <span style={{ fontSize: "0.5rem", color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>0% financing available</span>
          </div>
        </div>
      </div>

      {/* Trust chips */}
      <div style={{ background: "#f9fafb", borderTop: "1px solid #e5e7eb", padding: "9px 18px", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        {["Licensed & Insured", "All Brands Serviced", "No Hidden Fees"].map(chip => (
          <span key={chip} style={{ fontSize: "0.52rem", fontWeight: 600, color: "#0f4f90", display: "inline-flex", alignItems: "center", gap: 4 }}>
            <svg viewBox="0 0 12 12" fill="none" style={{ width: 8, height: 8 }} aria-hidden><path d="M2 6l3 3 5-5" stroke="#1a6fc4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            {chip}
          </span>
        ))}
        <span style={{ marginLeft: "auto", fontSize: "0.5rem", color: "rgba(0,0,0,0.28)" }}>Heating · Cooling · Air Quality</span>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════
   HERO 5 — Dentists
   Layout: photo banner top / teal booking strip bottom
   ═══════════════════════════════════════════════════════════════════ */
function DentistsSlide() {
  return (
    <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif" }}>
      {/* Navbar */}
      <div style={{ background: "rgba(255,255,255,0.97)", borderBottom: "1px solid rgba(0,0,0,0.07)", padding: "9px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#00574f" }}>BrightSmile Dental</span>
        <div style={{ display: "flex", gap: 14 }}>
          {["Services", "Insurance", "New Patients"].map(l => <span key={l} style={{ fontSize: "0.58rem", color: "rgba(0,0,0,0.4)" }}>{l}</span>)}
        </div>
        <span style={{ fontSize: "0.58rem", fontWeight: 700, background: "#ff6b35", color: "#fff", padding: "5px 12px", borderRadius: 50 }}>Book Now</span>
      </div>

      {/* Hero: photo top + booking strip bottom */}
      <div style={{ height: 300, display: "flex", flexDirection: "column" }}>
        {/* Top: photo */}
        <div style={{ flex: 1, backgroundImage: "url('https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=1400&q=80&fit=crop')", backgroundSize: "cover", backgroundPosition: "center top", position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,87,79,0.45) 0%, rgba(0,87,79,0.15) 50%, rgba(0,87,79,0.7) 100%)" }} />

          {/* Offer badge — top right */}
          <div style={{ position: "absolute", top: 14, right: 14, background: "#ff6b35", color: "#fff", fontSize: "0.52rem", fontWeight: 700, padding: "5px 11px", borderRadius: 4 }}>
            🦷 New Patient Special — $99
          </div>
          {/* Rating — top left */}
          <div style={{ position: "absolute", top: 14, left: 14, background: "rgba(255,255,255,0.97)", borderRadius: 6, padding: "5px 10px", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>
            <div style={{ fontSize: "0.6rem", fontWeight: 700, color: "#00574f" }}>⭐ 4.9</div>
            <div style={{ fontSize: "0.47rem", color: "#6b7280", marginTop: 1 }}>8,400+ Patients</div>
          </div>

          {/* Services strip over photo */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,87,79,0.85)", backdropFilter: "blur(4px)", padding: "8px 18px", display: "flex", gap: 6, justifyContent: "center" }}>
            {["General Care", "Cosmetic", "Invisalign", "Implants", "Emergency"].map(s => (
              <span key={s} style={{ fontSize: "0.5rem", fontWeight: 600, color: "rgba(255,255,255,0.9)", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", padding: "3px 8px", borderRadius: 50 }}>{s}</span>
            ))}
          </div>
        </div>

        {/* Bottom: booking widget */}
        <div style={{ background: "#00574f", padding: "13px 18px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <div style={{ flex: "0 0 auto" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>A Healthier Smile Starts Here.</div>
            <div style={{ fontSize: "0.5rem", color: "rgba(255,255,255,0.5)", marginTop: 3 }}>Book online in 60 seconds · No paperwork</div>
          </div>
          {/* Time slot pills */}
          <div style={{ display: "flex", gap: 5, marginLeft: "auto" }}>
            {["9:00 AM", "11:30 AM", "2:00 PM"].map(t => (
              <div key={t} style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 4, padding: "4px 8px", fontSize: "0.5rem", color: "#fff", fontWeight: 500, textAlign: "center", whiteSpace: "nowrap" }}>
                {t}
              </div>
            ))}
          </div>
          <div style={{ background: "#ff6b35", color: "#fff", fontSize: "0.58rem", fontWeight: 700, padding: "7px 14px", borderRadius: 4, whiteSpace: "nowrap", flexShrink: 0 }}>
            Book Now →
          </div>
        </div>
      </div>

      {/* Trust chips */}
      <div style={{ background: "#f9fafb", borderTop: "1px solid #e5e7eb", padding: "9px 18px", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        {["Board-Certified", "All Ages Welcome", "Insurance Accepted"].map(chip => (
          <span key={chip} style={{ fontSize: "0.52rem", fontWeight: 600, color: "#00574f", display: "inline-flex", alignItems: "center", gap: 4 }}>
            <svg viewBox="0 0 12 12" fill="none" style={{ width: 8, height: 8 }} aria-hidden><path d="M2 6l3 3 5-5" stroke="#00897b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            {chip}
          </span>
        ))}
        <span style={{ marginLeft: "auto", fontSize: "0.5rem", color: "rgba(0,0,0,0.28)" }}>General · Cosmetic · Implants</span>
      </div>
    </div>
  );
}


/* ─── Slide render map ───────────────────────────────────────────── */
const SLIDE_COMPONENTS = [
  LawnCareSlide,
  LawFirmSlide,
  RestaurantSlide,
  HVACSlide,
  DentistsSlide,
];


/* ═══════════════════════════════════════════════════════════════════
   CAROUSEL WRAPPER
   ═══════════════════════════════════════════════════════════════════ */
export default function SamplePreviews() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);

  // Touch / swipe state
  const touchStartXRef = useRef<number | null>(null);
  const [dragDelta, setDragDelta] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const swipedRef = useRef(false);

  const goTo = useCallback((index: number) => {
    setCurrent(index);
    setProgressKey((k) => k + 1);
  }, []);

  const next = useCallback(() => goTo((current + 1) % SLIDES.length), [current, goTo]);
  const prev = useCallback(() => goTo((current - 1 + SLIDES.length) % SLIDES.length), [current, goTo]);

  useEffect(() => {
    if (paused) return;
    const id = setTimeout(next, SLIDE_INTERVAL);
    return () => clearTimeout(id);
  }, [paused, current, next]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    setDragDelta(0);
    setIsDragging(true);
    swipedRef.current = false;
    setPaused(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const delta = e.touches[0].clientX - touchStartXRef.current;
    setDragDelta(delta);
  }, []);

  const handleTouchEnd = useCallback(() => {
    setDragDelta((delta) => {
      if (delta < -50) {
        swipedRef.current = true;
        setTimeout(next, 0);
      } else if (delta > 50) {
        swipedRef.current = true;
        setTimeout(prev, 0);
      }
      return 0;
    });
    touchStartXRef.current = null;
    setIsDragging(false);
    setPaused(false);
  }, [next, prev]);

  const slide = SLIDES[current];

  return (
    <Section id="sample-previews" padding="xl" className="bg-white border-t border-gray-100">
      <style>{`
        @keyframes carousel-progress {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        .carousel-progress-bar {
          transform-origin: left;
          animation: carousel-progress ${SLIDE_INTERVAL}ms linear forwards;
        }
        .carousel-progress-bar.paused { animation-play-state: paused; }
      `}</style>

      {/* Section header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-5 mb-16">
        <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">Recent Builds</span>
        <span className="text-xs text-gray-300 uppercase tracking-widest">Updated April 2026</span>
      </div>

      {/* Intro */}
      <div className="mb-12 max-w-2xl">
        <h2 className="font-display font-bold tracking-tight text-gray-900 leading-[1.1]" style={{ fontSize: "clamp(1.8rem, 4vw, 3.2rem)" }}>
          Purpose-built for{" "}
          <em className="not-italic text-violet-600">your industry.</em>
        </h2>
        <p className="mt-4 text-base text-gray-500 leading-relaxed max-w-lg">
          Every site is designed for its niche — see the layout, copy, and conversion system in action. Click the preview to explore end-to-end.
        </p>
      </div>

      {/* ── Carousel ── */}
      <div
        className="relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Track wrapper */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-xl shadow-gray-200/60">
          {/* Progress bar */}
          <div className="relative h-1 bg-gray-100">
            <div
              key={progressKey}
              className={`absolute inset-y-0 left-0 w-full bg-violet-500 carousel-progress-bar${paused ? " paused" : ""}`}
            />
          </div>

          {/* Sliding track */}
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              display: "flex",
              transform: `translateX(calc(-${current * 100}% + ${dragDelta}px))`,
              transition: isDragging ? "none" : "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
              willChange: "transform",
              userSelect: "none",
              touchAction: "pan-y",
            }}
          >
            {SLIDES.map((s, i) => {
              const SlideComponent = SLIDE_COMPONENTS[i];
              return (
                <div key={s.href} style={{ minWidth: "100%", flexShrink: 0 }}>
                  <Link
                    href={s.href}
                    className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-inset"
                    aria-label={`View ${s.siteName} preview`}
                    tabIndex={i === current ? 0 : -1}
                    onClick={(e) => { if (swipedRef.current) e.preventDefault(); }}
                  >
                    {/* Browser chrome */}
                    <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-3 py-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-400" aria-hidden />
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-400" aria-hidden />
                      <span className="h-2.5 w-2.5 rounded-full bg-green-400" aria-hidden />
                      <div className="mx-auto min-w-0 max-w-xs flex-1 flex items-center justify-center gap-1 rounded border border-gray-200 bg-white px-2 py-1 text-[10px] text-gray-400 shadow-sm">
                        <svg viewBox="0 0 20 20" fill="currentColor" className="h-2.5 w-2.5 shrink-0 text-gray-300" aria-hidden>
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        <span className="truncate text-gray-500">{s.url}</span>
                      </div>
                      <div className="w-6 shrink-0" aria-hidden />
                    </div>

                    {/* Custom slide content */}
                    <SlideComponent />

                    {/* Card footer */}
                    <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-white">
                      <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                        <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: s.accentColor }} aria-hidden />
                        {s.label}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 group-hover:text-violet-600 transition-colors">
                        View full preview
                        <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden>
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Prev arrow */}
        <button
          onClick={prev}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200 text-gray-600 hover:text-violet-600 hover:border-violet-300 transition-all duration-200"
          aria-label="Previous slide"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden>
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Next arrow */}
        <button
          onClick={next}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200 text-gray-600 hover:text-violet-600 hover:border-violet-300 transition-all duration-200"
          aria-label="Next slide"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden>
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Dots + label */}
      <div className="mt-6 flex flex-col items-center gap-3">
        <div className="flex items-center gap-2" role="tablist" aria-label="Carousel slides">
          {SLIDES.map((s, i) => (
            <button
              key={s.href}
              role="tab"
              aria-selected={i === current}
              aria-label={`${s.label} slide`}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 ${
                i === current ? "w-7 h-2.5 bg-violet-600" : "w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-gray-400">
          <span className="font-semibold text-gray-600">{slide.label}</span>
          {" · "}click to explore the full mockup &nbsp;·&nbsp; {current + 1}&thinsp;/&thinsp;{SLIDES.length}
        </p>
      </div>
    </Section>
  );
}
