import { Code, Layers, Palette } from "lucide-react";

const STEPS = [
  {
    n: 1,
    title: "Browse curated palettes",
    desc: "Hand-picked palettes shown with their mood photo so you feel the vibe before you commit.",
    icon: Palette,
  },
  {
    n: 2,
    title: "See it applied to your work",
    desc: "Click between landing pages, slides, social posts, shop listings — same palette, four real contexts.",
    icon: Layers,
  },
  {
    n: 3,
    title: "Export to your stack",
    desc: "CSS, SCSS, Tailwind, JSON, hex list. One click. Ready for your IDE, Figma, or pitch deck.",
    icon: Code,
  },
];

export function HowItWorksSection() {
  return (
    <section className="border-b border-neutral-200 bg-white dark:border-[#15203A] dark:bg-[#0B1220]">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <div className="mb-12 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500 dark:text-[#64748B]">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight dark:text-[#E2E8F0] md:text-4xl">
            Three steps. No design degree.
          </h2>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {STEPS.map((step) => (
            <div
              key={step.n}
              className="relative rounded-2xl border border-neutral-200 bg-neutral-50 p-6 dark:border-[#1e2d4a] dark:bg-[#15203A]"
            >
              <div className="absolute -top-4 left-6 inline-flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 text-sm font-bold text-white dark:bg-[#22D3EE] dark:text-[#0B1220]">
                {step.n}
              </div>
              <div className="mb-3 mt-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-[#0B1220]">
                <step.icon className="h-5 w-5 text-neutral-700 dark:text-[#94A3B8]" />
              </div>
              <h3 className="text-lg font-semibold tracking-tight dark:text-[#E2E8F0]">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-[#94A3B8] md:text-[15px]">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
