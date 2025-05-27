
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Bot, Paintbrush, Heart } from "lucide-react";
import { PaletteDetailModal } from "@/components/PaletteDetailModal";
import { supabase } from "@/integrations/supabase/client";
import { professionalPalettes } from "@/data/professionalPalettes";
import { DrawingVisual } from "@/components/DrawingVisual";
import { GeometricVisual } from "@/components/GeometricVisual";
import { FloralVisual } from "@/components/FloralVisual";
import { UrbanVisual } from "@/components/UrbanVisual";
import { WaveVisual } from "@/components/WaveVisual";
import { AbstractVisual } from "@/components/AbstractVisual";
import { CrystalVisual } from "@/components/CrystalVisual";
import { SpiralVisual } from "@/components/SpiralVisual";
import { RibbonVisual } from "@/components/RibbonVisual";
import { MosaicVisual } from "@/components/MosaicVisual";

interface Palette {
  id: string;
  name: string;
  colors: string[];
  source?: 'ai_generated' | 'human_curated';
  tags?: string[];
  favorite_count?: number;
  click_count?: number;
  isAI?: boolean;
  theme?: string;
  likes?: number;
}

const getRandomVisualizer = (palette: Palette) => {
  const visualizers = [
    () => <DrawingVisual palette={palette} />,
    () => <GeometricVisual palette={palette} />,
    () => <FloralVisual palette={palette} />,
    () => <UrbanVisual palette={palette} />,
    () => <WaveVisual palette={palette} />,
    () => <AbstractVisual palette={palette} />,
    () => <CrystalVisual palette={palette} />,
    () => <SpiralVisual palette={palette} />,
    () => <RibbonVisual palette={palette} />,
    () => <MosaicVisual palette={palette} />
  ];
  
  // Use palette id for consistent randomization
  const index = palette.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % visualizers.length;
  return visualizers[index]();
};

export const PaletteGrid = () => {
  const [palettes, setPalettes] = useState<Palette[]>([]);
  const [filteredPalettes, setFilteredPalettes] = useState<Palette[]>([]);
  const [selectedPalette, setSelectedPalette] = useState<Palette | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [themeFilter, setThemeFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPalettes = async () => {
      try {
        const { data: supabasePalettes, error } = await supabase
          .from('color_palettes')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching palettes:', error);
        }

        // Combine Supabase palettes with professional palettes data
        const combinedPalettes = [
          ...(supabasePalettes || []).map(p => ({
            id: p.id,
            name: p.name,
            colors: p.colors,
            source: p.source,
            tags: p.tags || [],
            favorite_count: p.favorite_count,
            click_count: p.click_count
          })),
          ...professionalPalettes.map(p => ({
            id: p.id,
            name: p.name,
            colors: p.colors,
            source: p.isAI ? 'ai_generated' as const : 'human_curated' as const,
            tags: [p.theme],
            favorite_count: p.likes,
            click_count: p.clickCount
          }))
        ];

        setPalettes(combinedPalettes);
        setFilteredPalettes(combinedPalettes);
      } catch (error) {
        console.error('Error:', error);
        // Fallback to professional palettes only
        const fallbackPalettes = professionalPalettes.map(p => ({
          id: p.id,
          name: p.name,
          colors: p.colors,
          source: p.isAI ? 'ai_generated' as const : 'human_curated' as const,
          tags: [p.theme],
          favorite_count: p.likes,
          click_count: p.clickCount
        }));
        setPalettes(fallbackPalettes);
        setFilteredPalettes(fallbackPalettes);
      } finally {
        setLoading(false);
      }
    };

    fetchPalettes();
  }, []);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    applyFilters(term, themeFilter, sourceFilter, sortBy);
  };

  const applyFilters = (search: string, theme: string, source: string, sort: string) => {
    let filtered = [...palettes];

    // Search filter
    if (search) {
      filtered = filtered.filter(palette => 
        palette.name.toLowerCase().includes(search.toLowerCase()) ||
        palette.colors.some(color => color.toLowerCase().includes(search.toLowerCase())) ||
        palette.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Theme filter
    if (theme !== "all") {
      filtered = filtered.filter(palette => 
        palette.tags?.includes(theme)
      );
    }

    // Source filter
    if (source === "ai") {
      filtered = filtered.filter(palette => palette.source === 'ai_generated');
    } else if (source === "human") {
      filtered = filtered.filter(palette => palette.source === 'human_curated');
    }

    // Sort
    if (sort === "popular") {
      filtered.sort((a, b) => (b.click_count || 0) - (a.click_count || 0));
    } else if (sort === "likes") {
      filtered.sort((a, b) => (b.favorite_count || 0) - (a.favorite_count || 0));
    }

    setFilteredPalettes(filtered);
  };

  const themes = ["space", "ocean", "nature", "sunset", "minimalist", "vibrant", "dark", "warm", "cool"];

  if (loading) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="bg-gray-50 p-6 rounded-lg animate-pulse">
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      <div className="space-y-8">
        {/* Search and Filters */}
        <div className="bg-gray-50 p-4 lg:p-6 rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search palettes..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 font-mono"
              />
            </div>

            {/* Theme Filter */}
            <Select value={themeFilter} onValueChange={(value) => {
              setThemeFilter(value);
              applyFilters(searchTerm, value, sourceFilter, sortBy);
            }}>
              <SelectTrigger className="font-mono">
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Themes</SelectItem>
                {themes.map(theme => (
                  <SelectItem key={theme} value={theme}>
                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Source Filter */}
            <Select value={sourceFilter} onValueChange={(value) => {
              setSourceFilter(value);
              applyFilters(searchTerm, themeFilter, value, sortBy);
            }}>
              <SelectTrigger className="font-mono">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="ai">AI Generated</SelectItem>
                <SelectItem value="human">Human Curated</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(value) => {
              setSortBy(value);
              applyFilters(searchTerm, themeFilter, sourceFilter, value);
            }}>
              <SelectTrigger className="font-mono">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="popular">Most Clicked</SelectItem>
                <SelectItem value="likes">Most Liked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-gray-600 font-mono">
          Showing {filteredPalettes.length} of {palettes.length} palettes
        </div>

        {/* Palette Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {filteredPalettes.map((palette) => (
            <Card 
              key={palette.id} 
              className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 w-full"
              onClick={() => setSelectedPalette(palette)}
            >
              <CardContent className="p-3 lg:p-4">
                <div className="space-y-3">
                  {/* Color Swatches */}
                  <div className="flex gap-1 h-12 lg:h-16 w-full">
                    {palette.colors.map((color, index) => (
                      <div
                        key={index}
                        className="flex-1 rounded-sm"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  
                  {/* Mini Visualizer */}
                  <div className="h-16 lg:h-20 w-full overflow-hidden rounded">
                    {getRandomVisualizer(palette)}
                  </div>
                  
                  {/* Palette Info */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 font-mono text-sm truncate">
                        {palette.name}
                      </h3>
                      <div className="flex items-center gap-1">
                        {palette.source === 'ai_generated' ? (
                          <Bot className="w-3 h-3 text-blue-500" />
                        ) : (
                          <Paintbrush className="w-3 h-3 text-green-500" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 font-mono">
                      <span>{palette.colors.length} colors</span>
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        <span>{palette.favorite_count || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center">
          <Button variant="outline" className="font-mono">
            Load More Palettes
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
    </div>
  );
};
