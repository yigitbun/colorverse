import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { DEFAULT_PALETTE_ID, getPaletteById, palettes } from "@/data/palettes";
import { PaletteGrid } from "@/components/PaletteGrid";
import { PaletteSummaryCard } from "@/components/PaletteSummaryCard";
import { MockupSwitcher } from "@/components/MockupSwitcher";
import { ExportPanel } from "@/components/ExportPanel";

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get("p") ?? DEFAULT_PALETTE_ID;
  const palette = useMemo(
    () => getPaletteById(selectedId) ?? getPaletteById(DEFAULT_PALETTE_ID)!,
    [selectedId],
  );

  const handleSelect = useCallback(
    (id: string) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set("p", id);
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  return (
    <main className="mx-auto max-w-4xl px-4 py-6 md:py-8">
      <section className="mb-6">
        <h2 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500 dark:text-[#64748B]">
          Palettes
        </h2>
        <PaletteGrid palettes={palettes} selectedId={palette.id} onSelect={handleSelect} />
      </section>

      <PaletteSummaryCard palette={palette} />

      <section className="mb-6">
        <h2 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500 dark:text-[#64748B]">
          In context
        </h2>
        <MockupSwitcher palette={palette} />
      </section>

      <section>
        <h2 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500 dark:text-[#64748B]">
          Export
        </h2>
        <ExportPanel palette={palette} />
      </section>
    </main>
  );
}
