import type { Metadata } from "next";
import Section from "@/components/Section";

const LAST_UPDATED = "May 19, 2026";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Master Services Agreement governing all proposals, quotes, portal submissions, onboarding forms, invoices, and services provided by Macrolight Builder.",
  alternates: { canonical: "/terms" },
  robots: { index: true, follow: true },
};

const H2 =
  "font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 mt-12 mb-4";
const P = "text-base text-gray-600 leading-relaxed mb-5";
const UL = "list-disc pl-6 text-base text-gray-600 leading-relaxed mb-5 space-y-2";
const UL_NESTED =
  "list-[circle] pl-6 text-base text-gray-600 leading-relaxed mt-2 mb-2 space-y-1.5";
const A = "text-violet-600 hover:underline";

export default function TermsPage() {
  return (
    <Section padding="lg" className="bg-white">
      <article className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-violet-600 mb-3">
          Legal
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 leading-[1.05]">
          Master Services Agreement
        </h1>
        <p className="text-sm text-gray-400 mt-3 mb-10">
          Last updated: {LAST_UPDATED}
        </p>

        <p className={P}>
          This Master Services Agreement (&quot;Agreement&quot;) governs all
          proposals, quotes, portal submissions, onboarding forms, invoices,
          and services provided by Macrolight Builder.
        </p>

        <h2 className={H2}>1. Parties</h2>
        <p className={P}>
          This Agreement is entered into between Macrolight Builder LLC
          (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, or
          &quot;our&quot;) and the client accepting services (&quot;Client&quot;,
          &quot;you&quot;, or &quot;your&quot;).
        </p>

        <h2 className={H2}>2. Purpose</h2>
        <p className={P}>
          The purpose of this Agreement is to establish the legal terms
          governing website development, digital marketing, branding,
          automation, hosting, SEO, CRM, analytics, advertising, content, and
          related services provided by Company.
        </p>

        <h2 className={H2}>3. Service Structure</h2>
        <p className={P}>
          Client may submit requests for services through the Macrolight
          Builder portal, onboarding forms, written communications, or direct
          proposals. Company may review and revise requested scope, pricing,
          deliverables, or timelines before issuing a final proposal or quote.
        </p>
        <p className={P}>
          Any proposal, invoice, onboarding form, portal selection, statement
          of work (&quot;SOW&quot;), or quote issued by Company is incorporated
          into and governed by this Agreement.
        </p>

        <h2 className={H2}>4. Base Plans</h2>
        <p className={P}>
          Company currently offers Starter, Growth, and Pro service plans.
          Features, pricing, and included services may change at Company&apos;s
          discretion for future agreements.
        </p>
        <p className={P}>
          Portal pricing is estimated and subject to final review and approval
          by Company.
        </p>

        <h2 className={H2}>5. Add-On Services</h2>
        <p className={P}>
          Client may request additional one-time or recurring services
          including branding, CRM setup, email marketing, SEO, analytics,
          advertising management, content creation, automation services, and
          related digital marketing services.
        </p>
        <p className={P}>
          Recurring monthly services require an initial minimum commitment of
          three (3) consecutive billing months. Following the initial
          commitment period, services shall continue on a month-to-month basis
          until terminated by either Party with thirty (30) days written notice.
        </p>

        <h2 className={H2}>6. Payment Terms</h2>
        <p className={P}>
          One-time setup fees, build fees, implementation charges, and other
          non-recurring project fees are due upfront unless otherwise agreed in
          writing.
        </p>
        <p className={P}>
          Recurring monthly services are billed in advance on a monthly basis.
        </p>
        <p className={P}>
          Recurring monthly services require an initial minimum commitment of
          three (3) consecutive billing months. Following the initial
          commitment period, services shall continue on a month-to-month basis
          until terminated by either Party with thirty (30) days written notice.
        </p>
        <p className={P}>
          Client authorizes Company to automatically charge the payment method
          provided through Stripe or other approved billing platforms for
          recurring monthly services, hosting, maintenance, subscriptions,
          advertising management, and related fees.
        </p>
        <p className={P}>
          Client agrees to maintain valid and current payment information
          during the active service term.
        </p>
        <p className={P}>
          Payments not received within five (5) calendar days of the due date
          may result in:
        </p>
        <ul className={UL}>
          <li>suspension of services,</li>
          <li>paused deployments,</li>
          <li>hosting interruption,</li>
          <li>removal of access,</li>
          <li>additional fees,</li>
          <li>or account termination.</li>
        </ul>
        <p className={P}>
          Company reserves the right to pause work until outstanding balances
          are paid.
        </p>
        <p className={P}>
          Client is responsible for any chargeback fees, collection costs,
          attorney fees, or payment processing penalties incurred due to
          disputed or reversed charges initiated without valid legal basis.
        </p>

        <h2 className={H2}>7. No Refunds</h2>
        <p className={P}>
          Due to the custom nature of digital development and marketing
          services, all payments are non-refundable once work has commenced.
        </p>
        <p className={P}>
          Deposits, setup fees, implementation fees, and billed recurring
          services are non-refundable.
        </p>
        <p className={P}>
          Company does not guarantee business outcomes, lead generation
          results, search rankings, revenue growth, or advertising performance.
        </p>

        <h2 className={H2}>8. Client Responsibilities</h2>
        <p className={P}>
          Client agrees to provide timely approvals, content, credentials,
          feedback, and requested information. Delays caused by Client may
          extend project timelines.
        </p>
        <p className={P}>
          Client represents that it owns or has legal rights to all materials
          submitted to Company.
        </p>

        <h2 className={H2}>9. Project Delays &amp; Abandonment</h2>
        <p className={P}>
          Client agrees to provide requested content, approvals, credentials,
          feedback, and other required materials in a timely manner.
        </p>
        <p className={P}>
          Project timelines, delivery dates, and launch schedules may be
          delayed if Client fails to provide required information, approvals,
          or access.
        </p>
        <p className={P}>
          If Client becomes unresponsive for more than thirty (30) days,
          Company may pause the project and reallocate scheduling or
          development resources.
        </p>
        <p className={P}>
          Projects inactive for more than sixty (60) days due to Client delay,
          inactivity, missing materials, or lack of communication may require:
        </p>
        <ul className={UL}>
          <li>repricing,</li>
          <li>revised timelines,</li>
          <li>reactivation fees,</li>
          <li>updated proposals,</li>
          <li>or rescheduling based on Company availability.</li>
        </ul>
        <p className={P}>
          Company shall not be responsible for delays caused by Client
          inactivity, third-party providers, hosting issues, domain providers,
          external vendors, or circumstances outside Company&apos;s control.
        </p>

        <h2 className={H2}>10. Revisions &amp; Scope Changes</h2>
        <p className={P}>
          Minor revisions may be included depending on the selected service
          plan, proposal, or statement of work.
        </p>
        <p className={P}>
          Major redesigns, additional functionality, new page creation,
          expanded integrations, copywriting changes, automation requests, or
          other requests outside the originally agreed scope may require
          additional fees, revised timelines, or separate written approval.
        </p>
        <p className={P}>
          Company reserves the right to determine whether requests fall outside
          the original project scope.
        </p>
        <p className={P}>
          Any requests outside the originally agreed scope may require:
        </p>
        <ul className={UL}>
          <li>a revised proposal,</li>
          <li>separate statement of work,</li>
          <li>written change order,</li>
          <li>adjusted delivery schedule,</li>
          <li>or additional billing.</li>
        </ul>
        <p className={P}>
          Client approvals, feedback, requested revisions, or change requests
          may impact project timelines and launch schedules.
        </p>
        <p className={P}>
          Unless otherwise stated in writing, Company is not responsible for
          revisions or redevelopment resulting from:
        </p>
        <ul className={UL}>
          <li>third-party platform changes,</li>
          <li>expired integrations,</li>
          <li>unsupported software,</li>
          <li>or Client-requested modifications after approval or launch.</li>
        </ul>

        <h2 className={H2}>11. Hosting, Platforms, &amp; Third-Party Services</h2>
        <p className={P}>
          Company may utilize third-party platforms including Vercel, Stripe,
          Google Workspace, Microsoft 365, HubSpot, Mailchimp, Klaviyo, Google
          Ads, OpenAI, analytics providers, and similar services in connection
          with Client services.
        </p>
        <p className={P}>
          Websites may be hosted under Company-managed infrastructure and
          deployment environments, including Company-managed Vercel accounts.
        </p>
        <p className={P}>
          Client retains ownership of all domain names associated with the
          project. Company may assist with DNS management, deployment
          configuration, domain connection, and technical setup services.
        </p>
        <p className={P}>
          Company reserves the right to pause deployments, hosting services,
          maintenance, monitoring, or related services for unpaid balances
          after thirty (30) days past due.
        </p>
        <p className={P}>
          Following completion of the required minimum service term and payment
          of all outstanding balances, Client may request:
        </p>
        <ul className={UL}>
          <li>transfer of the domain,</li>
          <li>export of website files,</li>
          <li>or migration assistance.</li>
        </ul>
        <p className={P}>
          Company&apos;s standard migration deliverable shall consist of a
          Next.js project export unless otherwise agreed in writing.
        </p>
        <p className={P}>
          Client acknowledges that third-party outages, hosting failures,
          platform policy changes, security vulnerabilities, account
          suspensions, or service interruptions are outside Company&apos;s
          control.
        </p>

        <h2 className={H2}>12. Acceptable Use</h2>
        <p className={P}>
          Client agrees not to use Company services, hosting environments,
          websites, automations, domains, deployments, or related systems for:
        </p>
        <ul className={UL}>
          <li>illegal activity,</li>
          <li>fraudulent conduct,</li>
          <li>spam,</li>
          <li>malware distribution,</li>
          <li>copyright infringement,</li>
          <li>deceptive advertising,</li>
          <li>unauthorized data collection,</li>
          <li>phishing,</li>
          <li>or violations of applicable laws or third-party platform policies.</li>
        </ul>
        <p className={P}>
          Company reserves the right to suspend, restrict, or terminate
          services for violations of this section.
        </p>

        <h2 className={H2}>13. Intellectual Property &amp; Ownership</h2>
        <p className={P}>
          Client retains ownership of all original content, logos, branding,
          images, trademarks, and materials supplied by Client.
        </p>
        <p className={P}>
          Unless otherwise agreed in writing, Company retains ownership of:
        </p>
        <ul className={UL}>
          <li>website source code,</li>
          <li>internal frameworks,</li>
          <li>reusable code libraries,</li>
          <li>automation systems,</li>
          <li>backend tooling,</li>
          <li>templates,</li>
          <li>proprietary methodologies,</li>
          <li>and related development assets created by Company.</li>
        </ul>
        <p className={P}>
          Client is granted a non-exclusive, non-transferable license to use
          completed deliverables during the active service term.
        </p>
        <p className={P}>Upon:</p>
        <ul className={UL}>
          <li>completion of the required minimum service term,</li>
          <li>full payment of all outstanding balances,</li>
          <li>and written request by Client,</li>
        </ul>
        <p className={P}>
          Company may transfer ownership of the applicable website codebase and
          related deliverables to Client.
        </p>
        <p className={P}>
          Company&apos;s standard transfer format shall consist of a Next.js
          project export unless otherwise agreed in writing.
        </p>
        <p className={P}>
          Company reserves the right to retain and reuse general development
          knowledge, coding techniques, workflows, frameworks, and
          non-client-specific components developed during the project.
        </p>

        <h2 className={H2}>14. Portfolio &amp; Marketing Rights</h2>
        <p className={P}>
          Unless otherwise agreed in writing, Company may display completed
          work, screenshots, project descriptions, logos, and non-confidential
          deliverables for marketing, portfolio, social media, or case study
          purposes.
        </p>

        <h2 className={H2}>15. Marketing &amp; SEO Disclaimer</h2>
        <p className={P}>Company does not guarantee:</p>
        <ul className={UL}>
          <li>search engine rankings,</li>
          <li>keyword positions,</li>
          <li>ad performance,</li>
          <li>conversion rates,</li>
          <li>traffic increases,</li>
          <li>lead volume,</li>
          <li>customer acquisition,</li>
          <li>or financial results.</li>
        </ul>
        <p className={P}>
          Search engine algorithms, advertising platforms, social media
          platforms, and ranking systems are controlled by third parties and
          may change without notice.
        </p>
        <p className={P}>
          Marketing, SEO, advertising, and content performance depend on
          numerous external factors outside Company&apos;s control, including:
        </p>
        <ul className={UL}>
          <li>market competition,</li>
          <li>industry conditions,</li>
          <li>platform policy changes,</li>
          <li>algorithm updates,</li>
          <li>client response times,</li>
          <li>budget levels,</li>
          <li>and third-party platform performance.</li>
        </ul>
        <p className={P}>
          Client acknowledges that digital marketing results may vary and that
          Company makes no guarantees regarding specific outcomes or business
          performance improvements.
        </p>

        <h2 className={H2}>16. AI Services Disclaimer</h2>
        <p className={P}>
          Client acknowledges that AI-generated content, chatbot responses,
          automations, recommendations, and related outputs may contain
          inaccuracies, incomplete information, unexpected behavior, or
          unintended results.
        </p>
        <p className={P}>
          Company does not guarantee the accuracy, reliability, legality,
          availability, or performance of AI-generated outputs or third-party
          AI services integrated into Client projects.
        </p>
        <p className={P}>
          Client is responsible for reviewing, approving, and monitoring all
          AI-generated content, chatbot interactions, automations, and related
          outputs before relying on such outputs for business, legal, medical,
          financial, operational, or customer-facing purposes.
        </p>
        <p className={P}>
          Company shall not be liable for damages, losses, claims,
          interruptions, inaccurate outputs, or business impacts arising from:
        </p>
        <ul className={UL}>
          <li>AI-generated content,</li>
          <li>automated workflows,</li>
          <li>chatbot interactions,</li>
          <li>third-party AI platform outages,</li>
          <li>model inaccuracies,</li>
          <li>hallucinations,</li>
          <li>or changes made by external AI providers.</li>
        </ul>
        <p className={P}>
          Client acknowledges that AI systems and third-party AI providers may
          change functionality, pricing, features, policies, or availability
          without notice.
        </p>

        <h2 className={H2}>17. Term &amp; Termination</h2>
        <p className={P}>
          Either Party may terminate recurring services with thirty (30) days
          written notice.
        </p>
        <p className={P}>
          Termination does not waive unpaid balances owed for completed work or
          active billing periods.
        </p>
        <p className={P}>
          Company reserves the right to terminate services immediately for
          non-payment, abuse, fraud, illegal activity, or harassment.
        </p>

        <h2 className={H2}>18. Limitation of Liability</h2>
        <p className={P}>
          To the fullest extent permitted by law, Company shall not be liable
          for any indirect, incidental, consequential, special, exemplary,
          punitive, or lost profit damages arising out of or relating to this
          Agreement or the services provided.
        </p>
        <p className={P}>
          Company does not guarantee uninterrupted uptime, continuous
          availability, or error-free operation of websites, hosting
          environments, deployment systems, automations, integrations,
          third-party platforms, advertising systems, search engine rankings,
          monitoring services, or related services.
        </p>
        <p className={P}>
          Client acknowledges that no website, hosting environment, platform,
          online service, automation system, or third-party provider can be
          guaranteed completely secure or uninterrupted.
        </p>
        <p className={P}>Company shall not be liable for:</p>
        <ul className={UL}>
          <li>security breaches,</li>
          <li>malware,</li>
          <li>unauthorized access,</li>
          <li>data loss,</li>
          <li>website compromises,</li>
          <li>downtime,</li>
          <li>hosting interruptions,</li>
          <li>search engine ranking changes,</li>
          <li>advertising platform issues,</li>
          <li>third-party outages,</li>
          <li>automation failures,</li>
          <li>AI-generated inaccuracies,</li>
          <li>
            or service interruptions resulting from:
            <ul className={UL_NESTED}>
              <li>Client actions or negligence,</li>
              <li>weak or reused passwords,</li>
              <li>unauthorized modifications,</li>
              <li>third-party plugins, integrations, or software,</li>
              <li>account sharing,</li>
              <li>phishing or social engineering attacks,</li>
              <li>hosting or infrastructure provider failures,</li>
              <li>domain or DNS provider issues,</li>
              <li>external cyberattacks,</li>
              <li>changes made by third-party platforms,</li>
              <li>
                or software, services, systems, or infrastructure outside
                Company&apos;s control.
              </li>
            </ul>
          </li>
        </ul>
        <p className={P}>
          Client is responsible for maintaining the security of credentials,
          accounts, third-party services, domains, DNS providers, and access
          permissions under Client&apos;s control.
        </p>
        <p className={P}>
          If Company determines that Client actions, third-party modifications,
          external systems, or unauthorized changes materially contributed to a
          security issue or website compromise, Company shall not be
          responsible for resulting damages, restoration costs, downtime, lost
          revenue, or related losses.
        </p>
        <p className={P}>
          Company&apos;s total liability under this Agreement shall not exceed
          the total amount paid by Client to Company during the prior three (3)
          months immediately preceding the event giving rise to the claim.
        </p>
        <p className={P}>
          In any action arising out of or relating to this Agreement, the
          prevailing Party shall be entitled to recover reasonable attorney
          fees, court costs, and collection expenses.
        </p>

        <h2 className={H2}>19. Indemnification</h2>
        <p className={P}>
          Client agrees to indemnify, defend, and hold harmless Company, its
          owners, employees, contractors, affiliates, and agents from and
          against any claims, liabilities, damages, losses, costs, expenses, or
          legal fees arising out of or related to:
        </p>
        <ul className={UL}>
          <li>Client content,</li>
          <li>Client business activities,</li>
          <li>misuse of services,</li>
          <li>violations of law,</li>
          <li>intellectual property disputes,</li>
          <li>or Client&apos;s breach of this Agreement.</li>
        </ul>
        <p className={P}>
          This obligation shall survive termination of this Agreement.
        </p>

        <h2 className={H2}>20. Force Majeure</h2>
        <p className={P}>
          Company shall not be liable for any delay, interruption, failure, or
          inability to perform services resulting from causes beyond its
          reasonable control, including but not limited to:
        </p>
        <ul className={UL}>
          <li>acts of God,</li>
          <li>natural disasters,</li>
          <li>severe weather,</li>
          <li>fire,</li>
          <li>flood,</li>
          <li>war,</li>
          <li>terrorism,</li>
          <li>labor disputes,</li>
          <li>internet outages,</li>
          <li>cyberattacks,</li>
          <li>power failures,</li>
          <li>hosting failures,</li>
          <li>domain or DNS provider failures,</li>
          <li>third-party platform outages,</li>
          <li>government actions,</li>
          <li>supply chain disruptions,</li>
          <li>
            or failures of external vendors, infrastructure providers, or
            communication systems.
          </li>
        </ul>
        <p className={P}>
          Any deadlines, timelines, or delivery schedules affected by such
          events shall be reasonably extended for the duration of the delay or
          interruption.
        </p>
        <p className={P}>
          Company shall make commercially reasonable efforts to resume services
          as soon as reasonably practicable following the resolution of the
          force majeure event.
        </p>

        <h2 className={H2}>21. Confidentiality</h2>
        <p className={P}>
          Both Parties agree to maintain confidentiality regarding non-public
          business information shared during the relationship, except where
          disclosure is required by law.
        </p>

        <h2 className={H2}>22. Governing Law</h2>
        <p className={P}>
          This Agreement shall be governed by the laws of the State of
          Michigan. Any disputes shall be resolved within courts located in
          Michigan.
        </p>

        <h2 className={H2}>23. Acceptance</h2>
        <p className={P}>
          Client accepts this Agreement by electronically signing, approving a
          proposal, submitting a portal request, making payment, or using
          Company services.
        </p>
        <p className={P}>
          Such actions constitute full acceptance of these terms.
        </p>

        <h2 className={H2}>24. Electronic Signatures</h2>
        <p className={P}>
          Electronic signatures, digital approvals, online acceptances,
          payments, portal submissions, invoices, onboarding forms, and
          electronic communications shall be deemed legally binding and
          enforceable to the fullest extent permitted by applicable law.
        </p>
        <p className={P}>
          Client acknowledges that submission of forms, acceptance of
          proposals, payment of invoices, or use of Company services may
          constitute valid acceptance of this Agreement.
        </p>

        <h2 className={H2}>25. Entire Agreement</h2>
        <p className={P}>
          This Agreement constitutes the entire understanding between the
          Parties and supersedes all prior communications or agreements.
        </p>
        <p className={P}>
          Any modifications must be made in writing.
        </p>

        <h2 className={H2}>Contact</h2>
        <address className={`${P} not-italic`}>
          Macrolight Builder LLC
          <br />
          1902 Villa Rd, Birmingham, MI 48009
          <br />
          Phone:{" "}
          <a href="tel:+12482147957" className={A}>
            (248) 214-7957
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
