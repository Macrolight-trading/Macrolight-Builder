// Stub the truncated modules so we can test our sitemap.ts in isolation.
const Module = require("module");
const origResolve = Module._resolveFilename;
Module._resolveFilename = function (req: string, ...rest: any[]) {
  if (req === "@/lib/blog") return require.resolve("./_stub_blog.ts");
  if (req === "@/lib/case-studies") return require.resolve("./_stub_cs.ts");
  return origResolve.call(this, req, ...rest);
};
require("./_stub_blog.ts");
require("./_stub_cs.ts");

import sitemap from "./app/sitemap";
const entries = sitemap();
const urls = entries.map((e) => e.url);
console.log("Total entries:", entries.length);
console.log("Privacy present?", urls.includes("https://macrolight-builder.com/privacy"));
console.log("Terms present?", urls.includes("https://macrolight-builder.com/terms"));
console.log("Static pages:");
urls.filter(u => !u.includes("/blog/") && !u.includes("/case-studies/")).forEach(u => console.log("  -", u));
