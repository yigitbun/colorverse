import { useState, useEffect } from "react";
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
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkIfLiked = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('user_favorites')
        .select('*')
        .eq('user_id', user.id)
        .eq('palette_id', paletteId)
        .single();

      setIsLiked(!!data);
    };

    checkIfLiked();
  }, [paletteId]);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isLoading) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to like palettes",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isLiked) {
        // Unlike
        const { error: favoriteError } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('palette_id', paletteId);

        const { error: updateError } = await supabase
          .from('color_palettes')
          .update({ favorite_count: favoriteCount - 1 })
          .eq('id', paletteId);

        if (favoriteError || updateError) throw new Error('Failed to unlike');

        setFavoriteCount(prev => prev - 1);
        setIsLiked(false);
        toast({
          title: "Removed from favorites",
          description: "Palette removed from your favorites",
        });
      } else {
        // Like
        const { error: favoriteError } = await supabase
          .from('user_favorites')
          .insert({ user_id: user.id, palette_id: paletteId });

        const { error: updateError } = await supabase
          .from('color_palettes')
          .update({ favorite_count: favoriteCount + 1 })
          .eq('id', paletteId);

        if (favoriteError || updateError) throw new Error('Failed to like');

        setFavoriteCount(prev => prev + 1);
        setIsLiked(true);
        toast({
          title: "Added to favorites!",
          description: "Palette added to your favorites",
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
      <Heart 
        className={`${size === "sm" ? "h-4 w-4" : "h-5 w-5"} transition-colors ${
          isLiked ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-500"
        }`} 
      />
      {size !== "sm" && <span className="text-xs text-gray-500">{favoriteCount}</span>}
    </Button>
  );
};