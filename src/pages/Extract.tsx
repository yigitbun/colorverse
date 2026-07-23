import { useCallback, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, LoaderCircle, RotateCcw, Upload } from "lucide-react";
import type { Palette } from "@/data/palettes";
import { extractPaletteFromImage } from "@/lib/extractPalette";
import { UploadDropzone } from "@/components/UploadDropzone";
import { ColorSwatchStrip } from "@/components/ColorSwatchStrip";
import { MockupSwitcher } from "@/components/MockupSwitcher";
import { ExportPanel } from "@/components/ExportPanel";

export default function Extract() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [palette, setPalette] = useState<Palette | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const runExtraction = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    setPalette(null);
    setPreviewUrl(URL.createObjectURL(file));
    try {
      await new Promise((resolve) => setTimeout(resolve, 50));
      const result = await extractPaletteFromImage(file);
      setPalette(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong extracting the palette.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (PNG, JPG, WebP, etc.).");
      return;
    }
    runExtraction(file);
  };

  const handleReset = () => {
    setPreviewUrl(null);
    setPalette(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 md:py-14">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-neutral-600 transition hover:text-neutral-900 dark:text-[#94A3B8] dark:hover:text-[#E2E8F0]"
      >
        <ArrowLeft className="h-4 w-4" /> All palettes
      </Link>

      <div className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight dark:text-[#E2E8F0] md:text-4xl">
          Pull a palette from any photo.
        </h1>
        <p className="mt-3 text-neutral-600 dark:text-[#94A3B8] md:text-lg">
          Upload an image and we'll extract its five most defining colors — and slot them
          into background, surface, primary, accent, and text so the result actually
          works in your designs.
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {!previewUrl && !loading && (
        <UploadDropzone onFile={handleFile} onPick={() => fileInputRef.current?.click()} />
      )}

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      {(previewUrl || loading) && (
        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-[280px,1fr]">
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 dark:border-[#1e2d4a] dark:bg-[#15203A]">
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Uploaded source"
                className="block max-h-72 w-full object-cover md:max-h-none md:object-contain"
              />
            )}
          </div>
          <div className="flex flex-col justify-between gap-4">
            <div>
              {loading ? (
                <div className="inline-flex items-center gap-2 text-neutral-600 dark:text-[#94A3B8]">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  <span className="text-sm">
                    Sampling pixels and finding the five strongest colors…
                  </span>
                </div>
              ) : (
                palette && (
                  <>
                    <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-[#64748B]">
                      Extracted palette
                    </h2>
                    <ColorSwatchStrip colors={palette.swatches} />
                    <p className="mt-2 text-xs text-neutral-500 dark:text-[#64748B]">
                      Click any swatch to copy its hex code.
                    </p>
                  </>
                )
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 dark:bg-[#22D3EE] dark:text-[#0B1220] dark:hover:bg-[#38BDF8]"
              >
                <Upload className="h-4 w-4" /> Try another image
              </button>
              {(previewUrl || palette) && (
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 dark:border-[#1e2d4a] dark:bg-[#15203A] dark:text-[#94A3B8] dark:hover:bg-[#1e2d4a] dark:hover:text-[#E2E8F0]"
                >
                  <RotateCcw className="h-4 w-4" /> Reset
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {palette && (
        <>
          <div className="mb-12">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-[#64748B]">
              In context
            </h2>
            <MockupSwitcher palette={palette} />
          </div>
          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-[#64748B]">
              Export
            </h2>
            <ExportPanel palette={palette} />
          </div>
        </>
      )}
    </main>
  );
}
