import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased min-h-screen flex flex-col bg-zinc-950 text-white">
        <Navbar />
        <main className="flex-1 relative">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
