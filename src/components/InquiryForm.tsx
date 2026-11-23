"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ArrowRight, ChevronDown, LoaderCircle, Mail, RotateCcw } from "lucide-react";
import {
  HONEYPOT_FIELD,
  INQUIRY_LIMITS,
  PROJECT_TYPES,
  inquiryMailto,
  validateInquiry,
  type InquiryErrors,
  type InquiryField,
} from "@/lib/inquiry";
import { site } from "@/lib/content";

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; name: string; email: string }
  | { kind: "fallback"; mailto: string }
  | { kind: "error"; message: string };

const FIELD_ORDER: InquiryField[] = ["name", "email", "projectType", "brief"];

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}

function Field({ id, label, error, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}

function errorProps(id: string, error: string | undefined) {
  return error ? { "aria-invalid": true as const, "aria-describedby": `${id}-error` } : {};
}

export function InquiryForm() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [errors, setErrors] = useState<InquiryErrors>({});
  const formRef = useRef<HTMLFormElement>(null);
  const overlayHeadingRef = useRef<HTMLHeadingElement>(null);

  const submitting = status.kind === "submitting";
  const overlayOpen = status.kind === "success" || status.kind === "fallback";

  useEffect(() => {
    if (overlayOpen) overlayHeadingRef.current?.focus();
  }, [overlayOpen]);

  const focusFirstInvalid = (fieldErrors: InquiryErrors) => {
    const first = FIELD_ORDER.find((field) => fieldErrors[field]);
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  };

  const clearError = (field: InquiryField) => {
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const result = validateInquiry({
      name: data.get("name"),
      email: data.get("email"),
      projectType: data.get("projectType"),
      brief: data.get("brief"),
    });

    if (!result.ok) {
      setErrors(result.errors);
      focusFirstInvalid(result.errors);
      return;
    }

    setErrors({});
    setStatus({ kind: "submitting" });

    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...result.data, [HONEYPOT_FIELD]: String(data.get(HONEYPOT_FIELD) ?? "") }),
      });

      if (response.ok) {
        form.reset();
        setStatus({ kind: "success", name: result.data.name, email: result.data.email });
        return;
      }

      const body = (await response.json().catch(() => null)) as { error?: string; fields?: InquiryErrors } | null;

      if (response.status === 400 && body?.fields) {
        setErrors(body.fields);
        setStatus({ kind: "idle" });
        focusFirstInvalid(body.fields);
        return;
      }

      if (response.status === 503 && body?.error === "not_configured") {
        // No delivery channel configured on the server: hand the brief to the visitor's mail app.
        const mailto = inquiryMailto(site.email, result.data);
        setStatus({ kind: "fallback", mailto });
        window.location.href = mailto;
        return;
      }

      setStatus({
        kind: "error",
        message:
          response.status === 429
            ? "Too many messages from this connection. Please wait a few minutes, or email me directly at"
            : "Your message couldn’t be sent just now. Please try again, or email me directly at",
      });
    } catch {
      setStatus({
        kind: "error",
        message: "Connection problem: your message wasn’t sent. Please try again, or email me directly at",
      });
    }
  };

  const firstName = status.kind === "success" ? status.name.split(" ")[0] : "";

  return (
    <div className="panel h-full">
      <form
        ref={formRef}
        onSubmit={onSubmit}
        noValidate
        inert={overlayOpen}
        aria-hidden={overlayOpen || undefined}
        aria-labelledby="inquiry-title"
        className="flex h-full flex-col gap-5"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h3 id="inquiry-title" className="h3">
            Send a message
          </h3>
          <p className="mono-label text-bone-faint">Takes about a minute</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="inquiry-name" label="Name" error={errors.name}>
            <input
              id="inquiry-name"
              name="name"
              type="text"
              autoComplete="name"
              required
              maxLength={INQUIRY_LIMITS.nameMax}
              placeholder="Your full name"
              className="field"
              onChange={() => clearError("name")}
              {...errorProps("inquiry-name", errors.name)}
            />
          </Field>
          <Field id="inquiry-email" label="Email" error={errors.email}>
            <input
              id="inquiry-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              maxLength={INQUIRY_LIMITS.emailMax}
              placeholder="you@organization.com"
              className="field"
              onChange={() => clearError("email")}
              {...errorProps("inquiry-email", errors.email)}
            />
          </Field>
        </div>

        <Field id="inquiry-type" label="Project type" error={errors.projectType}>
          <div className="relative">
            <select
              id="inquiry-type"
              name="projectType"
              required
              defaultValue=""
              className="field"
              onChange={() => clearError("projectType")}
              {...errorProps("inquiry-type", errors.projectType)}
            >
              <option value="" disabled>
                Choose one
              </option>
              {PROJECT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-bone-faint"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </div>
        </Field>

        <Field id="inquiry-brief" label="Message" error={errors.brief}>
          <textarea
            id="inquiry-brief"
            name="brief"
            required
            rows={5}
            maxLength={INQUIRY_LIMITS.briefMax}
            placeholder="Tell me a bit about what you need."
            className="field"
            onChange={() => clearError("brief")}
            {...errorProps("inquiry-brief", errors.brief)}
          />
        </Field>

        <div className="honeypot" aria-hidden="true">
          <label htmlFor={HONEYPOT_FIELD}>Company website</label>
          <input id={HONEYPOT_FIELD} name={HONEYPOT_FIELD} type="text" tabIndex={-1} autoComplete="off" />
        </div>

        {status.kind === "error" && (
          <div className="form-alert" role="alert">
            {status.message}{" "}
            <a href={`mailto:${site.email}`} className="font-medium text-bone underline underline-offset-4">
              {site.email}
            </a>
            .
          </div>
        )}

        <div className="mt-auto flex flex-col-reverse gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-bone-faint">Only used to reply to you.</p>
          <button
            type="submit"
            data-magnetic
            disabled={submitting}
            className="btn btn-primary btn-lg w-full sm:w-auto"
          >
            {submitting ? (
              <>
                <LoaderCircle className="spin size-[18px]" strokeWidth={1.75} aria-hidden="true" />
                Sending…
              </>
            ) : (
              <>
                Send Message
                <ArrowRight className="btn-icon btn-icon-right size-[18px]" strokeWidth={1.75} aria-hidden="true" />
              </>
            )}
          </button>
        </div>
        <p className="sr-only" aria-live="polite">
          {submitting ? "Sending your brief…" : ""}
        </p>
      </form>

      {status.kind === "success" && (
        <div className="form-overlay" role="status">
          <span className="success-mark">
            <svg
              viewBox="0 0 24 24"
              className="size-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          </span>
          <p className="mono-label text-ok">Message received</p>
          <h3
            ref={overlayHeadingRef}
            tabIndex={-1}
            className="h3 max-w-[18ch] text-[clamp(1.6rem,1.2rem+1.4vw,2.2rem)] leading-[1.08] tracking-[-0.03em]"
          >
            Thanks, {firstName}!
          </h3>
          <p className="lede max-w-[42ch]">
            I’ll reply to <span className="text-bone">{status.email}</span> within one business day.
          </p>
          <button
            type="button"
            data-magnetic
            className="btn btn-ghost btn-sm mt-2"
            onClick={() => setStatus({ kind: "idle" })}
          >
            <RotateCcw className="size-4" strokeWidth={1.5} aria-hidden="true" />
            Send another message
          </button>
        </div>
      )}

      {status.kind === "fallback" && (
        <div className="form-overlay" data-tone="notice" role="status">
          <span className="notice-mark">
            <Mail className="size-6" strokeWidth={1.5} aria-hidden="true" />
          </span>
          <p className="mono-label text-signal">One more step</p>
          <h3
            ref={overlayHeadingRef}
            tabIndex={-1}
            className="h3 max-w-[18ch] text-[clamp(1.6rem,1.2rem+1.4vw,2.2rem)] leading-[1.08] tracking-[-0.03em]"
          >
            Your email is ready to send.
          </h3>
          <p className="lede max-w-[44ch]">
            Just press send. Nothing opened? Email{" "}
            <a href={`mailto:${site.email}`} className="text-bone underline underline-offset-4">
              {site.email}
            </a>{" "}
            directly.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <a href={status.mailto} className="btn btn-primary btn-sm">
              <Mail className="size-4" strokeWidth={1.75} aria-hidden="true" />
              Open email again
            </a>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setStatus({ kind: "idle" })}>
              Back to the form
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
