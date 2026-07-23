import { Palette } from "lucide-react";
import { FooterLinkGroup } from "@/components/FooterLinkGroup";

export function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-300 dark:bg-[#0d1730] dark:text-[#94A3B8]">
      <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 font-semibold text-white dark:text-[#E2E8F0]">
              <Palette className="h-5 w-5" />
              <span>ColorVerse</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-neutral-400 dark:text-[#64748B]">
              Palettes you can actually picture. Built for everyday creators by an indie solo dev.
            </p>
          </div>
          <FooterLinkGroup
            title="Product"
            links={[
              { label: "Explore", href: "/explore" },
              { label: "Extract", href: "/extract" },
              { label: "Pricing", href: "#pricing" },
            ]}
          />
          <FooterLinkGroup
            title="Company"
            links={[
              { label: "About", href: "/about" },
              { label: "Roadmap", href: "#" },
              { label: "Contact", href: "mailto:hello@colorverse.app" },
            ]}
          />
          <FooterLinkGroup
            title="Legal"
            links={[
              { label: "Privacy", href: "/privacy" },
              { label: "Terms", href: "/terms" },
            ]}
          />
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-800 pt-6 text-xs text-neutral-500 dark:border-[#15203A] dark:text-[#64748B]">
          <span>© 2026 ColorVerse</span>
          <span>Built by an indie dev who can't visualize palettes either.</span>
        </div>
      </div>
    </footer>
  );
}
