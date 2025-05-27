
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Palette {
  id: string;
  name: string;
  colors: string[];
}

interface PaletteSelectorProps {
  selectedPalette: Palette;
  onPaletteChange: (palette: Palette) => void;
}

const palettes: Palette[] = [
  // Original palettes
  {
    id: "cosmic-dust",
    name: "Cosmic Dust",
    colors: ["#1a1a2e", "#16213e", "#0f3460", "#533483", "#7209b7"]
  },
  {
    id: "ocean-breeze",
    name: "Ocean Breeze",
    colors: ["#87CEEB", "#B0E0E6", "#ADD8E6", "#5F9EA0", "#F0F8FF"]
  },
  {
    id: "sunset-glow",
    name: "Sunset Glow",
    colors: ["#FF5733", "#FFC300", "#E67E22", "#F1C40F"]
  },
  {
    id: "forest-calm",
    name: "Forest Calm",
    colors: ["#2F4F4F", "#5F9EA0", "#8FBC8F", "#A2B59F", "#DCDCDC"]
  },
  // New 20 palettes
  {
    id: "urban-cool",
    name: "Urban Cool",
    colors: ["#2C3E50", "#5E7A8E", "#95A5A6"]
  },
  {
    id: "soft-earth",
    name: "Soft Earth",
    colors: ["#6B7A89", "#95A5A6", "#C8D1D8", "#E9ECF0"]
  },
  {
    id: "deep-blue-accent",
    name: "Deep Blue Accent",
    colors: ["#2980B9", "#34495E", "#7F8C8D", "#C0C0C0", "#F8F8F8"]
  },
  {
    id: "electric-sunset",
    name: "Electric Sunset",
    colors: ["#FF5733", "#FFC300", "#E67E22"]
  },
  {
    id: "digital-pop",
    name: "Digital Pop",
    colors: ["#9B59B6", "#3498DB", "#2ECC71", "#F1C40F"]
  },
  {
    id: "cloud-whisper",
    name: "Cloud Whisper",
    colors: ["#BDC3C7", "#ECF0F1", "#F8F8F8"]
  },
  {
    id: "misty-green",
    name: "Misty Green",
    colors: ["#778899", "#B0C4DE", "#DCDCDC", "#2F4F4F"]
  },
  {
    id: "regal-plum",
    name: "Regal Plum",
    colors: ["#4A007F", "#6A00A6", "#9B009B"]
  },
  {
    id: "deep-emerald",
    name: "Deep Emerald",
    colors: ["#004B49", "#00736A", "#008C7F", "#212121"]
  },
  {
    id: "pastel-pop",
    name: "Pastel Pop",
    colors: ["#ADD8E6", "#90EE90", "#FFB6C1"]
  },
  {
    id: "warm-neutral",
    name: "Warm Neutral",
    colors: ["#7B7B7B", "#A0A0A0", "#C8C8C8", "#EBEBEB", "#FAF3E0"]
  },
  {
    id: "vibrant-contrast",
    name: "Vibrant Contrast",
    colors: ["#E74C3C", "#2ECC71", "#3498DB", "#F1C40F", "#9B59B6", "#E67E22", "#1ABC9C"]
  },
  {
    id: "midnight-sapphire",
    name: "Midnight Sapphire",
    colors: ["#0A1C2B", "#1F3B54", "#345A73", "#7F8C8D", "#ECF0F1"]
  },
  {
    id: "soft-lavender",
    name: "Soft Lavender",
    colors: ["#E6E6FA", "#D8BFD8", "#B2A2D4", "#9370DB", "#5B4785"]
  },
  {
    id: "aqua-burst",
    name: "Aqua Burst",
    colors: ["#00FFFF", "#33CCCC", "#3498DB", "#1ABC9C", "#2C3E50"]
  },
  {
    id: "desert-blossom",
    name: "Desert Blossom",
    colors: ["#D2B48C", "#F5DEB3", "#FFE4B5", "#FFC7B3", "#FDF5E6", "#FAEBD7"]
  },
  {
    id: "gothic-ruby",
    name: "Gothic Ruby",
    colors: ["#800000", "#B22222", "#DC143C", "#212121", "#F0F0F0", "#FFFFFF"]
  },
  {
    id: "neon-accents",
    name: "Neon Accents",
    colors: ["#FF00FF", "#00FF00", "#FFFF00", "#212121", "#F0F0F0", "#FFFFFF"]
  },
  {
    id: "charcoal-gold",
    name: "Charcoal & Gold",
    colors: ["#212121", "#333333", "#616161", "#D4AF37", "#F0F0F0", "#FFD700", "#FFA500"]
  },
  {
    id: "tropical-energy",
    name: "Tropical Energy",
    colors: ["#FF6347", "#FFD700", "#ADFF2F", "#1E90FF", "#2F4F4F", "#FF69B4", "#32CD32"]
  },
  {
    id: "retro-futurism",
    name: "Retro Futurism",
    colors: ["#9B59B6", "#3498DB", "#F1C40F", "#FF00FF", "#00FFFF"]
  }
];

// Import all visual components
import { NetworkVisual } from "./NetworkVisual";
import { AbstractVisual } from "./AbstractVisual";
import { RibbonVisual } from "./RibbonVisual";
import { SpiralVisual } from "./SpiralVisual";
import { GeometricVisual } from "./GeometricVisual";
import { FloralVisual } from "./FloralVisual";
import { UrbanVisual } from "./UrbanVisual";
import { WaveVisual } from "./WaveVisual";
import { CircuitVisual } from "./CircuitVisual";
import { CrystalVisual } from "./CrystalVisual";
import { FeatherVisual } from "./FeatherVisual";
import { MosaicVisual } from "./MosaicVisual";
import { ConstellationVisual } from "./ConstellationVisual";
import { MountainVisual } from "./MountainVisual";
import { LeafVisual } from "./LeafVisual";
import { DiamondVisual } from "./DiamondVisual";
import { HexagonVisual } from "./HexagonVisual";
import { TriangleVisual } from "./TriangleVisual";
import { LightningVisual } from "./LightningVisual";
import { FireVisual } from "./FireVisual";
import { CloudVisual } from "./CloudVisual";
import { BookVisual } from "./BookVisual";
import { GradientVisual } from "./GradientVisual";

const visualComponents = [
  NetworkVisual, AbstractVisual, RibbonVisual, SpiralVisual, GeometricVisual,
  FloralVisual, UrbanVisual, WaveVisual, CircuitVisual, CrystalVisual,
  FeatherVisual, MosaicVisual, ConstellationVisual, MountainVisual, LeafVisual,
  DiamondVisual, HexagonVisual, TriangleVisual, LightningVisual, FireVisual,
  CloudVisual, BookVisual, GradientVisual
];

export const PaletteSelector = ({ selectedPalette, onPaletteChange }: PaletteSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentVisualIndex, setCurrentVisualIndex] = useState(0);

  const handlePaletteSelect = (palette: Palette) => {
    // Randomly select a new visual component
    const randomIndex = Math.floor(Math.random() * visualComponents.length);
    setCurrentVisualIndex(randomIndex);
    
    onPaletteChange(palette);
    setIsOpen(false);
  };

  const CurrentVisual = visualComponents[currentVisualIndex];

  return (
    <div className="space-y-4">
      <div className="relative">
        <Button 
          variant="outline" 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full justify-between font-mono"
        >
          {selectedPalette.name}
          <ChevronDown className="h-4 w-4" />
        </Button>
        
        {isOpen && (
          <Card className="absolute top-full left-0 right-0 z-50 mt-2 max-h-64 overflow-y-auto">
            <CardContent className="p-2">
              {palettes.map((palette) => (
                <button
                  key={palette.id}
                  onClick={() => handlePaletteSelect(palette)}
                  className="w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      {palette.colors.slice(0, 5).map((color, index) => (
                        <div
                          key={index}
                          className="w-4 h-4 rounded-sm"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <span className="font-mono text-sm">{palette.name}</span>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Display current palette colors */}
      <div className="flex gap-2">
        {selectedPalette.colors.map((color, index) => (
          <div
            key={index}
            className="flex-1 h-8 rounded-md"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      
      {/* Random visual component */}
      <div className="mt-4">
        <CurrentVisual palette={selectedPalette} />
      </div>
    </div>
  );
};
