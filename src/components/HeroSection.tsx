
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PaletteSelector } from "@/components/PaletteSelector";
import { LiveVisual } from "@/components/LiveVisual";
import { Link } from "react-router-dom";

const HeroSection = () => {
  const [selectedPalette, setSelectedPalette] = useState({
    id: "cosmic-dust",
    name: "Cosmic Dust",
    colors: ["#1a1a2e", "#16213e", "#0f3460", "#533483", "#7209b7"]
  });

  return (
    <section className="container mx-auto px-4 py-4 lg:py-6 max-w-7xl">
      <div className="grid lg:grid-cols-2 gap-4 lg:gap-6 items-start min-h-[500px]">
        {/* Left Side - ColorVerse Info & CTAs */}
        <div className="space-y-3 lg:space-y-4">
          {/* Brand Section */}
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 font-mono">
              ColorVerse
            </h1>
            <p className="text-sm lg:text-base text-gray-600 font-mono mb-3">
              The super fast color palettes generator! Create the perfect palette or get inspired by thousands of beautiful color schemes.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button size="lg" className="font-mono">
              Start the generator!
            </Button>
            <Link to="/explore" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="font-mono w-full">
                Explore trending palettes
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Side - Live Visualizer & Brand Design */}
        <div className="space-y-3 lg:space-y-4 max-w-full">
          {/* Live Visualizer */}
          <Card className="border-0 shadow-xl w-full">
            <CardContent className="p-3 lg:p-4">
              <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-2 font-mono">
                Live Palette Visualizer
              </h2>
              <p className="text-gray-600 mb-3 font-mono text-xs lg:text-sm">
                See how different color palettes transform design in real-time
              </p>
              
              <div className="space-y-3">
                <PaletteSelector 
                  selectedPalette={selectedPalette}
                  onPaletteChange={setSelectedPalette}
                />
                <div className="h-32 lg:h-40 w-full">
                  <LiveVisual palette={selectedPalette} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Brand Design with Purpose */}
          <div className="bg-gray-50 p-3 lg:p-4 rounded-lg max-w-full">
            <h3 className="text-base lg:text-lg font-bold text-gray-900 mb-2 font-mono">
              Brand Design with Purpose
            </h3>
            <p className="text-gray-600 font-mono text-xs lg:text-sm leading-relaxed">
              Every color tells a story. Our AI-powered palette generator creates harmonious color schemes that resonate with your brand's personality.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export { HeroSection };
