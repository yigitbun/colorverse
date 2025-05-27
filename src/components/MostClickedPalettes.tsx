
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { PaletteDetailModal } from "@/components/PaletteDetailModal";
import { supabase } from "@/integrations/supabase/client";
import { professionalPalettes } from "@/data/professionalPalettes";

interface Palette {
  id: string;
  name: string;
  colors: string[];
  click_count: number;
  favorite_count?: number;
}

export const MostClickedPalettes = () => {
  const [selectedPalette, setSelectedPalette] = useState<Palette | null>(null);
  const [popularPalettes, setPopularPalettes] = useState<Palette[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMostClickedPalettes = async () => {
      try {
        const { data: supabasePalettes, error } = await supabase
          .from('color_palettes')
          .select('*')
          .order('click_count', { ascending: false })
          .limit(5);

        if (error) {
          console.error('Error fetching most clicked palettes:', error);
        }

        // If we have Supabase data, use it; otherwise fall back to professional palettes
        if (supabasePalettes && supabasePalettes.length > 0) {
          const palettes = supabasePalettes.map(p => ({
            id: p.id,
            name: p.name,
            colors: p.colors,
            click_count: p.click_count || 0,
            favorite_count: p.favorite_count || 0
          }));
          setPopularPalettes(palettes);
        } else {
          // Fallback to professional palettes sorted by click count
          const fallbackPalettes = professionalPalettes
            .sort((a, b) => b.clickCount - a.clickCount)
            .slice(0, 5)
            .map(p => ({
              id: p.id,
              name: p.name,
              colors: p.colors,
              click_count: p.clickCount,
              favorite_count: p.likes
            }));
          setPopularPalettes(fallbackPalettes);
        }
      } catch (error) {
        console.error('Error:', error);
        // Final fallback
        const fallbackPalettes = professionalPalettes
          .sort((a, b) => b.clickCount - a.clickCount)
          .slice(0, 5)
          .map(p => ({
            id: p.id,
            name: p.name,
            colors: p.colors,
            click_count: p.clickCount,
            favorite_count: p.likes
          }));
        setPopularPalettes(fallbackPalettes);
      } finally {
        setLoading(false);
      }
    };

    fetchMostClickedPalettes();
  }, []);

  if (loading) {
    return (
      <div className="mb-16">
        <div className="text-center mb-8">
          <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 font-mono">
            Most Clicked Palettes
          </h2>
          <p className="text-gray-600 font-mono">
            Discover the most popular color combinations in our universe
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
          {popularPalettes.map((palette) => (
            <Card 
              key={palette.id} 
              className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
              onClick={() => setSelectedPalette(palette)}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex gap-1 h-16">
                    {palette.colors.map((color, index) => (
                      <div
                        key={index}
                        className="flex-1 rounded-sm"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-900 font-mono text-sm">
                      {palette.name}
                    </h3>
                    <p className="text-xs text-gray-500 font-mono">
                      {palette.click_count} clicks
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button variant="outline" className="font-mono">
            Explore All Palettes
          </Button>
        </div>
      </div>

      {selectedPalette && (
        <PaletteDetailModal
          palette={selectedPalette}
          isOpen={!!selectedPalette}
          onClose={() => setSelectedPalette(null)}
        />
      )}
    </>
  );
};
