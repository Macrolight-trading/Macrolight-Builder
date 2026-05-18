import type { Metadata } from "next";
import Section from "@/components/Section";

const LAST_UPDATED = "May 17, 2026";

export const metadata: Metadata = {
  title: "Accessibility Statement",
  description:
    "Macrolight Builder is committed to making our website accessible to everyone, including people with disabilities. Read our accessibility commitment, known limitations, and how to report a barrier.",
  alternates: { canonical: "/accessibility" },
  robots: { index: true, follow: true },
};

const H2 = "font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 mt-12 mb-4";
const P = "text-base text-gray-600 leading-relaxed mb-5";
const UL = "list-disc pl-6 text-base text-gray-600 leading-relaxed mb-5 space-y-2";
const A = "text-violet-600 hover:underline";

export default function AccessibilityPage() {
  return (
    <Section padding="lg" className="bg-white">
      <article className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-violet-600 mb-3">
          Legal
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 leading-[1.05]">
          Accessibility Statement
        </h1>
        <p className="text-sm text-gray-400 mt-3 mb-10">
          Last updated: {LAST_UPDATED}
        </p>

        <p className={P}>
          Macrolight Builder is committed to making{" "}
          <a className={A} href="https://macrolight-builder.com">
            macrolight-builder.com
          </a>{" "}
          accessible to the widest possible audience, including people with
          disabilities. We believe a great website is one that everyone can
          use.
        </p>

        <h2 className={H2}>1. Conformance Status</h2>
        <p className={P}>
          We aim to conform to the{" "}
          <a
            className={A}
            href="https://www.w3.org/TR/WCAG21/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Web Content Accessibility Guidelines (WCAG) 2.1, Level AA
          </a>
          . These guidelines explain how to make web content more accessible
          for people with disabilities and more user-friendly for everyone.
          We treat WCAG 2.1 AA as a baseline and continually work to raise
          the bar.
        </p>

        <h2 className={H2}>2. What We&apos;ve Done</h2>
        <ul className={UL}>
          <li>
            Semantic HTML so that screen readers, keyboards, and assistive
            tools can navigate the page in a meaningful order.
          </li>
          <li>
            Color combinations chosen to meet WCAG AA contrast ratios for
            body text and interactive elements.
          </li>
          <li>
            Visible focus indicators on all interactive elements so keyboard
            users can see where they are on the page.
          </li>
          <li>
            Descriptive alternative text on meaningful images, and an{" "}
            <code>alt=&quot;&quot;</code> attribute on purely decorative ones.
          </li>
          <li>
            Forms with explicit labels and inline error messaging.
          </li>
          <li>
            A responsive layout that works without horizontal scrolling at
            common mobile breakpoints, and that reflows up to 200% zoom.
          </li>
          <li>
            Avoidance of motion or auto-playing content that could trigger
            vestibular disorders.
          </li>
        </ul>

        <h2 className={H2}>3. Known Limitations</h2>
        <p className={P}>
          Despite our efforts, some content on the Site may not yet be fully
          accessible. We are actively working on:
        </p>
        <ul className={UL}>
          <li>
            Captions and transcripts for any video content we publish in
            future case studies.
          </li>
          <li>
            Continued auditing of third-party embeds (such as scheduling
            widgets and chat tools) which we do not directly control.
          </li>
          <li>
            Improving the readability of PDF resources where applicable.
          </li>
        </ul>

        <h2 className={H2}>4. Assistive Technology Compatibility</h2>
        <p className={P}>
          The Site is designed to work with the latest versions of major
          browsers (Chrome, Safari, Firefox, Edge) on desktop and mobile, and
          with the screen readers commonly bundled with them (VoiceOver,
          TalkBack, NVDA, JAWS). If you experience trouble with a specific
          combination, please tell us — that feedback drives our roadmap.
        </p>

        <h2 className={H2}>5. Feedback and Reporting a Barrier</h2>
        <p className={P}>
          If you encounter any barrier to using the Site, or if you need
          information in an alternative format, please contact us and we will
          respond within five business days. Please include the page URL,
          the issue you experienced, and the assistive technology or browser
          you were using.
        </p>
        <address className={`${P} not-italic`}>
          Macrolight Builder
          <br />
          1902 Villa Rd, Birmingham, MI 48009
          <br />
          Phone:{" "}
          <a href="tel:+12482145877" className={A}>
            (248) 214-5877
          </a>
          <br />
          Email:{" "}
          <a href="mailto:bbayley50@gmail.com" className={A}>
            bbayley50@gmail.com
          </a>
        </address>

        <h2 className={H2}>6. Formal Approval</h2>
        <p className={P}>
          This statement was prepared on {LAST_UPDATED}. It reflects our
          current efforts and will be updated as the Site evolves and as
          accessibility standards advance.
        </p>
      </article>
    </Section>
  );
}
