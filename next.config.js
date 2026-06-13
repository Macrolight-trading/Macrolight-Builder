/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
    }
    return config;
  },
  images: {
    // Modern formats — Next/Vercel will serve AVIF when the browser
    // accepts it, falling back to WebP, then to the original. Costs
    // nothing once images are migrated to local files; for the existing
    // Unsplash images this still helps because Next caches optimized
    // variants at the edge.
    formats: ["image/avif", "image/webp"],
    // Constrain optimized widths to what we actually render. Without
    // this Next happily generates 3840-wide variants for any <Image
    // sizes="100vw">, which is what Lighthouse called out. None of our
    // hero containers exceed ~1600px on a desktop.
    deviceSizes: [640, 750, 828, 1080, 1200, 1600, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 640, 800],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // We hand-author the blog hero SVGs in /public/img/blog/ — they
    // contain no script/foreignObject and are not user-supplied. Pair
    // with a strict CSP and force download disposition so Next still
    // refuses to render any malicious SVG that ever gets uploaded.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy:
      "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.private.blob.vercel-storage.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
