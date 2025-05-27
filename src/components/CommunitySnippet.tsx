
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Heart, Palette as PaletteIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface CommunityStats {
  total_members: number;
  total_palettes: number;
  total_likes: number;
  featured_palettes: number;
}

export const CommunitySnippet = () => {
  const [stats, setStats] = useState<CommunityStats>({
    total_members: 0,
    total_palettes: 0,
    total_likes: 0,
    featured_palettes: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data, error } = await supabase
          .from('community_stats')
          .select('*')
          .single();

        if (error) {
          console.error('Error fetching community stats:', error);
        } else if (data) {
          setStats(data);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <section className="container mx-auto px-4 py-16 max-w-6xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-mono">
          Join the ColorVerse Community
        </h2>
        <p className="text-lg text-gray-600 font-mono">
          Connect with designers and color enthusiasts worldwide
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="text-center border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-gray-900 font-mono">
                  {stats.total_members.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 font-mono">
                  Active Members
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="text-center border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-3">
              <div className="p-3 bg-green-100 rounded-full">
                <PaletteIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-gray-900 font-mono">
                  {stats.total_palettes.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 font-mono">
                  Palettes Shared
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="text-center border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-3">
              <div className="p-3 bg-red-100 rounded-full">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-gray-900 font-mono">
                  {stats.total_likes.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 font-mono">
                  Total Likes
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Link to="/community">
          <Button variant="outline" size="lg" className="font-mono px-8">
            Explore Community
          </Button>
        </Link>
      </div>
    </section>
  );
};
