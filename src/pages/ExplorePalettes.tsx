
import { Navigation } from "@/components/Navigation";
import { PaletteGrid } from "@/components/PaletteGrid";

const ExplorePalettes = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <section className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 font-mono">
            Explore Palettes
          </h1>
          <p className="text-xl text-gray-600 font-mono max-w-2xl mx-auto">
            Discover over 1000+ unique color palettes crafted by AI and curated by our design community. 
            Find the perfect colors for your next project.
          </p>
        </div>

        <PaletteGrid />
      </section>
    </div>
  );
};

export default ExplorePalettes;
