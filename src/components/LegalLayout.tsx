import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Palette } from "lucide-react";

export function LegalLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 md:py-24">
      <div className="mb-10">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 transition hover:text-neutral-900 dark:text-[#64748B] dark:hover:text-[#E2E8F0]"
        >
          <Palette className="h-3.5 w-3.5" /> ColorVerse
        </Link>
      </div>
      <h1 className="mb-10 text-4xl font-bold tracking-tight dark:text-[#E2E8F0]">
        {title}
      </h1>
      <div className="space-y-8 text-[15px] leading-relaxed text-neutral-600 dark:text-[#94A3B8]">
        {children}
      </div>
    </main>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h2 className="mb-2 text-base font-semibold text-neutral-900 dark:text-[#E2E8F0]">
        {title}
      </h2>
      {children}
    </div>
  );
}
