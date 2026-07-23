const USE_CASES = [
  {
    emoji: "🌐",
    title: "Landing pages",
    desc: "Hero, features, CTA — every palette applied to a real-feeling landing layout.",
  },
  {
    emoji: "📊",
    title: "Presentations",
    desc: "Cover slide + content slide with a chart. Perfect for pitch decks and reports.",
  },
  {
    emoji: "📱",
    title: "Social posts",
    desc: "Image and quote post layouts. See how the palette looks in your feed before you commit.",
  },
  {
    emoji: "🛍️",
    title: "Shop listings",
    desc: "Etsy/Shopify-style product cards with badges, prices, ratings. See your store in the palette.",
  },
];

export function UseCasesSection() {
  return (
    <section className="border-b border-neutral-200 bg-white dark:border-[#15203A] dark:bg-[#0B1220]">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <div className="mb-10 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500 dark:text-[#64748B]">
            Use cases
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight dark:text-[#E2E8F0] md:text-4xl">
            One palette. Four real contexts.
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {USE_CASES.map((useCase) => (
            <div
              key={useCase.title}
              className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 dark:border-[#1e2d4a] dark:bg-[#15203A]"
            >
              <div className="mb-3 text-3xl">{useCase.emoji}</div>
              <h3 className="text-base font-semibold tracking-tight dark:text-[#E2E8F0]">
                {useCase.title}
              </h3>
              <p className="mt-1.5 text-sm text-neutral-600 dark:text-[#94A3B8]">
                {useCase.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
