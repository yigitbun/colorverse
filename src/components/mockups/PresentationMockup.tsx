import type { Palette } from "@/data/palettes";
import { readableTextColor } from "@/lib/color";

export function PresentationMockup({ palette }: { palette: Palette }) {
  const { bg, surface, primary, accent, text } = palette.colors;
  const bars = [
    { color: bg, h: 30 },
    { color: surface, h: 45 },
    { color: primary, h: 80 },
    { color: accent, h: 60 },
    { color: text, h: 70 },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* Cover slide */}
      <div
        className="relative overflow-hidden rounded-2xl border border-neutral-200 shadow-sm"
        style={{ backgroundColor: bg, color: text, aspectRatio: "16 / 9" }}
      >
        <div
          className="absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-90"
          style={{ backgroundColor: primary }}
        />
        <div
          className="absolute -right-4 top-16 h-24 w-24 rounded-full"
          style={{ backgroundColor: accent }}
        />
        <div className="relative flex h-full flex-col justify-end p-7 md:p-9">
          <div
            className="mb-3 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider"
            style={{ backgroundColor: surface, color: text }}
          >
            Q4 Review · 2026
          </div>
          <h2
            className="text-2xl font-bold leading-tight tracking-tight md:text-3xl"
            style={{ color: text }}
          >
            How we grew the studio <span style={{ color: accent }}>3×</span>.
          </h2>
          <p className="mt-2 text-sm opacity-70 md:text-base">
            A few decisions that turned out to matter more than we expected.
          </p>
          <div className="mt-5 flex items-center gap-2 text-xs opacity-60">
            <div className="h-5 w-5 rounded-full" style={{ backgroundColor: primary }} />
            <span>Maya R. · Co-founder</span>
          </div>
        </div>
      </div>

      {/* Content slide with chart */}
      <div
        className="relative overflow-hidden rounded-2xl border border-neutral-200 shadow-sm"
        style={{ backgroundColor: bg, color: text, aspectRatio: "16 / 9" }}
      >
        <div className="flex h-full flex-col p-7 md:p-9">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider opacity-60">
            Revenue breakdown
          </div>
          <h2 className="text-xl font-bold tracking-tight md:text-2xl">
            Where the growth actually came from
          </h2>
          <div
            className="mt-4 flex flex-1 items-end gap-2 rounded-xl p-3"
            style={{ backgroundColor: surface }}
          >
            {bars.map((bar, i) => (
              <div
                key={i}
                className="flex flex-1 flex-col items-center justify-end"
                style={{ height: "100%" }}
              >
                <div
                  className="w-full rounded-t-md transition-all"
                  style={{
                    backgroundColor: bar.color,
                    height: `${bar.h}%`,
                    minHeight: 6,
                    border:
                      bar.color === bg || bar.color === surface
                        ? `1px solid ${text}33`
                        : "none",
                  }}
                />
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between gap-2 text-xs opacity-70">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: primary }} />
              <span>Direct sales</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: accent }} />
              <span>Referrals</span>
            </div>
            <div
              className="rounded px-2 py-0.5 font-semibold"
              style={{ backgroundColor: primary, color: readableTextColor(primary) }}
            >
              +312%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
