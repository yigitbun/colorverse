
import { Navigation } from "@/components/Navigation";
import { MinimalistHero } from "@/components/MinimalistHero";
import { FeaturedPalettesWithExamples } from "@/components/FeaturedPalettesWithExamples";
import { GeneratePaletteSection } from "@/components/GeneratePaletteSection";
import { CommunitySnippet } from "@/components/CommunitySnippet";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="pt-6">
        <MinimalistHero />
      </div>
      <FeaturedPalettesWithExamples />
      <GeneratePaletteSection />
      <CommunitySnippet />
      <Footer />
    </div>
  );
};

export default Index;
