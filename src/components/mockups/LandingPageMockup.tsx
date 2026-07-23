import { ArrowRight, Shield, Sparkles, Star, Zap } from "lucide-react";
import type { Palette } from "@/data/palettes";
import { readableTextColor } from "@/lib/color";
import { PaletteBadge } from "@/components/PaletteBadge";

const FEATURES = [
  {
    icon: Sparkles,
    title: "Contextual showcasing",
    desc: "See your palette in a real layout before you pick.",
  },
  {
    icon: Zap,
    title: "Instant exports",
    desc: "CSS, SCSS, JSON, Figma tokens. One click.",
  },
  {
    icon: Shield,
    title: "Accessibility-checked",
    desc: "Every palette graded for contrast.",
  },
];

export function LandingPageMockup({ palette }: { palette: Palette }) {
  const { bg, surface, primary, accent, text } = palette.colors;

  return (
    <div
      className="overflow-hidden rounded-2xl border border-neutral-200 shadow-sm"
      style={{ backgroundColor: bg, color: text }}
    >
      <div className="flex items-center justify-between px-6 py-5 md:px-10">
        <div className="flex items-center gap-2 font-semibold">
          <PaletteBadge palette={palette} size={28} />
          <span>Acme</span>
        </div>
        <div className="hidden gap-7 text-sm opacity-70 md:flex">
          <span>Product</span>
          <span>Pricing</span>
          <span>About</span>
        </div>
        <button
          className="rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
          style={{ backgroundColor: primary, color: readableTextColor(primary) }}
        >
          Sign up
        </button>
      </div>

      <div className="px-6 py-14 md:px-10 md:py-20">
        <div className="max-w-2xl">
          <div
            className="mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
            style={{ backgroundColor: surface, color: text }}
          >
            <Sparkles className="h-3 w-3" style={{ color: accent }} />
            New: contextual showcasing
          </div>
          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl">
            Build something <span style={{ color: accent }}>beautiful</span>, without the
            design degree.
          </h1>
          <p className="mt-5 max-w-xl text-base opacity-80 md:text-lg">
            The fastest way to find a palette that actually fits your work — and see it
            in context before you commit.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition-opacity hover:opacity-90"
              style={{ backgroundColor: primary, color: readableTextColor(primary) }}
            >
              Try it free <ArrowRight className="h-4 w-4" />
            </button>
            <button
              className="rounded-xl border px-5 py-3 text-sm font-medium"
              style={{ borderColor: text, color: text }}
            >
              See examples
            </button>
          </div>
        </div>
      </div>

      <div
        className="grid grid-cols-1 gap-4 px-6 py-12 md:grid-cols-3 md:px-10"
        style={{ backgroundColor: surface }}
      >
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="rounded-xl p-5"
            style={{ backgroundColor: bg }}
          >
            <feature.icon className="mb-3 h-6 w-6" style={{ color: primary }} />
            <h3 className="mb-1 font-semibold">{feature.title}</h3>
            <p className="text-sm opacity-75">{feature.desc}</p>
          </div>
        ))}
      </div>

      <div className="px-6 py-14 md:px-10">
        <div className="flex items-center gap-1" style={{ color: accent }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} className="h-4 w-4 fill-current" />
          ))}
        </div>
        <blockquote className="mt-3 max-w-2xl text-xl font-medium leading-relaxed md:text-2xl">
          "Finally a palette tool that doesn't make me guess. I see the colors in a real
          layout and I just know."
        </blockquote>
        <div className="mt-4 text-sm opacity-70">Sam K. — indie developer</div>
      </div>

      <div
        className="px-6 py-12 text-center md:px-10 md:py-16"
        style={{ backgroundColor: surface }}
      >
        <h2 className="mx-auto max-w-xl text-2xl font-bold tracking-tight md:text-3xl">
          Ready to look like you know what you're doing?
        </h2>
        <button
          className="mt-6 rounded-xl px-6 py-3 text-sm font-medium transition-opacity hover:opacity-90"
          style={{ backgroundColor: accent, color: readableTextColor(accent) }}
        >
          Get started — it's free
        </button>
      </div>

      <div
        className="border-t px-6 py-6 text-center text-xs opacity-60 md:px-10"
        style={{ borderColor: surface }}
      >
        © 2026 Acme. All rights reserved.
      </div>
    </div>
  );
}
