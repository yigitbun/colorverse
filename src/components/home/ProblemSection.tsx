import { Eye, Smile, Zap } from "lucide-react";

const PROBLEMS = [
  {
    icon: Eye,
    title: "Hex codes mean nothing to you",
    desc: "Five hex codes on a page tell you nothing about how a palette will actually feel in your work.",
  },
  {
    icon: Zap,
    title: "You waste hours guessing",
    desc: "Pick a palette, drop it in, hate it, try another one — across your site, your slides, your posts. Hours gone.",
  },
  {
    icon: Smile,
    title: "Other tools were built for designers",
    desc: "Color theory, color wheels, generator after generator — great if you have a design background. Overwhelming if you don't.",
  },
];

export function ProblemSection() {
  return (
    <section className="border-b border-neutral-200 bg-neutral-50 dark:border-[#15203A] dark:bg-[#15203A]">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <div className="mb-10 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500 dark:text-[#64748B]">
            The problem
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight dark:text-[#E2E8F0] md:text-4xl">
            Color is supposed to feel good. Not feel like homework.
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {PROBLEMS.map((problem) => (
            <div
              key={problem.title}
              className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-[#1e2d4a] dark:bg-[#0B1220]"
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 dark:bg-[#15203A]">
                <problem.icon className="h-5 w-5 text-neutral-700 dark:text-[#94A3B8]" />
              </div>
              <h3 className="text-lg font-semibold tracking-tight dark:text-[#E2E8F0]">
                {problem.title}
              </h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-[#94A3B8] md:text-[15px]">
                {problem.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
