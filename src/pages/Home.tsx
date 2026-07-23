import { useEffect, useState } from "react";
import { palettes } from "@/data/palettes";
import { HeroSection } from "@/components/home/HeroSection";
import { StatsStrip } from "@/components/home/StatsStrip";
import { ProblemSection } from "@/components/home/ProblemSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { ShowcaseSection } from "@/components/home/ShowcaseSection";
import { UseCasesSection } from "@/components/home/UseCasesSection";
import { PricingSection } from "@/components/home/PricingSection";
import { Footer } from "@/components/Footer";

const ROTATE_INTERVAL_MS = 3000;

export default function Home() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % palettes.length);
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const featured = palettes[index];

  return (
    <main>
      <HeroSection featured={featured} />
      <StatsStrip />
      <ProblemSection />
      <HowItWorksSection />
      <ShowcaseSection />
      <UseCasesSection />
      <PricingSection />
      <Footer />
    </main>
  );
}
