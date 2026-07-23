import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { palettes } from "@/data/palettes";
import { PaletteBadge } from "@/components/PaletteBadge";

export function ShowcaseSection() {
  const featured = palettes.slice(0, 6);

  return (
    <section
      id="showcase"
      className="border-b border-neutral-200 bg-neutral-50 dark:border-[#15203A] dark:bg-[#15203A]"
    >
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <div className="mb-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500 dark:text-[#64748B]">
            Curated palettes
          </p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-3xl font-bold tracking-tight dark:text-[#E2E8F0] md:text-4xl">
              See them before you pick them.
            </h2>
            <Link
              to="/explore"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-900 hover:underline dark:text-[#22D3EE]"
            >
              Browse all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((palette) => (
            <Link
              key={palette.id}
              to={`/explore?p=${palette.id}`}
              className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-[#1e2d4a] dark:bg-[#0B1220]"
            >
              <div className="relative aspect-[4/3] bg-neutral-100 dark:bg-[#15203A]">
                <img
                  src={palette.image}
                  alt={palette.name}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
              <div className="flex">
                {palette.swatches.map((color, i) => (
                  <div key={i} className="h-12 flex-1" style={{ backgroundColor: color }} />
                ))}
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2">
                  <PaletteBadge palette={palette} size={20} />
                  <h3 className="font-semibold tracking-tight dark:text-[#E2E8F0]">
                    {palette.name}
                  </h3>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-neutral-600 dark:text-[#94A3B8]">
                  {palette.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
