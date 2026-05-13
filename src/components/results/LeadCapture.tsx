"use client";

import { useState } from "react";

interface LeadCaptureProps {
  auditId: string;
  totalMonthlySavings: number;
  isOptimal: boolean;
}

export function LeadCapture({
  auditId,
  totalMonthlySavings,
  isOptimal,
}: LeadCaptureProps) {
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return;
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          companyName: companyName || undefined,
          role: role || undefined,
          auditId,
          totalMonthlySavings,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-emerald-50 p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-3xl">
          📧
        </div>
        <h3 className="font-display text-xl text-ink">Check your inbox!</h3>
        <p className="mt-2 text-sm text-ink-muted font-body leading-relaxed max-w-sm mx-auto">
          We&apos;ve sent your audit summary to{" "}
          <span className="font-semibold text-ink">{email}</span>.
          {totalMonthlySavings >= 500 &&
            " A Credex advisor will reach out within 24 hours to discuss your savings opportunities."}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-ink/5 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start gap-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-surface-muted text-xl">
          {isOptimal ? "🔔" : "📬"}
        </div>
        <div>
          <h3 className="font-display text-xl text-ink">
            {isOptimal ? "Get notified when new optimizations apply" : "Save your audit report"}
          </h3>
          <p className="mt-1 text-sm text-ink-muted font-body">
            {isOptimal
              ? "We'll email you when pricing changes create new savings for your stack."
              : "Get a copy of this audit + personalized next steps by email."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Honeypot — hidden from humans */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input
            id="website"
            name="website"
            type="text"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <div>
          <label htmlFor="lead-email" className="block text-xs font-semibold uppercase tracking-wide text-ink-muted mb-1.5 font-body">
            Work email *
          </label>
          <input
            id="lead-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="input-field"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="lead-company" className="block text-xs font-semibold uppercase tracking-wide text-ink-muted mb-1.5 font-body">
              Company (optional)
            </label>
            <input
              id="lead-company"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Acme Inc."
              className="input-field"
            />
          </div>
          <div>
            <label htmlFor="lead-role" className="block text-xs font-semibold uppercase tracking-wide text-ink-muted mb-1.5 font-body">
              Role (optional)
            </label>
            <input
              id="lead-role"
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Engineering Manager"
              className="input-field"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3" role="alert">
            <svg className="h-4 w-4 flex-shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-700 font-body">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-brand-600 py-3.5 text-sm font-semibold text-white shadow-sm shadow-brand-600/20 transition-all hover:bg-brand-500 hover:shadow-brand-500/30 disabled:opacity-50 disabled:cursor-not-allowed font-body"
        >
          {isLoading
            ? "Sending..."
            : isOptimal
            ? "Notify Me of Changes"
            : "Email My Audit Report"}
        </button>

        <p className="text-center text-xs text-ink-light font-body">
          No spam. Just your audit and relevant updates from Credex.
        </p>
      </form>
    </div>
  );
}
