const STATS = [
  { value: "10+", label: "curated palettes" },
  { value: "4", label: "mockup types" },
  { value: "5", label: "export formats" },
  { value: "100%", label: "client-side" },
  { value: "$0", label: "to get started" },
];

export function StatsStrip() {
  return (
    <section className="border-b border-neutral-200 bg-white dark:border-[#15203A] dark:bg-[#0B1220]">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold tracking-tight dark:text-[#E2E8F0]">
                {stat.value}
              </div>
              <div className="mt-0.5 text-xs text-neutral-500 dark:text-[#64748B]">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
