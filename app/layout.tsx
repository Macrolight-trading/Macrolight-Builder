import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/next";
import ChatWidget from "@/components/ChatWidget";
import SiteShell from "@/components/SiteShell";

const BASE_URL = "https://macrolightbuilders.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Macrolight Builders — Client Acquisition Systems for Local Businesses",
    template: "%s | Macrolight Builders",
  },
  description:
    "We build, host, and manage high-converting websites that turn visitors into paying customers. Client acquisition systems for local businesses — not just websites.",
  keywords: [
    "lead generation websites",
    "website for local business",
    "client acquisition system",
    "conversion optimized websites",
    "web design for contractors",
    "small business website builder",
    "local SEO web design",
    "contractor website design",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Macrolight Builders — Client Acquisition Systems",
    description:
      "Websites that turn visitors into paying customers. Built, hosted, and managed for local businesses.",
    url: BASE_URL,
    siteName: "Macrolight Builders",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "Macrolight Builders — websites that generate leads",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Macrolight Builders — Client Acquisition Systems",
    description:
      "Websites that turn visitors into paying customers. Built for local businesses.",
    images: ["/og-default.png"],
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
        <SiteShell
          navbar={<Navbar />}
          footer={<Footer />}
          chatWidget={<ChatWidget />}
        >
          {children}
        </SiteShell>
        <Analytics />
      </body>
    </html>
  );
}
