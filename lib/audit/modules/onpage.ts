import { crawl, type CrawledPage, type CrawlResult } from "../crawler";
import { scoreModule } from "../scorer";
import type { AuditInput, AuditIssue, AuditModuleResult } from "../types";

/**
 * On-Page / Content module.
 *
 * Per-page checks (using crawled meta data):
 *   - Title tag: present, 50-60 chars, unique across pages
 *   - Meta description: present, 150-160 chars, unique across pages
 *   - H1: present, single, not identical to title
 *   - Image alt text coverage
 *   - Thin content (< 300 visible words)
 *   - Internal linking density (orphan pages = 0 inbound links)
 *
 * No external API — operates entirely on crawler output.
 */

const TITLE_MIN = 30;
const TITLE_MAX = 60;
const DESC_MIN = 70;
const DESC_MAX = 160;
const THIN_CONTENT_THRESHOLD = 300;
const ALT_COVERAGE_WARN = 0.7; // less than 70% of images with alt text
const ALT_COVERAGE_CRIT = 0.4; // less than 40% with alt text

export async function runOnPageAudit(
  input: AuditInput,
  sharedCrawl?: CrawlResult
): Promise<AuditModuleResult> {
  const issues: AuditIssue[] = [];
  const positives: string[] = [];

  const crawlResult =
    sharedCrawl ?? (await crawl(input.url, { maxPages: input.crawlLimit }));
  const pages = crawlResult.pages.filter((p) => p.status >= 200 && p.status < 400);

  // No usable pages means we have nothing to evaluate. Mark unavailable
  // rather than emitting a "site is unreachable" issue that would dock the
  // score and inflate the issue count under a category that didn't actually
  // analyze anything.
  if (pages.length === 0) {
    return {
      module: "onpage",
      available: false,
      unavailableReason: "Site could not be crawled — no pages were successfully fetched",
      score: 0,
      issues: [],
      rawData: { pagesAnalysed: 0 },
      positives: [],
    };
  }

  // ── Per-page checks (homepage gets stricter treatment) ───────────────────
  const homepage = pages[0];
  evaluateTitle(homepage, issues, positives, true);
  evaluateDescription(homepage, issues, positives, true);
  evaluateH1(homepage, issues, positives);
  evaluateAltText(homepage, issues, positives);
  evaluateContentLength(homepage, issues, positives);

  // Aggregate checks across the whole crawl.
  evaluateMissingTitlesDescriptions(pages, issues);
  evaluateDuplicates(pages, issues, positives);
  evaluateAltCoverageGlobal(pages, issues, positives);
  evaluateInternalLinking(pages, issues, positives);
  evaluateBlogPresence(pages, positives);

  return {
    module: "onpage",
    available: true,
    score: scoreModule(issues),
    issues,
    rawData: {
      pagesAnalysed: pages.length,
      titles: pages.map((p) => ({ url: p.finalUrl, title: p.meta.title })),
      descriptions: pages.map((p) => ({
        url: p.finalUrl,
        description: p.meta.description,
      })),
    },
    positives,
  };
}

/* ── Per-page evaluators ────────────────────────────────────────────────── */

function evaluateTitle(
  page: CrawledPage,
  issues: AuditIssue[],
  positives: string[],
  isHomepage: boolean
): void {
  const title = page.meta.title;
  if (!title) {
    issues.push({
      module: "onpage",
      severity: isHomepage ? "critical" : "warning",
      check: "missing_title",
      title: isHomepage ? "Homepage is missing a title tag" : "Page is missing a title tag",
      description:
        "Without a <title>, the page has no headline in search results. " +
        "Browsers fall back to the URL in the tab.",
      recommendation:
        "Add a unique, keyword-relevant <title> tag (50-60 characters) to " +
        "the <head> of every page.",
      affectedUrl: page.finalUrl,
    });
    return;
  }

  const len = title.length;
  if (len < TITLE_MIN) {
    issues.push({
      module: "onpage",
      severity: "warning",
      check: "title_too_short",
      title: `Title is ${len} characters — too short`,
      description: `"${title}"`,
      recommendation:
        `Expand the title to ${TITLE_MIN}-${TITLE_MAX} characters with a ` +
        "primary keyword and a clear value proposition.",
      affectedUrl: page.finalUrl,
    });
  } else if (len > TITLE_MAX) {
    issues.push({
      module: "onpage",
      severity: "warning",
      check: "title_too_long",
      title: `Title is ${len} characters — likely truncated in search results`,
      description: `"${title}"`,
      recommendation:
        `Trim the title to under ${TITLE_MAX} characters so Google doesn't ` +
        "cut it off in the SERP.",
      affectedUrl: page.finalUrl,
    });
  } else if (isHomepage) {
    positives.push(`Homepage title is well-sized (${len} characters).`);
  }
}

function evaluateDescription(
  page: CrawledPage,
  issues: AuditIssue[],
  positives: string[],
  isHomepage: boolean
): void {
  const desc = page.meta.description;
  if (!desc) {
    issues.push({
      module: "onpage",
      severity: isHomepage ? "warning" : "info",
      check: "missing_description",
      title: isHomepage
        ? "Homepage is missing a meta description"
        : "Page is missing a meta description",
      description:
        "Without a meta description, Google generates one from page content " +
        "— which is often less compelling than a hand-written one.",
      recommendation:
        `Add a unique meta description (${DESC_MIN}-${DESC_MAX} characters) ` +
        "that summarises the page's value and includes a call to action.",
      affectedUrl: page.finalUrl,
    });
    return;
  }

  const len = desc.length;
  if (len < DESC_MIN) {
    issues.push({
      module: "onpage",
      severity: "info",
      check: "description_too_short",
      title: `Meta description is ${len} characters — could be longer`,
      description: `"${desc}"`,
      recommendation:
        `Expand to ${DESC_MIN}-${DESC_MAX} characters to make full use of ` +
        "the SERP snippet space.",
      affectedUrl: page.finalUrl,
    });
  } else if (len > DESC_MAX) {
    issues.push({
      module: "onpage",
      severity: "warning",
      check: "description_too_long",
      title: `Meta description is ${len} characters — will be truncated`,
      description: `"${desc.slice(0, 80)}..."`,
      recommendation:
        `Trim to under ${DESC_MAX} characters so Google shows the full ` +
        "description in search results.",
      affectedUrl: page.finalUrl,
    });
  } else if (isHomepage) {
    positives.push(`Homepage meta description is well-sized (${len} characters).`);
  }
}

function evaluateH1(
  page: CrawledPage,
  issues: AuditIssue[],
  positives: string[]
): void {
  if (page.meta.h1Count === 0) {
    issues.push({
      module: "onpage",
      severity: "critical",
      check: "missing_h1",
      title: "Homepage has no H1 tag",
      description:
        "An H1 is the most important on-page heading. Without one, Google " +
        "and screen readers have no clear page topic signal.",
      recommendation:
        "Add a single, descriptive <h1> to the homepage that includes the " +
        "primary keyword.",
      affectedUrl: page.finalUrl,
    });
  } else if (page.meta.h1Count > 1) {
    issues.push({
      module: "onpage",
      severity: "warning",
      check: "multiple_h1",
      title: `Homepage has ${page.meta.h1Count} H1 tags`,
      description:
        "Multiple H1s dilute the topic signal. Modern HTML5 technically " +
        "allows it but search engines still prefer one.",
      recommendation:
        "Demote secondary H1s to H2 or H3, leaving a single H1 per page.",
      affectedUrl: page.finalUrl,
    });
  } else {
    if (
      page.meta.h1Text &&
      page.meta.title &&
      page.meta.h1Text.toLowerCase() === page.meta.title.toLowerCase()
    ) {
      issues.push({
        module: "onpage",
        severity: "info",
        check: "h1_matches_title",
        title: "H1 is identical to the page title",
        description:
          "Not a hard problem, but you're missing a chance to use a slightly " +
          "different phrasing that targets a related keyword variant.",
        recommendation:
          "Vary the H1 from the title — same topic, different angle. " +
          "Helps capture long-tail variations.",
        affectedUrl: page.finalUrl,
      });
    } else {
      positives.push("Homepage has a single, well-formed H1.");
    }
  }
}

function evaluateAltText(
  page: CrawledPage,
  issues: AuditIssue[],
  positives: string[]
): void {
  if (page.meta.imageCount === 0) return;
  const coverage = page.meta.imagesWithAlt / page.meta.imageCount;
  if (coverage < ALT_COVERAGE_CRIT) {
    issues.push({
      module: "onpage",
      severity: "warning",
      check: "low_alt_coverage_homepage",
      title: `Only ${Math.round(coverage * 100)}% of homepage images have alt text`,
      description:
        "Alt text is required for screen readers and gives Google additional " +
        "context for image search results.",
      recommendation:
        "Add descriptive alt attributes to every meaningful image. " +
        "Decorative images can use alt=\"\" but the attribute should still be present.",
      affectedUrl: page.finalUrl,
    });
  } else if (coverage < ALT_COVERAGE_WARN) {
    issues.push({
      module: "onpage",
      severity: "info",
      check: "moderate_alt_coverage_homepage",
      title: `${Math.round(coverage * 100)}% of homepage images have alt text`,
      description:
        "Alt coverage is decent but not complete.",
      recommendation:
        "Audit the remaining images and add descriptive alt text where they " +
        "convey meaning.",
      affectedUrl: page.finalUrl,
    });
  } else if (page.meta.imageCount >= 3) {
    positives.push(
      `${Math.round(coverage * 100)}% of homepage images have alt text.`
    );
  }
}

function evaluateContentLength(
  page: CrawledPage,
  issues: AuditIssue[],
  _positives: string[]
): void {
  if (page.meta.wordCount < THIN_CONTENT_THRESHOLD) {
    issues.push({
      module: "onpage",
      severity: "warning",
      check: "thin_homepage",
      title: `Homepage has only ${page.meta.wordCount} words of visible text`,
      description:
        "Short, content-light pages give Google little to rank for. Pages " +
        `under ${THIN_CONTENT_THRESHOLD} words often struggle to rank for ` +
        "anything beyond a brand search.",
      recommendation:
        "Add depth: explain who you serve, what makes you different, and " +
        "answer the questions prospects actually ask. Aim for at least " +
        `${THIN_CONTENT_THRESHOLD} words on the homepage.`,
      affectedUrl: page.finalUrl,
    });
  }
}

/* ── Aggregate evaluators ───────────────────────────────────────────────── */

function evaluateMissingTitlesDescriptions(
  pages: CrawledPage[],
  issues: AuditIssue[]
): void {
  const noTitle = pages.filter((p) => !p.meta.title).length;
  const noDesc = pages.filter((p) => !p.meta.description).length;

  // Skip duplicate single-page issues — handled by per-page evaluator.
  if (pages.length <= 1) return;

  if (noTitle > 1) {
    issues.push({
      module: "onpage",
      severity: "warning",
      check: "pages_missing_titles",
      title: `${noTitle} pages are missing a title tag`,
      description: "Pages without titles can't compete in search results.",
      recommendation:
        "Add unique, descriptive title tags to every page.",
    });
  }

  if (noDesc > pages.length / 2) {
    issues.push({
      module: "onpage",
      severity: "info",
      check: "many_pages_missing_descriptions",
      title: `${noDesc} of ${pages.length} pages have no meta description`,
      description:
        "Google will auto-generate descriptions but they're rarely as " +
        "compelling as ones you write.",
      recommendation:
        "Write meta descriptions for at least your most important pages.",
    });
  }
}

function evaluateDuplicates(
  pages: CrawledPage[],
  issues: AuditIssue[],
  positives: string[]
): void {
  if (pages.length <= 1) return;

  const titleGroups = groupBy(pages, (p) => p.meta.title?.toLowerCase() ?? "");
  const descGroups = groupBy(
    pages,
    (p) => p.meta.description?.toLowerCase() ?? ""
  );

  let dupeTitleGroups = 0;
  for (const [key, group] of titleGroups) {
    if (key && group.length > 1) dupeTitleGroups++;
  }
  let dupeDescGroups = 0;
  for (const [key, group] of descGroups) {
    if (key && group.length > 1) dupeDescGroups++;
  }

  if (dupeTitleGroups > 0) {
    issues.push({
      module: "onpage",
      severity: "warning",
      check: "duplicate_titles",
      title: `${dupeTitleGroups} sets of pages share the same title`,
      description:
        "Duplicate titles confuse search engines about which page should " +
        "rank for a given query — they end up competing with each other.",
      recommendation:
        "Make every page's title unique. Differentiate by topic, location, " +
        "or audience.",
    });
  } else {
    positives.push("All crawled pages have unique titles.");
  }

  if (dupeDescGroups > 0) {
    issues.push({
      module: "onpage",
      severity: "info",
      check: "duplicate_descriptions",
      title: `${dupeDescGroups} sets of pages share the same meta description`,
      description:
        "Duplicate descriptions miss the opportunity to differentiate pages " +
        "in search snippets.",
      recommendation: "Write a unique meta description for each page.",
    });
  }
}

function evaluateAltCoverageGlobal(
  pages: CrawledPage[],
  issues: AuditIssue[],
  positives: string[]
): void {
  const totals = pages.reduce(
    (acc, p) => {
      acc.images += p.meta.imageCount;
      acc.withAlt += p.meta.imagesWithAlt;
      return acc;
    },
    { images: 0, withAlt: 0 }
  );
  if (totals.images < 5) return; // not enough signal

  const ratio = totals.withAlt / totals.images;
  if (ratio < ALT_COVERAGE_CRIT) {
    issues.push({
      module: "onpage",
      severity: "warning",
      check: "low_alt_coverage_site",
      title: `Site-wide alt text coverage is ${Math.round(ratio * 100)}%`,
      description:
        `Only ${totals.withAlt} of ${totals.images} crawled images have ` +
        "alt text. This hurts accessibility, image search, and overall SEO.",
      recommendation:
        "Add descriptive alt text to images. Most CMSes have a bulk-edit " +
        "view for media that makes this fast.",
    });
  } else if (ratio >= 0.9) {
    positives.push(
      `Site-wide alt text coverage is ${Math.round(ratio * 100)}%.`
    );
  }
}

function evaluateInternalLinking(
  pages: CrawledPage[],
  issues: AuditIssue[],
  positives: string[]
): void {
  if (pages.length < 3) return;

  // Build a set of normalized URLs that have at least one inbound link.
  const linked = new Set<string>();
  for (const p of pages) {
    for (const href of p.meta.internalLinks) {
      linked.add(stripFragment(href));
    }
  }
  const orphans = pages.filter((p, idx) => {
    if (idx === 0) return false; // homepage isn't expected to be linked from itself
    return !linked.has(stripFragment(p.finalUrl));
  });

  if (orphans.length > 0) {
    issues.push({
      module: "onpage",
      severity: "info",
      check: "orphan_pages",
      title: `${orphans.length} crawled page${orphans.length === 1 ? " has" : "s have"} no inbound internal links`,
      description:
        "Orphan pages are reachable but not linked from anywhere else. " +
        "Search engines deprioritise pages that look unimportant to the " +
        "site itself.",
      recommendation:
        "Add internal links from related pages to surface these orphans, " +
        "or remove them if they're no longer needed.",
    });
  } else {
    positives.push("All crawled pages have at least one inbound internal link.");
  }
}

function evaluateBlogPresence(
  pages: CrawledPage[],
  positives: string[]
): void {
  const hasBlog = pages.some((p) =>
    /\/(blog|articles|insights|news|resources)(\/|$)/i.test(
      new URL(p.finalUrl).pathname
    )
  );
  if (hasBlog) {
    positives.push("Site has a blog or content hub.");
  }
}

/* ── helpers ────────────────────────────────────────────────────────────── */

function groupBy<T, K>(arr: T[], key: (t: T) => K): Map<K, T[]> {
  const m = new Map<K, T[]>();
  for (const item of arr) {
    const k = key(item);
    const existing = m.get(k);
    if (existing) existing.push(item);
    else m.set(k, [item]);
  }
  return m;
}

function stripFragment(url: string): string {
  try {
    const u = new URL(url);
    u.hash = "";
    if (u.pathname.length > 1 && u.pathname.endsWith("/")) {
      u.pathname = u.pathname.slice(0, -1);
    }
    return u.toString();
  } catch {
    return url;
  }
}
