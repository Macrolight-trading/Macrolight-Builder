import type { Metadata } from "next";
import Section from "@/components/Section";

const LAST_UPDATED = "May 6, 2026";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms that govern your use of macrolight-builder.com and the website design and lead-generation services provided by Macrolight Builder.",
  alternates: { canonical: "/terms" },
  robots: { index: true, follow: true },
};

const H2 = "font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 mt-12 mb-4";
const P = "text-base text-gray-600 leading-relaxed mb-5";
const UL = "list-disc pl-6 text-base text-gray-600 leading-relaxed mb-5 space-y-2";
const A = "text-violet-600 hover:underline";

export default function TermsPage() {
  return (
    <Section padding="lg" className="bg-white">
      <article className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-violet-600 mb-3">
          Legal
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 leading-[1.05]">
          Terms of Service
        </h1>
        <p className="text-sm text-gray-400 mt-3 mb-10">
          Last updated: {LAST_UPDATED}
        </p>

        <p className={P}>
          These Terms of Service (&quot;Terms&quot;) govern your access to and
          use of{" "}
          <a className={A} href="https://macrolight-builder.com">
            macrolight-builder.com
          </a>{" "}
          (the &quot;Site&quot;) and any website design, hosting, support, or
          related services provided by Macrolight Builder (&quot;we,&quot;
          &quot;us,&quot; or &quot;our&quot;) (collectively, the
          &quot;Services&quot;). By using the Site or engaging us for
          Services, you agree to these Terms.
        </p>

        <h2 className={H2}>1. Eligibility</h2>
        <p className={P}>
          You must be at least 18 years old and able to form a binding
          contract to use the Site or engage the Services. By using the Site
          you represent that you meet these requirements.
        </p>

        <h2 className={H2}>2. Free Audits & Inquiries</h2>
        <p className={P}>
          Audits, proposals, and other materials we provide before a signed
          engagement are for informational purposes and do not create a
          client relationship. We may decline any project at our discretion.
        </p>

        <h2 className={H2}>3. Engagement & Scope of Work</h2>
        <p className={P}>
          When you engage us for paid Services, the specific scope,
          deliverables, timelines, and fees will be set out in a separate
          written proposal, statement of work, or service agreement. If those
          documents conflict with these Terms, the engagement-specific
          document controls.
        </p>

        <h2 className={H2}>4. Fees & Payment</h2>
        <p className={P}>
          Fees, payment schedules, and refund terms are described in your
          engagement document. Unpaid invoices may result in suspension of
          hosting or support until balances are resolved.
        </p>

        <h2 className={H2}>5. Client Responsibilities</h2>
        <ul className={UL}>
          <li>Provide accurate business information and content.</li>
          <li>Respond to project requests in a timely manner.</li>
          <li>
            Hold all rights to logos, photos, copy, and other materials you
            provide us.
          </li>
          <li>Comply with all laws applicable to your business.</li>
        </ul>

        <h2 className={H2}>6. Intellectual Property</h2>
        <p className={P}>
          Upon full payment, you own the custom-designed website assets we
          deliver to you, except for: (a) third-party components, fonts,
          images, or libraries, which are licensed under their own terms; and
          (b) our pre-existing tools, frameworks, and processes, which we
          retain. We may use anonymized project results in case studies and
          marketing unless you opt out in writing.
        </p>

        <h2 className={H2}>7. No Guaranteed Results</h2>
        <p className={P}>
          We work hard to build sites that generate leads, but we do not
          guarantee specific search rankings, traffic levels, conversion
          rates, or revenue outcomes. Results depend on many factors outside
          our control, including market conditions and your business
          operations.
        </p>

        <h2 className={H2}>8. Acceptable Use of the Site</h2>
        <p className={P}>
          You agree not to misuse the Site — for example by attempting to
          interfere with its operation, accessing it via automated tools
          beyond ordinary crawling, or using it for unlawful purposes.
        </p>

        <h2 className={H2}>9. Disclaimers</h2>
        <p className={P}>
          The Site and Services are provided on an &quot;as is&quot; and
          &quot;as available&quot; basis. To the fullest extent permitted by
          law, we disclaim all warranties, express or implied, including
          merchantability, fitness for a particular purpose, and
          non-infringement.
        </p>

        <h2 className={H2}>10. Limitation of Liability</h2>
        <p className={P}>
          To the fullest extent permitted by law, our total liability arising
          out of or related to the Site or Services will not exceed the
          amounts you paid us in the twelve months preceding the claim. We
          will not be liable for indirect, incidental, consequential, special,
          or punitive damages.
        </p>

        <h2 className={H2}>11. Indemnification</h2>
        <p className={P}>
          You agree to indemnify and hold us harmless from claims arising out
          of content or materials you supply, your business operations, or
          your breach of these Terms.
        </p>

        <h2 className={H2}>12. Termination</h2>
        <p className={P}>
          Either party may terminate an engagement as described in its
          engagement document. We may suspend or terminate your access to the
          Site at any time for any reason consistent with applicable law.
        </p>

        <h2 className={H2}>13. Governing Law</h2>
        <p className={P}>
          These Terms are governed by the laws of the State of Michigan,
          without regard to conflict-of-law rules. Disputes will be resolved
          in the state or federal courts located in Oakland County, Michigan,
          and you consent to that jurisdiction and venue.
        </p>

        <h2 className={H2}>14. Changes to These Terms</h2>
        <p className={P}>
          We may update these Terms from time to time. The &quot;Last
          updated&quot; date above will reflect the most recent revision.
          Continued use of the Site after changes constitutes acceptance of
          the updated Terms.
        </p>

        <h2 className={H2}>15. Contact Us</h2>
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
