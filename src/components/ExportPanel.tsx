import { useEffect, useState } from "react";
import { Check, Copy, Lock } from "lucide-react";
import type { Palette } from "@/data/palettes";
import { exportFormats } from "@/lib/export";
import { copyToClipboard } from "@/lib/color";
import { hasAccount } from "@/lib/account";
import { EmailCaptureModal } from "@/components/EmailCaptureModal";

export function ExportPanel({ palette }: { palette: Palette }) {
  const [formatKey, setFormatKey] = useState("css");
  const [copied, setCopied] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setUnlocked(hasAccount());
  }, []);

  const format = exportFormats.find((f) => f.key === formatKey)!;
  const output = format.fn(palette);
  const locked = format.requiresAccount && !unlocked;

  const doCopy = async () => {
    try {
      await copyToClipboard(output);
    } catch {
      /* clipboard unavailable — button still flashes copied state */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleCopyClick = () => {
    if (locked) {
      setModalOpen(true);
      return;
    }
    doCopy();
  };

  const handleUnlockSuccess = () => {
    setUnlocked(true);
    setModalOpen(false);
    setTimeout(doCopy, 50);
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label="Export format"
        className="mb-3 flex max-w-full gap-1 overflow-x-auto rounded-full bg-neutral-200 p-1 dark:bg-[#0d1730] sm:inline-flex"
      >
        {exportFormats.map((f) => {
          const active = formatKey === f.key;
          const formatLocked = f.requiresAccount && !unlocked;
          return (
            <button
              key={f.key}
              role="tab"
              aria-selected={active}
              onClick={() => setFormatKey(f.key)}
              className={
                "inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition " +
                (active
                  ? "bg-white text-neutral-900 shadow-sm dark:bg-[#15203A] dark:text-[#E2E8F0]"
                  : "text-neutral-600 hover:text-neutral-900 dark:text-[#64748B] dark:hover:text-[#94A3B8]")
              }
            >
              {f.label}
              {formatLocked && <Lock className="h-3 w-3 opacity-70" />}
            </button>
          );
        })}
      </div>

      <div className="relative">
        <pre className="overflow-x-auto rounded-2xl border border-neutral-200 bg-neutral-900 p-4 pr-24 text-[12.5px] leading-relaxed text-neutral-100 dark:border-[#1e2d4a] dark:bg-[#0d1730]">
          <code className="font-mono">{output}</code>
        </pre>
        <button
          onClick={handleCopyClick}
          className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-lg bg-neutral-700 px-3 py-1.5 text-xs font-medium text-neutral-100 transition hover:bg-neutral-600 dark:bg-[#15203A] dark:text-[#94A3B8] dark:hover:bg-[#1e2d4a] dark:hover:text-[#E2E8F0]"
          aria-label={locked ? "Sign up to copy" : "Copy code to clipboard"}
        >
          {locked ? (
            <Lock className="h-3.5 w-3.5" />
          ) : copied ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          {locked ? "Unlock" : copied ? "Copied" : "Copy"}
        </button>
      </div>

      {!unlocked && (
        <p className="mt-2 text-[11px] leading-relaxed text-neutral-500 dark:text-[#64748B]">
          Basic CSS is free. The other formats unlock with a free account — email only,
          no spam.
        </p>
      )}

      <EmailCaptureModal
        open={modalOpen}
        trigger={format.label}
        onClose={() => setModalOpen(false)}
        onSuccess={handleUnlockSuccess}
      />
    </div>
  );
}
