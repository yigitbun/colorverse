import { Heart, Star } from "lucide-react";
import type { Palette } from "@/data/palettes";
import { readableTextColor } from "@/lib/color";

export function ShopListingMockup({ palette }: { palette: Palette }) {
  const { bg, surface, primary, accent, text } = palette.colors;
  const onAccent = readableTextColor(accent);
  const onPrimary = readableTextColor(primary);
  const hairline = onAccent === "#ffffff" ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.12)";

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* Candle */}
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="relative" style={{ backgroundColor: bg, aspectRatio: "1 / 1" }}>
          <div className="absolute inset-0 flex items-center justify-center p-10">
            <div className="relative">
              <div
                className="rounded-[28px]"
                style={{
                  width: 140,
                  height: 170,
                  backgroundColor: primary,
                  boxShadow: `0 20px 40px -12px ${primary}66`,
                }}
              >
                <div
                  className="mx-auto mt-12 w-3/4 rounded px-2 py-2.5 text-center text-[8px] font-bold uppercase leading-tight tracking-[0.15em]"
                  style={{ backgroundColor: surface, color: text }}
                >
                  Citrus
                  <br />
                  &amp; Cedar
                </div>
              </div>
              <div
                className="absolute left-1/2 -top-1 h-3 w-0.5 -translate-x-1/2 rounded-full"
                style={{ backgroundColor: text }}
              />
              <div
                className="absolute left-1/2 -top-3 h-2 w-2 -translate-x-1/2 rounded-full"
                style={{ backgroundColor: accent, opacity: 0.85 }}
              />
            </div>
          </div>
          <div
            className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider"
            style={{ backgroundColor: accent, color: onAccent }}
          >
            Bestseller
          </div>
          <button
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md"
            aria-label="Remove from favorites"
          >
            <Heart className="h-4 w-4 fill-current" style={{ color: primary }} />
          </button>
        </div>
        <div className="p-4">
          <div className="text-[11px] uppercase tracking-wider text-neutral-500">
            Home · Candles
          </div>
          <h3 className="mt-1 font-semibold leading-tight tracking-tight">
            Hand-poured soy candle, 8 oz
          </h3>
          <div className="mt-2 flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="h-3 w-3 fill-current" style={{ color: accent }} />
            ))}
            <span className="ml-1.5 text-[11px] text-neutral-500">(247)</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-lg font-bold" style={{ color: primary }}>
              $28.00
            </span>
            <span className="text-xs text-neutral-400 line-through">$36.00</span>
          </div>
        </div>
      </div>

      {/* Pillow */}
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="relative" style={{ backgroundColor: surface, aspectRatio: "1 / 1" }}>
          <div className="absolute inset-0 flex items-center justify-center p-10">
            <div
              className="relative flex items-center justify-center rounded-[36px]"
              style={{
                width: 170,
                height: 170,
                backgroundColor: accent,
                boxShadow: `0 20px 40px -12px ${accent}66`,
              }}
            >
              <div
                className="absolute inset-x-4 top-4 h-px"
                style={{ backgroundColor: hairline }}
              />
              <div
                className="absolute inset-x-4 bottom-4 h-px"
                style={{ backgroundColor: hairline }}
              />
              <div
                className="text-2xl font-serif italic"
                style={{ color: onAccent, opacity: 0.7 }}
              >
                M
              </div>
            </div>
          </div>
          <div
            className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider"
            style={{ backgroundColor: primary, color: onPrimary }}
          >
            Just dropped
          </div>
          <button
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md"
            aria-label="Add to favorites"
          >
            <Heart className="h-4 w-4 text-neutral-500" />
          </button>
        </div>
        <div className="p-4">
          <div className="text-[11px] uppercase tracking-wider text-neutral-500">
            Home · Textiles
          </div>
          <h3 className="mt-1 font-semibold leading-tight tracking-tight">
            Linen throw pillow, sage
          </h3>
          <div className="mt-2 flex items-center gap-0.5">
            {[1, 2, 3, 4].map((i) => (
              <Star key={i} className="h-3 w-3 fill-current" style={{ color: accent }} />
            ))}
            <Star className="h-3 w-3 text-neutral-300" />
            <span className="ml-1.5 text-[11px] text-neutral-500">(38)</span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-lg font-bold" style={{ color: primary }}>
              $42.00
            </span>
            <span className="text-[11px] font-semibold" style={{ color: accent }}>
              + free shipping
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
