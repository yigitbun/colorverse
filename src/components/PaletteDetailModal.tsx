
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Copy, Download, Share2, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Palette {
  id: string;
  name: string;
  colors: string[];
  click_count?: number;
  favorite_count?: number;
}

interface PaletteDetailModalProps {
  palette: Palette;
  isOpen: boolean;
  onClose: () => void;
}

export const PaletteDetailModal = ({ palette, isOpen, onClose }: PaletteDetailModalProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [favoriteCount, setFavoriteCount] = useState(palette.favorite_count || 0);

  // Update favorite count when palette changes
  useEffect(() => {
    setFavoriteCount(palette.favorite_count || 0);
  }, [palette.favorite_count]);

  // Increment click count when modal opens
  useEffect(() => {
    if (isOpen && palette.id) {
      const incrementClickCount = async () => {
        try {
          const { error } = await supabase
            .from('color_palettes')
            .update({ click_count: (palette.click_count || 0) + 1 })
            .eq('id', palette.id);
          
          if (error) {
            console.error('Error incrementing click count:', error);
          }
        } catch (error) {
          console.error('Error:', error);
        }
      };
      
      incrementClickCount();
    }
  }, [isOpen, palette.id, palette.click_count]);

  const copyHexCode = (color: string) => {
    navigator.clipboard.writeText(color);
    toast({
      title: "Copied!",
      description: `${color} copied to clipboard`,
    });
  };

  const copyPalette = () => {
    const paletteString = palette.colors.join(", ");
    navigator.clipboard.writeText(paletteString);
    toast({
      title: "Palette Copied!",
      description: "All colors copied to clipboard",
    });
  };

  const handleFavorite = async () => {
    try {
      const { error } = await supabase
        .from('color_palettes')
        .update({ favorite_count: favoriteCount + 1 })
        .eq('id', palette.id);
      
      if (error) {
        console.error('Error updating favorite count:', error);
        toast({
          title: "Error",
          description: "Failed to update favorite",
          variant: "destructive"
        });
      } else {
        setFavoriteCount(favoriteCount + 1);
        toast({
          title: "Added to favorites!",
          description: "Palette favorited successfully",
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to update favorite",
        variant: "destructive"
      });
    }
  };

  const templates = [
    {
      name: "Website Hero",
      component: (
        <div 
          className="relative overflow-hidden rounded-lg shadow-lg h-48"
          style={{ backgroundColor: palette.colors[palette.colors.length - 1] }}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div 
                className="text-lg font-bold font-mono"
                style={{ color: palette.colors[0] }}
              >
                Brand
              </div>
              <div 
                className="w-8 h-8 rounded-full"
                style={{ backgroundColor: palette.colors[Math.min(2, palette.colors.length - 1)] }}
              />
            </div>
            <h2 
              className="text-2xl font-bold font-mono mb-2"
              style={{ color: palette.colors[0] }}
            >
              Hero Title
            </h2>
            <button
              className="px-4 py-2 rounded font-mono text-sm"
              style={{ 
                backgroundColor: palette.colors[Math.min(1, palette.colors.length - 1)], 
                color: palette.colors[palette.colors.length - 1] || '#ffffff' 
              }}
            >
              Call to Action
            </button>
          </div>
        </div>
      )
    },
    {
      name: "Mobile App",
      component: (
        <div 
          className="w-32 h-48 rounded-2xl shadow-lg mx-auto overflow-hidden"
          style={{ backgroundColor: palette.colors[4] || palette.colors[palette.colors.length - 1] }}
        >
          <div className="p-4">
            <div 
              className="w-full h-8 rounded mb-4"
              style={{ backgroundColor: palette.colors[0] }}
            />
            <div className="space-y-2">
              {palette.colors.slice(0, 3).map((color, index) => (
                <div
                  key={index}
                  className="w-full h-6 rounded"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      name: "Abstract Art",
      component: (
        <div className="h-48 rounded-lg overflow-hidden grid grid-cols-3 gap-1">
          {palette.colors.map((color, index) => (
            <div
              key={index}
              className="transition-all hover:scale-105"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      )
    },
    {
      name: "Business Card",
      component: (
        <div 
          className="w-80 h-48 rounded-lg shadow-lg overflow-hidden mx-auto"
          style={{ backgroundColor: palette.colors[palette.colors.length - 1] }}
        >
          <div className="p-6 h-full flex flex-col justify-between">
            <div>
              <div 
                className="text-xl font-bold font-mono mb-2"
                style={{ color: palette.colors[0] }}
              >
                Your Name
              </div>
              <div 
                className="text-sm font-mono"
                style={{ color: palette.colors[1] || palette.colors[0] }}
              >
                Your Title
              </div>
            </div>
            <div className="flex gap-2">
              {palette.colors.slice(0, 3).map((color, index) => (
                <div
                  key={index}
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Fixed Close Button */}
        <button
          onClick={onClose}
          className="fixed top-4 right-4 z-[60] w-8 h-8 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
          style={{ position: 'fixed' }}
        >
          <X className="w-4 h-4" />
        </button>

        <DialogHeader className="pr-12">
          <DialogTitle className="text-2xl font-mono">{palette.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Palette Display - AT TOP */}
          <div className="space-y-4">
            <div className="flex gap-2 h-20">
              {palette.colors.map((color, index) => (
                <div
                  key={index}
                  className="flex-1 rounded-lg cursor-pointer hover:scale-105 transition-transform border border-gray-200"
                  style={{ backgroundColor: color }}
                  onClick={() => copyHexCode(color)}
                  title={`Click to copy ${color}`}
                />
              ))}
            </div>
            
            {/* Color Codes */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {palette.colors.map((color, index) => (
                <div
                  key={index}
                  className="text-center p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors font-mono text-sm"
                  onClick={() => copyHexCode(color)}
                >
                  {color.toUpperCase()}
                </div>
              ))}
            </div>
          </div>

          {/* Apply to Templates - MOVED TO TOP AFTER PALETTE */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold font-mono">Apply to Templates</h3>
            
            {/* Template Selector */}
            <div className="flex gap-2 flex-wrap">
              {templates.slice(0, 4).map((template, index) => (
                <Button
                  key={index}
                  variant={selectedTemplate === index ? "default" : "outline"}
                  onClick={() => setSelectedTemplate(index)}
                  className="font-mono text-sm"
                >
                  {template.name}
                </Button>
              ))}
            </div>

            {/* Template Display */}
            <div className="bg-gray-50 p-6 rounded-lg">
              {templates[selectedTemplate].component}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 flex-wrap">
            <Button onClick={copyPalette} variant="outline" className="font-mono">
              <Copy className="w-4 h-4 mr-2" />
              Copy Palette
            </Button>
            <Button onClick={handleFavorite} variant="outline" className="font-mono">
              ♥ Favorite ({favoriteCount})
            </Button>
            <Button variant="outline" className="font-mono">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" className="font-mono">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
