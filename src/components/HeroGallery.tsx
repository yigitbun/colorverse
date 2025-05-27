
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { DrawingVisual } from "@/components/DrawingVisual";
import { GeometricVisual } from "@/components/GeometricVisual";
import { FloralVisual } from "@/components/FloralVisual";
import { UrbanVisual } from "@/components/UrbanVisual";
import { WaveVisual } from "@/components/WaveVisual";
import { AbstractVisual } from "@/components/AbstractVisual";

interface Palette {
  id: string;
  name: string;
  colors: string[];
}

const heroePalettes: Palette[] = [
  {
    id: "ocean-wave",
    name: "Ocean Wave",
    colors: ["#0A2463", "#1E407C", "#335C96", "#4D7AB0", "#6699CB"]
  },
  {
    id: "vintage-tv",
    name: "Vintage TV",
    colors: ["#A8D5BA", "#7A9B6B", "#4A4A4A", "#D2B48C", "#8B4513"]
  },
  {
    id: "dark-floral",
    name: "Dark Floral",
    colors: ["#FF1744", "#4A148C", "#2E2E2E", "#FF6B9D", "#D32F2F"]
  },
  {
    id: "neon-tech",
    name: "Neon Tech",
    colors: ["#00BCD4", "#E91E63", "#1A1A2E", "#FF00FF", "#00FFFF"]
  },
  {
    id: "spring-bloom",
    name: "Spring Bloom",
    colors: ["#FF69B4", "#FFD700", "#ADFF2F", "#87CEEB", "#F0F8FF"]
  },
  {
    id: "santorini",
    name: "Santorini",
    colors: ["#1E88E5", "#BBDEFB", "#FFF", "#FFB74D", "#FF8A65"]
  },
  {
    id: "autumn-gold",
    name: "Autumn Gold",
    colors: ["#FFD700", "#FF8C00", "#D2691E", "#8B4513", "#A0522D"]
  }
];

const visualComponents = [DrawingVisual, GeometricVisual, FloralVisual, UrbanVisual, WaveVisual, AbstractVisual];

const getVisualComponent = (index: number) => {
  return visualComponents[index % visualComponents.length];
};

export const HeroGallery = () => {
  const [selectedPalette, setSelectedPalette] = useState<Palette | null>(null);

  return (
    <section className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-mono">
          ColorVerse
        </h1>
        <p className="text-lg text-gray-600 font-mono mb-6 max-w-3xl mx-auto">
          Discover trending color palettes from different design categories. 
          Create perfect color schemes with our AI-powered generator.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" className="font-mono px-8">
            Start Creating
          </Button>
          <Link to="/explore">
            <Button variant="outline" size="lg" className="font-mono px-8 w-full sm:w-auto">
              Explore All Palettes
            </Button>
          </Link>
        </div>
      </div>

      {/* Visual Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {heroePalettes.map((palette, index) => {
          const VisualComponent = getVisualComponent(index);
          return (
            <div
              key={palette.id}
              className="group cursor-pointer"
              onClick={() => setSelectedPalette(palette)}
            >
              <div className="relative overflow-hidden rounded-lg aspect-[4/3] mb-3">
                <div className="absolute inset-0 transform transition-transform duration-300 group-hover:scale-105">
                  <VisualComponent palette={palette} />
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              </div>
              
              {/* Color Swatches */}
              <div className="flex gap-1 h-8 rounded-md overflow-hidden mb-2">
                {palette.colors.map((color, colorIndex) => (
                  <div
                    key={colorIndex}
                    className="flex-1"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              
              <h3 className="font-semibold text-gray-900 font-mono text-sm">
                {palette.name}
              </h3>
            </div>
          );
        })}
      </div>

      {/* Selected Palette Details */}
      {selectedPalette && (
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 font-mono">
              {selectedPalette.name}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedPalette(null)}
              className="font-mono"
            >
              ✕
            </Button>
          </div>
          
          <div className="grid grid-cols-5 gap-2 mb-4">
            {selectedPalette.colors.map((color, index) => (
              <div key={index} className="text-center">
                <div
                  className="w-full h-16 rounded-md mb-2"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs font-mono text-gray-600">{color}</span>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Button className="font-mono">Apply to Template</Button>
            <Button variant="outline" className="font-mono">Save Palette</Button>
          </div>
        </div>
      )}
    </section>
  );
};
