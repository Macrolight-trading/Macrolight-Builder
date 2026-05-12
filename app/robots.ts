import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /sample/* contains the industry showcase mockups (fake businesses,
        // fake reviews, fake addresses). They're rendered into the public
        // /[industry] pages via iframe; the iframe source itself is also
        // noindex'd at the page level, but blocking it in robots.txt
        // belt-and-braces stops crawl budget being burned on placeholder data.
        disallow: ["/admin/", "/api/", "/sample/"],
      },
    ],
    sitemap: "https://macrolight-builder.com/sitemap.xml",
  };
}
