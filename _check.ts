import robots from "./app/robots";
import sitemap from "./app/sitemap";

const r = robots();
console.log("ROBOTS:", JSON.stringify(r, null, 2));

const s = sitemap();
const urls = s.map(e => e.url);
console.log("SITEMAP entries:", urls.length);
console.log("First 12 URLs:");
urls.slice(0, 12).forEach(u => console.log("  -", u));
console.log("Privacy in sitemap?", urls.includes("https://macrolight-builder.com/privacy"));
console.log("Terms in sitemap?", urls.includes("https://macrolight-builder.com/terms"));
