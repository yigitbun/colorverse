import { useState } from "react";
import { Check, Copy, MousePointerClick } from "lucide-react";
import { copyToClipboard, readableTextColor } from "@/lib/color";

export function ColorSwatchStrip({ colors }: { colors: string[] }) {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (color: string) => {
    try {
      await copyToClipboard(color);
    } catch {
      /* clipboard unavailable — swatch still highlights */
    }
    setCopied(color);
    setTimeout(() => setCopied(null), 1200);
  };

  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5 text-xs text-neutral-500 dark:text-[#64748B]">
        <MousePointerClick className="h-3.5 w-3.5" />
        <span>Click any color to copy its hex.</span>
      </div>
      <div className="flex h-20 overflow-hidden rounded-2xl border border-neutral-200 shadow-sm dark:border-[#1e2d4a]">
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => handleCopy(color)}
            className="group relative flex flex-1 items-center justify-center font-mono text-xs tracking-tight transition-all duration-150 hover:flex-[1.2] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-[#22D3EE]"
            style={{ backgroundColor: color, color: readableTextColor(color) }}
            aria-label={`Copy ${color.toUpperCase()}`}
          >
            <span className="opacity-0 transition-opacity duration-150 group-hover:opacity-100">
              {copied === color ? (
                <span className="inline-flex items-center gap-1">
                  <Check className="h-3 w-3" /> copied
                </span>
              ) : (
                <span className="inline-flex items-center gap-1">
                  <Copy className="h-3 w-3" /> {color.toUpperCase()}
                </span>
              )}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
