import { Sparkles, Upload } from "lucide-react";
import type { Palette } from "@/data/palettes";

/** The little "browser window" mockup shown in the hero, previewing the /extract flow. */
export function ExtractPreviewCard({ palette }: { palette: Palette }) {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-[#1e2d4a] dark:bg-[#0d1730]">
      <div className="flex items-center gap-3 border-b border-neutral-200 bg-neutral-50 px-4 py-2.5 dark:border-[#1e2d4a] dark:bg-[#0B1220]">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
        </div>
        <div className="flex flex-1 items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-3 py-1 text-[11px] text-neutral-400 dark:border-[#15203A] dark:bg-[#15203A] dark:text-[#64748B]">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          colorverse.app/extract
        </div>
      </div>
      <div className="p-4">
        <div className="mb-3 flex items-center gap-1.5 text-[10px] font-semibold">
          <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-neutral-400 dark:bg-[#15203A] dark:text-[#64748B]">
            1 Upload
          </span>
          <div className="h-px w-3 bg-neutral-200 dark:bg-[#1e2d4a]" />
          <span className="rounded-full bg-neutral-900 px-2.5 py-1 text-white dark:bg-[#22D3EE] dark:text-[#0B1220]">
            2 Extract
          </span>
          <div className="h-px w-3 bg-neutral-200 dark:bg-[#1e2d4a]" />
          <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-neutral-400 dark:bg-[#15203A] dark:text-[#64748B]">
            3 Export
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-[#64748B]">
              Before
            </p>
            <div className="flex flex-1 flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 px-3 py-6 text-center dark:border-[#1e2d4a] dark:bg-[#0B1220]">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-[#15203A]">
                <Upload className="h-4 w-4 text-neutral-400 dark:text-[#64748B]" />
              </div>
              <p className="text-[11px] font-medium text-neutral-700 dark:text-[#94A3B8]">
                Drop image here
              </p>
              <p className="mt-0.5 text-[10px] text-neutral-400 dark:text-[#64748B]">
                PNG · JPG · WebP
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-[#64748B]">
              After
            </p>
            <div className="flex flex-1 flex-col gap-2">
              <div className="relative overflow-hidden rounded-xl">
                <img
                  key={palette.id}
                  src={palette.image}
                  alt="Extracted from"
                  className="h-24 w-full object-cover transition-opacity duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-1.5 left-2 flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-[9px] font-semibold text-white backdrop-blur-sm">
                  <Sparkles className="h-2.5 w-2.5 text-amber-400 dark:text-[#22D3EE]" />
                  5 colors found
                </div>
              </div>
              <div className="flex gap-1">
                {palette.swatches.map((color, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-md shadow-sm ring-1 ring-black/5"
                    style={{ backgroundColor: color, height: 24 }}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between rounded-lg bg-neutral-50 px-2 py-1.5 dark:bg-[#0B1220]">
                <span className="text-[9px] font-medium text-neutral-500 dark:text-[#64748B]">
                  Export
                </span>
                <div className="flex gap-1">
                  {["CSS", "Tailwind"].map((label, i) => (
                    <span
                      key={label}
                      className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${
                        i === 0
                          ? "bg-neutral-900 text-white dark:bg-[#22D3EE] dark:text-[#0B1220]"
                          : "border border-neutral-200 bg-white text-neutral-500 dark:border-[#1e2d4a] dark:bg-[#15203A] dark:text-[#64748B]"
                      }`}
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
