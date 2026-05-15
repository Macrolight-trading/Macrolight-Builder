"use client";

import { FormEvent, useState } from "react";
import { reportAdConversion } from "@/lib/gtag";
import Button from "./Button";

type FormStatus = "idle" | "submitting" | "success" | "error";

interface ContactFormProps {
  variant?: "default" | "preview";
  industry?: string;
}

const inputCls =
  "block w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 transition focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20";

const selectCls = inputCls + " appearance-none bg-no-repeat bg-right pr-10";

// --- Option lists for the questionnaire ----------------------------------

const INDUSTRY_OPTIONS = [
  "Home services (plumbing, HVAC, roofing, electrical)",
  "Construction / contracting",
  "Cleaning services",
  "Landscaping / lawn care",
  "Auto / mechanical",
  "Health & wellness (clinic, dental, chiropractic)",
  "Fitness / gym / studio",
  "Beauty / salon / spa",
  "Restaurant / food / catering",
  "Retail / e-commerce",
  "Real estate",
  "Legal / law firm",
  "Accounting / financial services",
  "Consulting / coaching",
  "Marketing / creative agency",
  "Software / SaaS",
  "Education / tutoring",
  "Nonprofit",
  "Other",
];

const GOAL_OPTIONS = [
  "Generate more leads / phone calls",
  "Book appointments online",
  "Sell products online",
  "Look more credible / professional",
  "Rank higher on Google (SEO)",
  "Showcase work / portfolio",
  "Replace an outdated website",
  "Launch a brand-new business",
];

const PAGE_OPTIONS = [
  "Home",
  "About",
  "Services",
  "Pricing",
  "Portfolio / Gallery",
  "Testimonials / Reviews",
  "Blog",
  "FAQ",
  "Contact",
  "Online booking",
  "Online store / Shop",
  "Customer login / portal",
];

const STYLE_OPTIONS = [
  "Modern & minimal",
  "Bold & vibrant",
  "Professional & corporate",
  "Warm & friendly",
  "Luxury & elegant",
  "Rugged & industrial",
  "Not sure — please advise",
];

const TIMELINE_OPTIONS = [
  "ASAP — within 2 weeks",
  "2–4 weeks",
  "1–2 months",
  "Flexible / no rush",
];

const BRAND_ASSET_OPTIONS = [
  "I have a logo",
  "I have brand colors / fonts",
  "I have professional photos",
  "I need help with branding / design",
];

// -------------------------------------------------------------------------

interface FormState {
  name: string;
  company: string;
  email: string;
  phone: string;
  currentWebsite: string;
  industry: string;
  industryOther: string;
  oneLiner: string;
  targetCustomer: string;
  services: string;
  serviceArea: string;
  differentiators: string;
  goals: string[];
  pages: string[];
  style: string;
  inspiration: string;
  brandAssets: string[];
  timeline: string;
  notes: string;
}

const initialForm: FormState = {
  name: "",
  company: "",
  email: "",
  phone: "",
  currentWebsite: "",
  industry: "",
  industryOther: "",
  oneLiner: "",
  targetCustomer: "",
  services: "",
  serviceArea: "",
  differentiators: "",
  goals: [],
  pages: [],
  style: "",
  inspiration: "",
  brandAssets: [],
  timeline: "",
  notes: "",
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function ContactForm({ industry }: ContactFormProps = {}) {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [form, setForm] = useState<FormState>(initialForm);

  const onChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleArrayValue = (key: keyof FormState, value: string) => {
    setForm((prev) => {
      const current = prev[key] as string[];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [key]: next };
    });
  };

  const buildMessage = (f: FormState): string => {
    const resolvedIndustry =
      f.industry === "Other" && f.industryOther
        ? `Other — ${f.industryOther}`
        : f.industry;

    const lines: string[] = [];
    const push = (label: string, value: string) => {
      if (value && value.trim().length > 0) {
        lines.push(`${label}:\n${value.trim()}\n`);
      }
    };

    push("Industry", resolvedIndustry);
    push("Current website", f.currentWebsite);
    push("In one sentence, what the business does", f.oneLiner);
    push("Target customer", f.targetCustomer);
    push("Services / products offered", f.services);
    push("Service area / location", f.serviceArea);
    push("Top reasons customers choose them", f.differentiators);
    push("Primary goals for the new site", f.goals.join(", "));
    push("Pages needed", f.pages.join(", "));
    push("Style direction", f.style);
    push("Sites / competitors they like", f.inspiration);
    push("Brand assets on hand", f.brandAssets.join(", "));
    push("Timeline", f.timeline);
    push("Anything else", f.notes);

    return lines.join("\n").trim();
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    try {
      const message = buildMessage(form);
      const resolvedIndustry =
        form.industry === "Other" && form.industryOther
          ? `Other — ${form.industryOther}`
          : form.industry;

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          company: form.company,
          message,
          industry: resolvedIndustry || industry || "",
        }),
      });
      if (!res.ok) throw new Error("Failed to submit");
      reportAdConversion();
      setStatus("success");
      setForm(initialForm);
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="surface rounded-2xl p-8 text-center animate-scale-in">
        <div className="mx-auto mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-md">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="h-6 w-6 text-white"
            aria-hidden
          >
            <path
              d="M5 13l4 4L19 7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900">Request received</h3>
        <p className="mt-2 text-gray-500">
          Thanks for the detail — we&apos;ll review your business and send your
          free audit and a build proposal within 24 hours.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 text-sm text-gray-500 hover:text-gray-800 underline underline-offset-4 transition-colors"
        >
          Send another request
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="surface space-y-8 rounded-2xl p-6 sm:p-8"
    >
      {/* --- 1. Contact basics ---------------------------------------- */}
      <FormSection
        step={1}
        title="The basics"
        hint="So we know who to send the audit to."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field
            label="Your name"
            name="name"
            required
            value={form.name}
            onChange={onChange}
            placeholder="Jane Doe"
          />
          <Field
            label="Business name"
            name="company"
            required
            value={form.company}
            onChange={onChange}
            placeholder="Acme Plumbing"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field
            label="Email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={onChange}
            placeholder="you@business.com"
          />
          <Field
            label="Phone (optional)"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={onChange}
            placeholder="(555) 123-4567"
          />
        </div>
        <Field
          label="Current website (if you have one)"
          name="currentWebsite"
          type="url"
          value={form.currentWebsite}
          onChange={onChange}
          placeholder="https://yourbusiness.com"
          hint="Leave blank if you don't have one yet — that's fine."
        />
      </FormSection>

      {/* --- 2. About the business ------------------------------------ */}
      <FormSection
        step={2}
        title="Tell us about your business"
        hint="The more specific you are here, the better we can shape the site."
      >
        <SelectField
          label="What industry are you in?"
          name="industry"
          required
          value={form.industry}
          onChange={onChange}
          options={INDUSTRY_OPTIONS}
          placeholder="Choose the closest match"
        />
        {form.industry === "Other" && (
          <Field
            label="Tell us your industry"
            name="industryOther"
            value={form.industryOther}
            onChange={onChange}
            placeholder="e.g. drone surveying for farms"
          />
        )}

        <TextareaField
          label="In one sentence, what does your business do?"
          name="oneLiner"
          required
          rows={2}
          value={form.oneLiner}
          onChange={onChange}
          placeholder="e.g. We install and service residential HVAC systems across the greater Columbus area."
          hint="This usually becomes the headline on your homepage."
        />

        <TextareaField
          label="Who are your ideal customers?"
          name="targetCustomer"
          rows={3}
          value={form.targetCustomer}
          onChange={onChange}
          placeholder="e.g. Homeowners 35–65 in suburban Columbus, $90k+ household income, who care about quick response and clean work."
          hint="Be specific — age range, location, what problem they're trying to solve."
        />

        <TextareaField
          label="What services or products do you offer?"
          name="services"
          rows={4}
          value={form.services}
          onChange={onChange}
          placeholder="List your main services or product lines, one per line."
          hint="One per line is fine. We'll turn these into your services pages."
        />

        <Field
          label="Where do you operate? (city, region, or 'online only')"
          name="serviceArea"
          value={form.serviceArea}
          onChange={onChange}
          placeholder="e.g. Columbus, OH and 30-mile radius"
        />

        <TextareaField
          label="What are the top 3 reasons customers choose you over competitors?"
          name="differentiators"
          rows={3}
          value={form.differentiators}
          onChange={onChange}
          placeholder={
            "1.\n2.\n3."
          }
          hint="This is what makes you not-a-commodity. Awards, guarantees, years in business, certifications, owner-operated, etc."
        />
      </FormSection>

      {/* --- 3. Goals & scope ----------------------------------------- */}
      <FormSection
        step={3}
        title="What should the site do?"
        hint="Pick everything that applies."
      >
        <CheckboxGroup
          label="Primary goals (select all that apply)"
          name="goals"
          options={GOAL_OPTIONS}
          values={form.goals}
          onToggle={(v) => toggleArrayValue("goals", v)}
        />

        <CheckboxGroup
          label="Pages you'll likely need"
          name="pages"
          options={PAGE_OPTIONS}
          values={form.pages}
          onToggle={(v) => toggleArrayValue("pages", v)}
        />
      </FormSection>

      {/* --- 4. Look & feel ------------------------------------------- */}
      <FormSection step={4} title="Look & feel">
        <SelectField
          label="Which style fits your brand best?"
          name="style"
          value={form.style}
          onChange={onChange}
          options={STYLE_OPTIONS}
          placeholder="Pick a direction"
        />

        <TextareaField
          label="Any websites or competitors you like? (optional)"
          name="inspiration"
          rows={3}
          value={form.inspiration}
          onChange={onChange}
          placeholder={"https://example1.com — love their hero section\nhttps://example2.com — clean pricing page"}
          hint="Links + a quick note on what you like helps us nail the design fast."
        />

        <CheckboxGroup
          label="What brand assets do you already have?"
          name="brandAssets"
          options={BRAND_ASSET_OPTIONS}
          values={form.brandAssets}
          onToggle={(v) => toggleArrayValue("brandAssets", v)}
        />
      </FormSection>

      {/* --- 5. Logistics --------------------------------------------- */}
      <FormSection step={5} title="Timeline">
        <SelectField
          label="When do you need it live?"
          name="timeline"
          value={form.timeline}
          onChange={onChange}
          options={TIMELINE_OPTIONS}
          placeholder="Pick a timeline"
        />

        <TextareaField
          label="Anything else we should know?"
          name="notes"
          rows={3}
          value={form.notes}
          onChange={onChange}
          placeholder="Quirks, constraints, integrations (Stripe, HubSpot, scheduling tools), domains you already own, etc."
        />
      </FormSection>

      {/* --- Submit --------------------------------------------------- */}
      <div className="space-y-4 pt-2">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          disabled={status === "submitting"}
        >
          {status === "submitting"
            ? "Sending..."
            : "Request Free Website Audit"}
        </Button>

        {status === "error" && (
          <p className="text-center text-sm text-red-600">
            Something went wrong. Please try again or email us directly.
          </p>
        )}

        <p className="text-center text-xs text-gray-400">
          We respond within one business day. No spam, ever.
        </p>
      </div>
    </form>
  );
}

// -------------------------------------------------------------------------
// Helper components
// -------------------------------------------------------------------------

interface FormSectionProps {
  step: number;
  title: string;
  hint?: string;
  children: React.ReactNode;
}

function FormSection({ step, title, hint, children }: FormSectionProps) {
  return (
    <fieldset className="space-y-5 border-t border-gray-100 pt-6 first:border-t-0 first:pt-0">
      <legend className="flex items-center gap-3 mb-1">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-violet-50 border border-violet-100 text-violet-600 text-xs font-semibold">
          {step}
        </span>
        <span className="text-base font-semibold text-gray-900">{title}</span>
      </legend>
      {hint && (
        <p className="-mt-2 text-xs text-gray-500 pl-10">{hint}</p>
      )}
      <div className="space-y-5">{children}</div>
    </fieldset>
  );
}

interface FieldProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function Field({
  label,
  name,
  type = "text",
  value,
  required,
  placeholder,
  hint,
  onChange,
}: FieldProps) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-violet-600"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className={inputCls}
      />
      {hint && <p className="mt-1.5 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

interface TextareaFieldProps {
  label: string;
  name: string;
  value: string;
  rows?: number;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

function TextareaField({
  label,
  name,
  value,
  rows = 4,
  required,
  placeholder,
  hint,
  onChange,
}: TextareaFieldProps) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-violet-600"> *</span>}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        rows={rows}
        className={inputCls}
      />
      {hint && <p className="mt-1.5 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

interface SelectFieldProps {
  label: string;
  name: string;
  value: string;
  options: string[];
  required?: boolean;
  placeholder?: string;
  hint?: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

function SelectField({
  label,
  name,
  value,
  options,
  required,
  placeholder,
  hint,
  onChange,
}: SelectFieldProps) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-violet-600"> *</span>}
      </label>
      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className={selectCls}
        >
          <option value="" disabled>
            {placeholder || "Choose one"}
          </option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <svg
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.06l3.71-3.83a.75.75 0 1 1 1.08 1.04l-4.25 4.39a.75.75 0 0 1-1.08 0L5.21 8.27a.75.75 0 0 1 .02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      {hint && <p className="mt-1.5 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

interface CheckboxGroupProps {
  label: string;
  name: string;
  options: string[];
  values: string[];
  onToggle: (value: string) => void;
}

function CheckboxGroup({
  label,
  name,
  options,
  values,
  onToggle,
}: CheckboxGroupProps) {
  return (
    <div>
      <p className="mb-2 block text-sm font-medium text-gray-700">{label}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map((opt) => {
          const checked = values.includes(opt);
          const id = `${name}-${opt.replace(/\s+/g, "-").toLowerCase()}`;
          return (
            <label
              key={opt}
              htmlFor={id}
              className={
                "flex items-start gap-3 rounded-lg border px-3 py-2.5 text-sm cursor-pointer transition " +
                (checked
                  ? "border-violet-300 bg-violet-50 text-gray-900"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300")
              }
            >
              <input
                id={id}
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(opt)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
              />
              <span className="leading-snug">{opt}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
