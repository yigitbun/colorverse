import { useState } from "react";
import type { Palette } from "@/data/palettes";
import { LandingPageMockup } from "@/components/mockups/LandingPageMockup";
import { PresentationMockup } from "@/components/mockups/PresentationMockup";
import { SocialPostMockup } from "@/components/mockups/SocialPostMockup";
import { ShopListingMockup } from "@/components/mockups/ShopListingMockup";

const MOCKUP_TYPES = [
  { key: "landing", label: "Landing page" },
  { key: "slides", label: "Presentation" },
  { key: "social", label: "Social post" },
  { key: "ecommerce", label: "Shop listing" },
] as const;

type MockupKey = (typeof MOCKUP_TYPES)[number]["key"];

export function MockupSwitcher({ palette }: { palette: Palette }) {
  const [active, setActive] = useState<MockupKey>("landing");

  return (
    <div>
      <div
        role="tablist"
        aria-label="Mockup type"
        className="mb-5 flex max-w-full gap-1 overflow-x-auto rounded-full bg-neutral-200 p-1 dark:bg-[#0d1730] sm:inline-flex"
      >
        {MOCKUP_TYPES.map((type) => {
          const isActive = active === type.key;
          return (
            <button
              key={type.key}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(type.key)}
              className={
                "shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition " +
                (isActive
                  ? "bg-white text-neutral-900 shadow-sm dark:bg-[#15203A] dark:text-[#E2E8F0]"
                  : "text-neutral-600 hover:text-neutral-900 dark:text-[#64748B] dark:hover:text-[#94A3B8]")
              }
            >
              {type.label}
            </button>
          );
        })}
      </div>

      {active === "landing" && <LandingPageMockup palette={palette} />}
      {active === "slides" && <PresentationMockup palette={palette} />}
      {active === "social" && <SocialPostMockup palette={palette} />}
      {active === "ecommerce" && <ShopListingMockup palette={palette} />}
    </div>
  );
}
