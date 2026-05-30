import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const matter = require("gray-matter");

const POSTS_DIR = path.join(process.cwd(), "content", "blog");
const posts = [];
for (const f of readdirSync(POSTS_DIR)) {
  if (!f.endsWith(".mdx")) continue;
  const slug = f.replace(/\.mdx?$/, "");
  const { data, content } = matter(readFileSync(path.join(POSTS_DIR, f), "utf8"));
  posts.push({ slug, ...data, contentLen: content.trim().length });
}
posts.sort((a,b) => new Date(b.date) - new Date(a.date));
for (const p of posts) {
  console.log(`✓ ${p.slug}`);
  console.log(`  title: ${p.title}`);
  console.log(`  date:  ${p.date}  cat: ${p.category}  by ${p.author} (${p.authorKey})`);
  console.log(`  body:  ${p.contentLen} chars`);
  const missing = ["title","description","date","author","authorKey","readTime","category","ogImage","coverImage","coverAlt"].filter(k => !p[k]);
  if (missing.length) console.log(`  ⚠ missing: ${missing.join(",")}`);
}
console.log(`\nTotal: ${posts.length} posts`);
