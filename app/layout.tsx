import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/next";
import ChatWidget from "@/components/ChatWidget";
import SiteShell from "@/components/SiteShell";
import JsonLd from "@/components/JsonLd";
import SessionProvider from "@/components/auth/SessionProvider";

const BASE_URL = "https://macrolight-builder.com";

/**
 * Site-wide Organization + WebSite JSON-LD. Lives in the root layout so
 * it's emitted on every page (Google explicitly recommends site-wide
 * Organization markup over a one-off on the homepage). The NAP block
 * here MUST stay byte-identical to the one in components/Footer.tsx and
 * to the Google Business Profile listing — Google compares these across
 * the web as a local-SEO signal.
 */
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${BASE_URL}#organization`,
  name: "Macrolight Builder",
  url: BASE_URL,
  logo: `${BASE_URL}/logo.png`,
  email: "bbayley50@gmail.com",
  telephone: "+1-248-214-5877",
  address: {
    "@type": "PostalAddress",
    streetAddress: "1902 Villa Rd",
    addressLocality: "Birmingham",
    addressRegion: "MI",
    postalCode: "48009",
    addressCountry: "US",
  },
  areaServed: { "@type": "Country", name: "United States" },
  founder: [
    { "@type": "Person", name: "Bradley Bayley" },
    { "@type": "Person", name: "Nick Ottoy" },
  ],
  // Add real social profiles here as they go live (LinkedIn company
  // page, X, Instagram, Google Business Profile). A populated `sameAs`
  // is one of the easiest entity signals to give Google for a new brand.
  sameAs: [],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${BASE_URL}#website`,
  url: BASE_URL,
  name: "Macrolight Builder",
  publisher: { "@id": `${BASE_URL}#organization` },
  inLanguage: "en-US",
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    // Default homepage title kept <=60 chars for SERP truncation. Child
    // pages still receive the " | Macrolight Builder" suffix via the
    // template below.
    default: "Client Acquisition Websites for Local Businesses",
    template: "%s | Macrolight Builder",
  },
  // Trimmed to <=160 chars (was 162 — see SEO audit Finding 7).
  description:
    "We build, host, and manage high-converting websites that turn visitors into paying customers — client acquisition systems for local businesses.",
  // Note: intentionally no `keywords` field. Google ignores meta keywords
  // and including them only signals strategy to competitors who scrape SERPs.
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Macrolight Builder — Client Acquisition Systems",
    description:
      "Websites that turn visitors into paying customers. Built, hosted, and managed for local businesses.",
    url: BASE_URL,
    siteName: "Macrolight Builder",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "Macrolight Builder — websites that generate leads",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Macrolight Builder — Client Acquisition Systems",
    description:
      "Websites that turn visitors into paying customers. Built for local businesses.",
    images: ["/og-default.png"],
  },
  verification: {
    google: "91PGka_W_3DW5thpt2jpl7vKQ8tf5MxsLbx_ptC5B4s",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased min-h-screen flex flex-col bg-white text-gray-900">
        <JsonLd data={organizationSchema} />
        <JsonLd data={websiteSchema} />
        <SessionProvider>
          <SiteShell
            navbar={<Navbar />}
            footer={<Footer />}
            chatWidget={<ChatWidget />}
          >
            {children}
          </SiteShell>
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  );
}
