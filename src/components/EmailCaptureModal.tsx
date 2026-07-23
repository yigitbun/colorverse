import { useEffect, useRef, useState } from "react";
import { Check, Lock, X, Zap } from "lucide-react";
import { isValidEmail, saveAccount } from "@/lib/account";

interface EmailCaptureModalProps {
  open: boolean;
  trigger?: string;
  variant?: "export" | "waitlist";
  onClose: () => void;
  onSuccess: () => void;
}

export function EmailCaptureModal({
  open,
  trigger,
  variant = "export",
  onClose,
  onSuccess,
}: EmailCaptureModalProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setEmail("");
    setError(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    saveAccount(email.trim());
    onSuccess();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="signup-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#15203A] md:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-neutral-400 transition hover:text-neutral-900 dark:text-[#64748B] dark:hover:text-[#E2E8F0]"
        >
          <X className="h-5 w-5" />
        </button>

        {variant === "waitlist" ? (
          <>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-700 dark:bg-[#22D3EE]/10 dark:text-[#22D3EE]">
              <Zap className="h-3 w-3" /> Pro waitlist
            </div>
            <h2
              id="signup-title"
              className="mt-2 text-xl font-bold tracking-tight dark:text-[#E2E8F0] md:text-2xl"
            >
              Join the Pro waitlist
            </h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-[#94A3B8] md:text-[15px]">
              Drop your email and we'll notify you the moment Pro launches. First 100
              subscribers get the first month free.
            </p>
          </>
        ) : (
          <>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-700 dark:bg-[#0B1220] dark:text-[#94A3B8]">
              <Lock className="h-3 w-3" /> Free account
            </div>
            <h2
              id="signup-title"
              className="mt-2 text-xl font-bold tracking-tight dark:text-[#E2E8F0] md:text-2xl"
            >
              Unlock {trigger} export
            </h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-[#94A3B8] md:text-[15px]">
              Drop your email and the rest of the export formats are yours — Tailwind,
              SCSS, JSON, SVG, hex list. Forever free. We won't spam.
            </p>
          </>
        )}

        <form onSubmit={handleSubmit} className="mt-5">
          <input
            ref={inputRef}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@somewhere.com"
            className="block w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-[15px] outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 dark:border-[#1e2d4a] dark:bg-[#0B1220] dark:text-[#E2E8F0] dark:placeholder-[#64748B] dark:focus:border-[#22D3EE] dark:focus:ring-[#22D3EE]/20"
            aria-invalid={!!error}
            aria-describedby={error ? "signup-error" : undefined}
          />
          {error && (
            <p
              id="signup-error"
              className="mt-2 text-xs text-red-600 dark:text-red-400"
              role="alert"
            >
              {error}
            </p>
          )}
          <button
            type="submit"
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 dark:bg-[#22D3EE] dark:text-[#0B1220] dark:hover:bg-[#38BDF8]"
          >
            <Check className="h-4 w-4" />
            {variant === "waitlist" ? "Join waitlist" : "Unlock all exports"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="mt-2 w-full rounded-xl px-4 py-2 text-xs text-neutral-500 transition hover:text-neutral-900 dark:text-[#64748B] dark:hover:text-[#94A3B8]"
          >
            Maybe later
          </button>
        </form>

        <p className="mt-4 text-[11px] leading-relaxed text-neutral-500 dark:text-[#64748B]">
          {variant === "waitlist"
            ? "No spam. One email when Pro is ready. Unsubscribe any time."
            : "No password yet — we're saving real accounts (and the rest of Pro) for the next release. Your email lives in your browser for now."}
        </p>
      </div>
    </div>
  );
}
