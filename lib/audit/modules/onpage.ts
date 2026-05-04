import { crawl } from "../crawler";
import { scoreModule } from "../scorer";
import type { AuditInput, AuditIssue, AuditModuleResult } from "../types";

/**
 * On-Page / Content module.
 *
 * STATUS: Scaffolding stub.
 *
 * Production implementation (per plan section 3.2) will check, for each
 * crawled page:
 *   - Title tag: present, 50-60 chars, unique across pages
 *   - Meta description: present, 150-160 chars, unique across pages
 *   - H1: present, single, not identical to title
 *   - H2-H6 hierarchy (no skipped levels)
 *   - Image alt text coverage
 *   - Internal linking (orphan pages, internal link counts)
 *   - Thin content (< 300 words)
 *   - Keyword density (flag obvious over-optimisation)
 *   - Presence of a blog / content section anywhere on site
 *
 * Data source: shared crawler (no extra API).
 */

export async function runOnPageAudit(
  input: AuditInput
): Promise<AuditModuleResult> {
  const issues: AuditIssue[] = [];
  const positives: string[] = [];

  const crawlResult = await crawl(input.url, { maxPages: input.crawlLimit });

  // TODO(milestone-2): for each page in crawlResult.pages run the on-page
  // checks listed in the plan. The crawler returns parsed text + raw HTML;
  // when cheerio is added we'll re-parse here for selector-based checks.
  void crawlResult;

  return {
    module: "onpage",
    score: scoreModule(issues),
    issues,
    rawData: { pagesAnalysed: 0 },
    positives,
  };
}
