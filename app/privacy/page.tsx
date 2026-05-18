import type { Metadata } from "next";
import Section from "@/components/Section";

const LAST_UPDATED = "May 17, 2026";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Macrolight Builder collects, uses, and protects information from visitors and clients of our website.",
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
};

// Shared utility class strings — keep visual consistency with the rest of the site
// without depending on @tailwindcss/typography (which isn't installed).
const H2 = "font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 mt-12 mb-4";
const P = "text-base text-gray-600 leading-relaxed mb-5";
const UL = "list-disc pl-6 text-base text-gray-600 leading-relaxed mb-5 space-y-2";
const A = "text-violet-600 hover:underline";

export default function PrivacyPage() {
  return (
    <Section padding="lg" className="bg-white">
      <article className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-violet-600 mb-3">
          Legal
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 leading-[1.05]">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-400 mt-3 mb-10">
          Last updated: {LAST_UPDATED}
        </p>

        <p className={P}>
          This Privacy Policy explains how Macrolight Builder (&quot;we,&quot;
          &quot;us,&quot; or &quot;our&quot;) collects, uses, and discloses
          information when you visit{" "}
          <a className={A} href="https://macrolight-builder.com">
            macrolight-builder.com
          </a>{" "}
          (the &quot;Site&quot;) or use our website design and lead-generation
          services (the &quot;Services&quot;).
        </p>

        <h2 className={H2}>1. Information We Collect</h2>
        <p className={P}>
          <strong className="text-gray-900">Information you give us.</strong>{" "}
          When you request an audit, contact us, subscribe to updates, or
          become a client, we collect the information you provide — typically
          your name, email address, phone number, business name, website URL,
          and any details you include in your message.
        </p>
        <p className={P}>
          <strong className="text-gray-900">
            Information collected automatically.
          </strong>{" "}
          When you visit the Site we collect standard log data including IP
          address, browser type, pages visited, referring URL, and timestamps.
          We use Vercel Analytics for privacy-friendly, cookie-free traffic
          measurement.
        </p>
        <p className={P}>
          <strong className="text-gray-900">Cookies and similar
          technologies.</strong> We use a limited set of cookies and similar
          technologies to operate the Site, measure traffic, and (with your
          consent) measure the effectiveness of our advertising. See the{" "}
          <a className={A} href="#cookies">Cookie Policy</a> section below for
          a full breakdown.
        </p>

        <h2 className={H2}>2. How We Use Information</h2>
        <ul className={UL}>
          <li>To respond to inquiries and deliver requested audits or proposals.</li>
          <li>To provide, operate, and improve the Services for our clients.</li>
          <li>To send service-related communications (e.g., audit reports, project updates).</li>
          <li>To comply with legal obligations and enforce our Terms.</li>
        </ul>

        <h2 className={H2}>3. How We Share Information</h2>
        <p className={P}>
          We do not sell or rent your personal information. We share
          information only with: (a) trusted service providers that help us
          operate the Site or deliver the Services (e.g., hosting, email,
          analytics) under confidentiality obligations; (b) authorities when
          required by law; or (c) a successor entity in connection with a
          merger, acquisition, or sale of assets.
        </p>

        <h2 className={H2}>4. Data Retention</h2>
        <p className={P}>
          We keep contact and client data only as long as needed to provide
          the Services, comply with legal obligations, resolve disputes, and
          enforce agreements. You may request deletion at any time by emailing
          us.
        </p>

        <h2 className={H2}>5. Your Rights</h2>
        <p className={P}>
          Depending on where you live, you may have the right to access,
          correct, delete, or port your personal information, or to object to
          or restrict certain processing. Michigan and U.S. residents may also
          have specific rights under applicable state laws. To exercise these
          rights, email us at the address below.
        </p>

        <h2 className={H2}>6. Security</h2>
        <p className={P}>
          We use reasonable administrative, technical, and physical safeguards
          to protect information. No internet transmission is 100% secure;
          please do not send sensitive information through unencrypted
          channels.
        </p>

        <h2 className={H2}>7. Children</h2>
        <p className={P}>
          The Site and Services are not directed to children under 13, and we
          do not knowingly collect information from children under 13.
        </p>

        <h2 className={H2}>8. Third-Party Links</h2>
        <p className={P}>
          The Site may link to third-party sites we don&apos;t control. Their
          privacy practices are governed by their own policies.
        </p>

        <h2 id="cookies" className={H2}>9. Cookie Policy</h2>
        <p className={P}>
          Cookies are small text files stored on your device when you visit a
          website. We also use similar technologies such as pixels, tags, and
          local storage. This section explains what we use, why, and how to
          control them.
        </p>

        <p className={P}>
          <strong className="text-gray-900">Categories we use.</strong>
        </p>
        <ul className={UL}>
          <li>
            <strong className="text-gray-900">Strictly necessary.</strong>{" "}
            Required for the Site and client portal to work — for example,
            keeping you signed in, remembering your cookie choice, and
            protecting forms against abuse. These cannot be turned off.
          </li>
          <li>
            <strong className="text-gray-900">Analytics.</strong> We use{" "}
            Vercel Analytics, a privacy-friendly product that does not use
            cookies and does not collect personally identifiable information.
            No consent is required for this.
          </li>
          <li>
            <strong className="text-gray-900">Advertising and conversion
            measurement.</strong> When you consent, we load the Google Ads tag
            (<code>gtag.js</code>) so we can measure which campaigns produce
            conversions and, where permitted, build remarketing audiences.
            This sets cookies in the <code>.google.com</code>,{" "}
            <code>.doubleclick.net</code>, and our own domain.
          </li>
        </ul>

        <p className={P}>
          <strong className="text-gray-900">Specific cookies and trackers.</strong>
        </p>
        <ul className={UL}>
          <li>
            <code>next-auth.session-token</code> / <code>__Secure-next-auth.session-token</code>{" "}
            — strictly necessary. Keeps you signed in to the client and admin
            portals. First-party, session or 30 days.
          </li>
          <li>
            <code>ml-cookie-consent</code> — strictly necessary. Remembers
            whether you accepted or rejected non-essential cookies so we
            don&apos;t ask again. First-party, 12 months.
          </li>
          <li>
            <code>_gcl_au</code>, <code>_gcl_aw</code>, <code>_gcl_dc</code> —
            advertising. Set by Google Ads to measure ad clicks and
            conversions. First-party, up to 90 days.
          </li>
          <li>
            <code>IDE</code>, <code>test_cookie</code> on{" "}
            <code>.doubleclick.net</code> — advertising. Set by Google to
            serve and measure ads. Third-party, up to 13 months.
          </li>
        </ul>

        <p className={P}>
          <strong className="text-gray-900">Your choices.</strong> When you
          first visit, you&apos;ll see a consent banner allowing you to accept
          or reject non-essential cookies. Until you accept, advertising and
          measurement tags run in Google&apos;s &quot;Consent Mode&quot;
          denied state and do not set advertising cookies. You can change
          your choice at any time by clearing the{" "}
          <code>ml-cookie-consent</code> cookie in your browser, or by using
          your browser&apos;s built-in cookie controls (typically under
          Settings &rarr; Privacy). Most browsers also let you block all
          cookies, but doing so may break parts of the Site.
        </p>

        <p className={P}>
          <strong className="text-gray-900">Do Not Track.</strong> The Site
          does not respond to browser DNT signals because there is no industry
          consensus on how to interpret them. We honor the consent choice
          recorded through our banner instead.
        </p>

        <h2 className={H2}>10. Changes to This Policy</h2>
        <p className={P}>
          We may update this Policy from time to time. The &quot;Last
          updated&quot; date above will reflect the most recent revision.
        </p>

        <h2 className={H2}>11. Contact Us</h2>
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
      </article>
    </Section>
  );
}
