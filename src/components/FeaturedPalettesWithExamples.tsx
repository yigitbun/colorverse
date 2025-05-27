
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PaletteDetailModal } from "@/components/PaletteDetailModal";
import { supabase } from "@/integrations/supabase/client";
import { professionalPalettes } from "@/data/professionalPalettes";
import { PaletteDesignExample } from "@/components/PaletteDesignExample";
import { FunctionalHeartButton } from "@/components/FunctionalHeartButton";

interface Palette {
  id: string;
  name: string;
  colors: string[];
  favorite_count?: number;
  click_count?: number;
}

export const FeaturedPalettesWithExamples = () => {
  const [palettes, setPalettes] = useState<Palette[]>([]);
  const [selectedPalette, setSelectedPalette] = useState<Palette | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedPalettes = async () => {
      try {
        const { data: supabasePalettes, error } = await supabase
          .from('color_palettes')
          .select('*')
          .order('favorite_count', { ascending: false })
          .limit(8);

        if (error) {
          console.error('Error fetching palettes:', error);
        }

        // Combine with professional palettes as fallback
        const featuredPalettes = [
          ...(supabasePalettes || []).map(p => ({
            id: p.id,
            name: p.name,
            colors: p.colors,
            favorite_count: p.favorite_count || 0,
            click_count: p.click_count || 0
          })),
          ...professionalPalettes.slice(0, 8 - (supabasePalettes?.length || 0)).map(p => ({
            id: p.id,
            name: p.name,
            colors: p.colors,
            favorite_count: p.likes || 0,
            click_count: p.clickCount || 0
          }))
        ].slice(0, 8);

        setPalettes(featuredPalettes);
      } catch (error) {
        console.error('Error:', error);
        // Fallback to professional palettes
        const fallbackPalettes = professionalPalettes.slice(0, 8).map(p => ({
          id: p.id,
          name: p.name,
          colors: p.colors,
          favorite_count: p.likes || 0,
          click_count: p.clickCount || 0
        }));
        setPalettes(fallbackPalettes);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedPalettes();
  }, []);

  // Refresh palettes when a favorite is updated
  const refreshPalettes = async () => {
    try {
      const { data: supabasePalettes, error } = await supabase
        .from('color_palettes')
        .select('*')
        .order('favorite_count', { ascending: false })
        .limit(8);

      if (!error && supabasePalettes) {
        const updatedPalettes = supabasePalettes.map(p => ({
          id: p.id,
          name: p.name,
          colors: p.colors,
          favorite_count: p.favorite_count || 0,
          click_count: p.click_count || 0
        }));
        setPalettes(updatedPalettes);
      }
    } catch (error) {
      console.error('Error refreshing palettes:', error);
    }
  };

  // Listen for palette updates
  useEffect(() => {
    const channel = supabase
      .channel('palette-updates')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'color_palettes' 
      }, () => {
        refreshPalettes();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="text-center mb-12">
          <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="h-80 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-mono">
            Featured Palettes
          </h2>
          <p className="text-lg text-gray-600 font-mono max-w-2xl mx-auto">
            Discover trending color combinations with real design examples
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {palettes.map((palette) => (
            <Card 
              key={palette.id} 
              className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-md"
              onClick={() => setSelectedPalette(palette)}
            >
              <CardContent className="p-0">
                <div className="space-y-0">
                  {/* Design Example */}
                  <div className="h-48 w-full bg-gray-50 rounded-t-lg overflow-hidden">
                    <PaletteDesignExample palette={palette} />
                  </div>
                  
                  {/* Color Swatches */}
                  <div className="flex h-16">
                    {palette.colors.map((color, index) => (
                      <div
                        key={index}
                        className="flex-1"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  
                  {/* Palette Info */}
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 font-mono text-sm truncate">
                        {palette.name}
                      </h3>
                      <FunctionalHeartButton 
                        paletteId={palette.id}
                        initialCount={palette.favorite_count || 0}
                      />
                    </div>
                    <div className="text-xs text-gray-500 font-mono mt-1">
                      {palette.favorite_count || 0} likes
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Link to="/explore">
            <Button variant="outline" size="lg" className="font-mono px-8">
              View All Palettes
            </Button>
          </Link>
        </div>
      </section>

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
