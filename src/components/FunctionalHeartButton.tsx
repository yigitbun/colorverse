
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface FunctionalHeartButtonProps {
  paletteId: string;
  initialCount: number;
  size?: "sm" | "default";
}

export const FunctionalHeartButton = ({ paletteId, initialCount, size = "sm" }: FunctionalHeartButtonProps) => {
  const [favoriteCount, setFavoriteCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent click events
    
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('color_palettes')
        .update({ favorite_count: favoriteCount + 1 })
        .eq('id', paletteId);
      
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size={size}
      className={`${size === "sm" ? "h-8 w-8 p-0" : ""} hover:bg-gray-100 flex items-center gap-1`}
      onClick={handleFavorite}
      disabled={isLoading}
    >
      <Heart className={`${size === "sm" ? "h-4 w-4" : "h-5 w-5"} text-gray-400 hover:text-red-500 transition-colors`} />
      {size !== "sm" && <span className="text-xs text-gray-500">{favoriteCount}</span>}
    </Button>
  );
};
