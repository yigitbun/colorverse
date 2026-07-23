import type { Palette } from "@/data/palettes";

interface PaletteGridProps {
  palettes: Palette[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function PaletteGrid({ palettes, selectedId, onSelect }: PaletteGridProps) {
  return (
    <div
      role="listbox"
      aria-label="Palettes"
      className="-mx-1 flex gap-2 overflow-x-auto scroll-smooth px-1 pb-2"
      style={{ scrollbarWidth: "thin" }}
    >
      {palettes.map((palette) => {
        const isSelected = palette.id === selectedId;
        return (
          <button
            key={palette.id}
            role="option"
            aria-selected={isSelected}
            onClick={() => onSelect(palette.id)}
            className={
              "group flex shrink-0 cursor-pointer flex-col overflow-hidden rounded-xl border bg-white transition-all dark:bg-[#15203A] " +
              (isSelected
                ? "border-neutral-900 shadow-md dark:border-[#22D3EE]"
                : "border-neutral-200 hover:-translate-y-0.5 hover:shadow-md dark:border-[#1e2d4a] dark:hover:border-[#94A3B8]")
            }
            style={{ width: 168 }}
          >
            <div className="flex h-10">
              {palette.swatches.map((color, i) => (
                <div
                  key={i}
                  className="flex-1 transition-all duration-200 group-hover:flex-[1.1]"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="px-3 py-2 text-left">
              <div
                className={
                  "truncate text-[13px] font-semibold tracking-tight " +
                  (isSelected
                    ? "text-neutral-900 dark:text-[#E2E8F0]"
                    : "text-neutral-800 dark:text-[#94A3B8]")
                }
              >
                {palette.name}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
