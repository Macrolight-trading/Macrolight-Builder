"use client";

import { FormEvent, useState } from "react";
import Button from "./Button";

type FormStatus = "idle" | "submitting" | "success" | "error";

type ContactFormProps = {
  /**
   * `marketing` — dark Macrolight /contact page (html has .dark).
   * `preview` — light "site in site" industry embed (explicit light fields).
   */
  variant?: "marketing" | "preview";
};

const inputMarketing =
  "block w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm transition placeholder:text-zinc-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-white/10 dark:bg-white/[0.03] dark:text-white";
const inputPreview =
  "block w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm transition placeholder:text-zinc-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20";

export default function ContactForm({
  variant = "marketing",
}: ContactFormProps) {
  const isPreview = variant === "preview";
  const [status, setStatus] = useState<FormStatus>("idle");
  const [form, setForm] = useState({
    name: "",
    business: "",
    email: "",
    message: "",
  });

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    try {
      await new Promise((r) => setTimeout(r, 900));
      setStatus("success");
      setForm({ name: "", business: "", email: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div
        className={
          isPreview
            ? "rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm animate-scale-in"
            : "surface rounded-2xl p-8 text-center animate-scale-in"
        }
      >
        <div className="mx-auto mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-md dark:shadow-glow-cyan">
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
        <h3
          className={
            isPreview
              ? "text-2xl font-bold text-zinc-900"
              : "text-2xl font-bold text-zinc-900 dark:text-white"
          }
        >
          Request received
        </h3>
        <p
          className={
            isPreview
              ? "mt-2 text-zinc-600"
              : "mt-2 text-zinc-600 dark:text-white/70"
          }
        >
          We&apos;ll review your site and send your free audit within 24 hours.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className={
            isPreview
              ? "mt-6 text-sm text-zinc-500 hover:text-zinc-800 underline underline-offset-4"
              : "mt-6 text-sm text-zinc-500 dark:text-white/60 hover:text-zinc-800 dark:hover:text-white underline underline-offset-4"
          }
        >
          Send another request
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className={
        isPreview
          ? "space-y-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8"
          : "surface space-y-5 rounded-2xl p-6 sm:p-8"
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field
          label="Name"
          name="name"
          required
          value={form.name}
          onChange={onChange}
          placeholder="Jane Doe"
          isPreview={isPreview}
        />
        <Field
          label="Business Name"
          name="business"
          required
          value={form.business}
          onChange={onChange}
          placeholder="Acme Plumbing"
          isPreview={isPreview}
        />
      </div>

      <Field
        label="Email"
        name="email"
        type="email"
        required
        value={form.email}
        onChange={onChange}
        placeholder="you@business.com"
        isPreview={isPreview}
      />

      <div>
        <label
          htmlFor="message"
          className={
            isPreview
              ? "mb-2 block text-sm font-medium text-zinc-700"
              : "mb-2 block text-sm font-medium text-zinc-700 dark:text-white/80"
          }
        >
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          value={form.message}
          onChange={onChange}
          placeholder="Tell us about your business, current website, and what you're hoping to achieve..."
          rows={5}
          className={isPreview ? inputPreview : inputMarketing}
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        disabled={status === "submitting"}
        onLight={isPreview}
      >
        {status === "submitting" ? "Sending..." : "Request Free Website Audit"}
      </Button>

      {status === "error" && (
        <p
          className={
            isPreview
              ? "text-center text-sm text-red-600"
              : "text-center text-sm text-red-600 dark:text-red-400"
          }
        >
          Something went wrong. Please try again or email us directly.
        </p>
      )}

      <p
        className={
          isPreview
            ? "text-center text-xs text-zinc-500"
            : "text-center text-xs text-zinc-500 dark:text-white/40"
        }
      >
        We respond within one business day. No spam, ever.
      </p>
    </form>
  );
}

interface FieldProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  required?: boolean;
  placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isPreview?: boolean;
}

function Field({
  label,
  name,
  type = "text",
  value,
  required,
  placeholder,
  onChange,
  isPreview = false,
}: FieldProps) {
  return (
    <div>
      <label
        htmlFor={name}
        className={
          isPreview
            ? "mb-2 block text-sm font-medium text-zinc-700"
            : "mb-2 block text-sm font-medium text-zinc-700 dark:text-white/80"
        }
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className={isPreview ? inputPreview : inputMarketing}
      />
    </div>
  );
}
