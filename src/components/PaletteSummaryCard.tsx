import { useState } from "react";
import type { Palette } from "@/data/palettes";
import { ColorSwatchStrip } from "@/components/ColorSwatchStrip";

export function PaletteSummaryCard({ palette }: { palette: Palette }) {
  const [imageFailed, setImageFailed] = useState(false);
  const { surface, text } = palette.colors;

  return (
    <section className="mb-8 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-[#1e2d4a] dark:bg-[#15203A]">
      <div className="grid grid-cols-1 md:grid-cols-[1.1fr,1fr]">
        <div
          className="relative aspect-[4/3] md:aspect-auto md:min-h-[260px]"
          style={
            imageFailed
              ? {
                  background: `linear-gradient(135deg, ${palette.colors.bg} 0%, ${palette.colors.surface} 30%, ${palette.colors.primary} 65%, ${palette.colors.accent} 100%)`,
                }
              : undefined
          }
        >
          {!imageFailed && palette.image && (
            <img
              src={palette.image}
              alt={`${palette.name} mood`}
              loading="lazy"
              onError={() => setImageFailed(true)}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          {(imageFailed || !palette.image) && (
            <div
              className="absolute bottom-3 left-3 rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wider"
              style={{ backgroundColor: surface, color: text }}
            >
              Mood swatch
            </div>
          )}
        </div>
        <div className="flex flex-col justify-between gap-5 p-6 md:p-7">
          <div>
            <h1 className="text-xl font-bold tracking-tight dark:text-[#E2E8F0] md:text-2xl">
              {palette.name}
            </h1>
            <p className="mt-2 text-sm text-neutral-600 dark:text-[#94A3B8] md:text-[15px]">
              {palette.description}
            </p>
          </div>
          <div>
            <ColorSwatchStrip colors={palette.swatches} />
          </div>
        </div>
      </div>
    </section>
  );
}
