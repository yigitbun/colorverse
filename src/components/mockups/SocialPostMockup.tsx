import { Bookmark, Ellipsis, Heart, MessageCircle, Send, Sparkles } from "lucide-react";
import type { Palette } from "@/data/palettes";
import { readableTextColor } from "@/lib/color";

export function SocialPostMockup({ palette }: { palette: Palette }) {
  const { bg, surface, primary, accent, text } = palette.colors;
  const textColor = text;
  const onPrimary = readableTextColor(primary);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* Image post */}
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="h-9 w-9 rounded-full" style={{ backgroundColor: primary }} />
          <div className="flex-1">
            <div className="text-[13px] font-semibold leading-tight">yourbrand</div>
            <div className="text-[11px] text-neutral-500">Original audio</div>
          </div>
          <Ellipsis className="h-5 w-5 text-neutral-500" />
        </div>
        <div className="relative" style={{ backgroundColor: bg, color: textColor, aspectRatio: "1 / 1" }}>
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 28% 32%, ${surface} 0%, transparent 55%), radial-gradient(circle at 75% 72%, ${accent}66 0%, transparent 45%)`,
            }}
          />
          <div className="relative flex h-full flex-col items-center justify-center p-8 text-center">
            <div
              className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full"
              style={{ backgroundColor: primary, color: onPrimary }}
            >
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="text-2xl font-bold leading-tight tracking-tight md:text-[28px]">
              Color, but in <span style={{ color: accent }}>context</span>.
            </div>
            <div className="mt-3 text-xs opacity-70">Out now</div>
          </div>
        </div>
        <div className="flex items-center gap-4 px-4 py-2.5 text-neutral-800">
          <Heart className="h-5 w-5" />
          <MessageCircle className="h-5 w-5" />
          <Send className="h-5 w-5" />
          <Bookmark className="ml-auto h-5 w-5" />
        </div>
        <div className="px-4 pb-3">
          <div className="text-[13px] font-semibold">1,247 likes</div>
          <div className="mt-1 text-[13px] leading-snug">
            <span className="font-semibold">yourbrand</span> Picked the palette in three
            seconds. <span style={{ color: primary }}>#colorverse</span>
          </div>
        </div>
      </div>

      {/* Quote post */}
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="h-9 w-9 rounded-full" style={{ backgroundColor: accent }} />
          <div className="flex-1">
            <div className="text-[13px] font-semibold leading-tight">designdaily</div>
            <div className="text-[11px] text-neutral-500">2h</div>
          </div>
          <Ellipsis className="h-5 w-5 text-neutral-500" />
        </div>
        <div
          className="relative flex items-center justify-center p-8"
          style={{ backgroundColor: surface, color: textColor, aspectRatio: "1 / 1" }}
        >
          <div className="text-center">
            <div className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] opacity-50">
              Quote of the day
            </div>
            <blockquote className="text-xl font-medium italic leading-snug md:text-2xl">
              "The best palette is the one you can actually picture in your work."
            </blockquote>
            <div
              className="mt-6 text-[10px] font-semibold uppercase tracking-[0.2em]"
              style={{ color: primary }}
            >
              — Sam K.
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 px-4 py-2.5 text-neutral-800">
          <Heart className="h-5 w-5" />
          <MessageCircle className="h-5 w-5" />
          <Send className="h-5 w-5" />
          <Bookmark className="ml-auto h-5 w-5" />
        </div>
        <div className="px-4 pb-3">
          <div className="text-[13px] font-semibold">892 likes</div>
        </div>
      </div>
    </div>
  );
}
