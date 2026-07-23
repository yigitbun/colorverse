import { useState } from "react";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { EmailCaptureModal } from "@/components/EmailCaptureModal";

const FREE_FEATURES = [
  "Browse all curated palettes",
  "See palettes in 4 mockup types",
  "Basic CSS export",
  "Image-to-palette extraction",
  "Click-to-copy hex codes",
];

const PRO_FEATURES = [
  "Everything in Free",
  "All export formats (Tailwind, SCSS, JSON, SVG)",
  "Unlimited image extractions",
  "Save unlimited palettes",
  "Brand-kit organization",
  "Custom palette creation",
];

export function PricingSection() {
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  return (
    <section
      id="pricing"
      className="border-b border-neutral-200 bg-neutral-50 dark:border-[#15203A] dark:bg-[#15203A]"
    >
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <div className="mb-10 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500 dark:text-[#64748B]">
            Pricing
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight dark:text-[#E2E8F0] md:text-4xl">
            Free forever. Pro when you're shipping.
          </h2>
        </div>
        <div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-2 md:gap-6">
          {/* Free */}
          <div className="rounded-3xl border border-neutral-200 bg-white p-7 dark:border-[#1e2d4a] dark:bg-[#0B1220]">
            <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-[#64748B]">
              Free
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-bold tracking-tight dark:text-[#E2E8F0]">
                $0
              </span>
              <span className="text-sm text-neutral-500 dark:text-[#64748B]">forever</span>
            </div>
            <p className="mt-2 text-sm text-neutral-600 dark:text-[#94A3B8]">
              Browse, preview in real contexts, and export CSS — no account needed.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {FREE_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2 dark:text-[#94A3B8]">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-[#22D3EE]" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/explore"
              className="mt-7 inline-flex w-full items-center justify-center rounded-xl border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50 dark:border-[#1e2d4a] dark:bg-[#15203A] dark:text-[#E2E8F0] dark:hover:bg-[#1e2d4a]"
            >
              Start free
            </Link>
          </div>

          {/* Pro */}
          <div className="relative rounded-3xl border border-neutral-900 bg-neutral-900 p-7 text-white dark:border-[#22D3EE]/30 dark:bg-[#0d1730]">
            <div className="absolute -top-3 left-7 inline-flex rounded-full bg-amber-400 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-900 dark:bg-[#22D3EE] dark:text-[#0B1220]">
              Coming soon
            </div>
            <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-[#64748B]">
              Pro
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-bold tracking-tight">$12</span>
              <span className="text-sm text-neutral-400 dark:text-[#64748B]">/ month</span>
            </div>
            <p className="mt-2 text-sm text-neutral-300 dark:text-[#94A3B8]">
              For builders who ship.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {PRO_FEATURES.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2 text-neutral-300 dark:text-[#94A3B8]"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-400 dark:text-[#22D3EE]" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setWaitlistOpen(true)}
              className="mt-7 inline-flex w-full items-center justify-center rounded-xl bg-amber-400 px-5 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-amber-300 dark:bg-[#22D3EE] dark:text-[#0B1220] dark:hover:bg-[#38BDF8]"
            >
              Join the waitlist
            </button>
          </div>
        </div>
      </div>
      <EmailCaptureModal
        open={waitlistOpen}
        variant="waitlist"
        onClose={() => setWaitlistOpen(false)}
        onSuccess={() => setWaitlistOpen(false)}
      />
    </section>
  );
}
