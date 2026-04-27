"use client";

import { FormEvent, useState } from "react";
import Button from "./Button";

type FormStatus = "idle" | "submitting" | "success" | "error";

// variant prop kept for backwards-compat with industry showcase pages
interface ContactFormProps {
  variant?: "default" | "preview";
}

const inputCls =
  "block w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 transition focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function ContactForm(_props: ContactFormProps = {}) {
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
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          company: form.business,
          business: form.business,
          message: form.message,
        }),
      });
      if (!res.ok) throw new Error("Failed to submit");
      setStatus("success");
      setForm({ name: "", business: "", email: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="surface rounded-2xl p-8 text-center animate-scale-in">
        <div className="mx-auto mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-md">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-6 w-6 text-white" aria-hidden>
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900">Request received</h3>
        <p className="mt-2 text-gray-500">
          We&apos;ll review your site and send your free audit within 24 hours.
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
      className="surface space-y-5 rounded-2xl p-6 sm:p-8"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Name" name="name" required value={form.name} onChange={onChange} placeholder="Jane Doe" />
        <Field label="Business Name" name="business" required value={form.business} onChange={onChange} placeholder="Acme Plumbing" />
      </div>

      <Field label="Email" name="email" type="email" required value={form.email} onChange={onChange} placeholder="you@business.com" />

      <div>
        <label htmlFor="message" className="mb-2 block text-sm font-medium text-gray-700">
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
          className={inputCls}
        />
      </div>

      <Button type="submit" variant="primary" size="lg" fullWidth disabled={status === "submitting"}>
        {status === "submitting" ? "Sending..." : "Request Free Website Audit"}
      </Button>

      {status === "error" && (
        <p className="text-center text-sm text-red-600">
          Something went wrong. Please try again or email us directly.
        </p>
      )}

      <p className="text-center text-xs text-gray-400">
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
}

function Field({ label, name, type = "text", value, required, placeholder, onChange }: FieldProps) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-sm font-medium text-gray-700">
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
        className={inputCls}
      />
    </div>
  );
}
