
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Heart, Download } from "lucide-react";
import { Link } from "react-router-dom";

interface TrendingPalette {
  id: string;
  name: string;
  colors: string[];
  category: string;
  likes: number;
}

const trendingPalettes: TrendingPalette[] = [
  {
    id: "cyber-punk",
    name: "Cyber Punk",
    colors: ["#FF0080", "#8000FF", "#0080FF", "#00FF80", "#FF8000"],
    category: "Digital",
    likes: 432
  },
  {
    id: "minimal-zen",
    name: "Minimal Zen",
    colors: ["#F8F8F8", "#E8E8E8", "#C8C8C8", "#888888", "#404040"],
    category: "Minimal",
    likes: 387
  },
  {
    id: "tropical-sunset",
    name: "Tropical Sunset",
    colors: ["#FF6B35", "#F7931E", "#FFD23F", "#FF8E9B", "#C490D1"],
    category: "Nature",
    likes: 298
  },
  {
    id: "corporate-blue",
    name: "Corporate Blue",
    colors: ["#0B2447", "#1B4B73", "#2E6B9E", "#4A8BC2", "#73AAD4"],
    category: "Business",
    likes: 256
  }
];

export const TrendingSection = () => {
  return (
    <section className="bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900 font-mono">
              Trending Colors
            </h2>
          </div>
          <Link to="/explore">
            <Button variant="outline" className="font-mono">
              View All Trends
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingPalettes.map((palette) => (
            <Card key={palette.id} className="group hover:shadow-lg transition-all duration-300">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Color Swatches */}
                  <div className="flex gap-1 h-12 rounded-lg overflow-hidden">
                    {palette.colors.map((color, index) => (
                      <div
                        key={index}
                        className="flex-1 transition-transform duration-200 group-hover:scale-105"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  
                  {/* Palette Info */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 font-mono text-sm">
                        {palette.name}
                      </h3>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono">
                        {palette.category}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-gray-500 font-mono">
                        <Heart className="w-3 h-3" />
                        <span>{palette.likes}</span>
                      </div>
                      <Button variant="ghost" size="sm" className="h-6 px-2">
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <h3 className="text-xl font-bold text-gray-900 mb-2 font-mono">
            Find popular color palettes across design categories
          </h3>
          <p className="text-gray-600 font-mono mb-4">
            Discover palettes from Behance and Adobe Stock creative communities
          </p>
          <Link to="/explore">
            <Button size="lg" className="font-mono">
              Explore Color Trends
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
