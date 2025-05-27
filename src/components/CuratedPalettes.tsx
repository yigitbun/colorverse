
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Heart, Bot, Paintbrush } from "lucide-react";
import { Link } from "react-router-dom";
import { DrawingVisual } from "@/components/DrawingVisual";
import { GeometricVisual } from "@/components/GeometricVisual";
import { FloralVisual } from "@/components/FloralVisual";
import { UrbanVisual } from "@/components/UrbanVisual";
import { WaveVisual } from "@/components/WaveVisual";

interface Palette {
  id: string;
  name: string;
  colors: string[];
  isAI: boolean;
  theme: string;
  likes: number;
}

const featuredPalettes: Palette[] = [
  {
    id: "ocean-breeze",
    name: "Ocean Breeze",
    colors: ["#0077be", "#00a8cc", "#40e0d0", "#87ceeb", "#e0f6ff"],
    isAI: true,
    theme: "calm",
    likes: 234
  },
  {
    id: "sunset-warmth",
    name: "Sunset Warmth",
    colors: ["#ff6b35", "#f7931e", "#ffd23f", "#ee4b2b", "#8b0000"],
    isAI: false,
    theme: "warm",
    likes: 189
  },
  {
    id: "forest-depths",
    name: "Forest Depths",
    colors: ["#2d5016", "#4f7942", "#8fbc8f", "#90ee90", "#f0fff0"],
    isAI: true,
    theme: "nature",
    likes: 156
  },
  {
    id: "midnight-purple",
    name: "Midnight Purple",
    colors: ["#2c1810", "#4a148c", "#7b1fa2", "#9c27b0", "#e1bee7"],
    isAI: true,
    theme: "elegant",
    likes: 298
  },
  {
    id: "coral-reef",
    name: "Coral Reef",
    colors: ["#ff7f7f", "#ff6b9d", "#ff8fab", "#ffc0cb", "#fff0f5"],
    isAI: false,
    theme: "vibrant",
    likes: 176
  },
  {
    id: "arctic-ice",
    name: "Arctic Ice",
    colors: ["#e6f3ff", "#b3d9ff", "#80bfff", "#4da6ff", "#1a8cff"],
    isAI: true,
    theme: "cool",
    likes: 143
  }
];

const getVisualizerComponents = (palette: Palette) => [
  () => <DrawingVisual palette={palette} />,
  () => <GeometricVisual palette={palette} />,
  () => <FloralVisual palette={palette} />,
  () => <UrbanVisual palette={palette} />,
  () => <WaveVisual palette={palette} />
];

export const CuratedPalettes = () => {
  const [currentVisualIndex, setCurrentVisualIndex] = useState<{[key: string]: number}>({});

  const handlePreviousVisual = (paletteId: string) => {
    setCurrentVisualIndex(prev => ({
      ...prev,
      [paletteId]: Math.max(0, (prev[paletteId] || 0) - 1)
    }));
  };

  const handleNextVisual = (paletteId: string) => {
    setCurrentVisualIndex(prev => ({
      ...prev,
      [paletteId]: Math.min(4, (prev[paletteId] || 0) + 1)
    }));
  };

  const getCurrentVisualizer = (palette: Palette) => {
    const visualizers = getVisualizerComponents(palette);
    const currentIndex = currentVisualIndex[palette.id] || 0;
    return visualizers[currentIndex]();
  };

  return (
    <section className="container mx-auto px-4 py-8 lg:py-12 bg-gray-50 max-w-7xl">
      <div className="text-center mb-6 lg:mb-8">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3 font-mono">
          Featured Palettes
        </h2>
        <p className="text-base lg:text-lg text-gray-600 font-mono max-w-2xl mx-auto">
          Discover handpicked color palettes with multiple visual styles. Each palette comes with 5 different graphic representations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {featuredPalettes.map((palette) => (
          <Card key={palette.id} className="hover:shadow-lg transition-all duration-300 overflow-hidden">
            <CardContent className="p-3 lg:p-4">
              <div className="space-y-3">
                {/* Color Swatches */}
                <div className="flex gap-1 h-10 lg:h-12 rounded-lg overflow-hidden">
                  {palette.colors.map((color, index) => (
                    <div
                      key={index}
                      className="flex-1"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                
                {/* Visual Gallery */}
                <div className="relative">
                  <div className="w-full h-24 lg:h-28 rounded-lg overflow-hidden bg-gray-100">
                    {getCurrentVisualizer(palette)}
                  </div>
                  
                  {/* Gallery Navigation */}
                  <div className="absolute inset-0 flex items-center justify-between px-2 opacity-0 hover:opacity-100 transition-opacity duration-200">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6 lg:h-8 lg:w-8 bg-white/80 hover:bg-white"
                      onClick={() => handlePreviousVisual(palette.id)}
                      disabled={(currentVisualIndex[palette.id] || 0) === 0}
                    >
                      <ChevronLeft className="h-3 w-3 lg:h-4 lg:w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6 lg:h-8 lg:w-8 bg-white/80 hover:bg-white"
                      onClick={() => handleNextVisual(palette.id)}
                      disabled={(currentVisualIndex[palette.id] || 0) === 4}
                    >
                      <ChevronRight className="h-3 w-3 lg:h-4 lg:w-4" />
                    </Button>
                  </div>
                  
                  {/* Visual Indicator */}
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                    {[0, 1, 2, 3, 4].map((index) => (
                      <div
                        key={index}
                        className={`w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full ${
                          (currentVisualIndex[palette.id] || 0) === index 
                            ? 'bg-white' 
                            : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Palette Info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 font-mono text-sm lg:text-base">
                      {palette.name}
                    </h3>
                    <div className="flex items-center gap-1">
                      {palette.isAI ? (
                        <Bot className="w-3 h-3 lg:w-4 lg:h-4 text-blue-500" />
                      ) : (
                        <Paintbrush className="w-3 h-3 lg:w-4 lg:h-4 text-green-500" />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs lg:text-sm text-gray-500 font-mono">
                    <span className="capitalize">{palette.theme}</span>
                    <div className="flex items-center gap-1">
                      <Heart className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
                      <span>{palette.likes}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center mt-6 lg:mt-8">
        <Link to="/explore">
          <Button variant="outline" size="lg" className="font-mono">
            View All Palettes
          </Button>
        </Link>
      </div>
    </section>
  );
};
