import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/next";
import ChatWidget from "@/components/ChatWidget";
import SiteShell from "@/components/SiteShell";

export const metadata: Metadata = {
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
  ],
  openGraph: {
    title: "Macrolight Builders — Client Acquisition Systems",
    description:
      "Websites that turn visitors into paying customers. Built, hosted, and managed for local businesses.",
    type: "website",
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
