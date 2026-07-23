import { Link } from "react-router-dom";
import { ArrowRight, Check, Sparkles, Upload } from "lucide-react";
import type { Palette } from "@/data/palettes";
import { ExtractPreviewCard } from "@/components/ExtractPreviewCard";

export function HeroSection({ featured }: { featured: Palette }) {
  return (
    <section className="relative overflow-hidden border-b border-neutral-200 bg-gradient-to-b from-white via-white to-neutral-50 dark:border-[#15203A] dark:from-[#0B1220] dark:via-[#0B1220] dark:to-[#15203A]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-2 md:gap-12 md:py-24">
        <div className="flex flex-col justify-center">
          <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700 dark:bg-[#15203A] dark:text-[#94A3B8]">
            <Sparkles className="h-3 w-3" /> For indie builders &amp; creators
          </div>
          <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight dark:text-[#E2E8F0] md:text-5xl lg:text-6xl">
            Browse palettes. See exactly how{" "}
            <span className="bg-gradient-to-r from-amber-600 to-rose-600 bg-clip-text text-transparent dark:from-[#22D3EE] dark:to-[#A78BFA]">
              each one looks
            </span>{" "}
            in your work.
          </h1>
          <p className="mt-5 max-w-lg text-base text-neutral-600 dark:text-[#94A3B8] md:text-lg">
            Click a palette and see it applied to a real landing page, a slide deck, a
            social post, a shop listing — all before you copy a single color.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 dark:bg-[#22D3EE] dark:text-[#0B1220] dark:hover:bg-[#38BDF8]"
            >
              Browse palettes <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/extract"
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 dark:border-[#15203A] dark:bg-[#15203A] dark:text-[#E2E8F0] dark:hover:bg-[#1e2d4a]"
            >
              <Upload className="h-4 w-4" /> Extract from image
            </Link>
          </div>
          <div className="mt-6 flex items-center gap-2 text-xs text-neutral-500 dark:text-[#64748B]">
            <Check className="h-4 w-4 text-emerald-600 dark:text-[#22D3EE]" />
            Free forever · No credit card · No spam
          </div>
        </div>
        <div className="relative flex items-center">
          <ExtractPreviewCard palette={featured} />
          <div className="absolute -right-6 -bottom-6 hidden h-24 w-24 rounded-2xl bg-amber-200/40 blur-3xl dark:bg-[#22D3EE]/10 md:block" />
          <div className="absolute -left-6 -top-6 hidden h-24 w-24 rounded-2xl bg-rose-200/40 blur-3xl dark:bg-[#A78BFA]/10 md:block" />
        </div>
      </div>
    </section>
  );
}
