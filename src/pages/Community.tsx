
import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Palette, Heart, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MostClickedPalettes } from "@/components/MostClickedPalettes";

interface CommunityStats {
  total_members: number;
  total_palettes: number;
  total_likes: number;
  featured_palettes: number;
}

const Community = () => {
  const [stats, setStats] = useState<CommunityStats>({
    total_members: 0,
    total_palettes: 0,
    total_likes: 0,
    featured_palettes: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data, error } = await supabase
          .from('community_stats')
          .select('*')
          .single();

        if (error) {
          console.error('Error fetching community stats:', error);
          return;
        }

        if (data) {
          setStats(data);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Active Members",
      value: stats.total_members,
      icon: Users,
      description: "Creative minds in our community",
      color: "text-blue-600"
    },
    {
      title: "Palettes Shared",
      value: stats.total_palettes,
      icon: Palette,
      description: "Beautiful color combinations created",
      color: "text-green-600"
    },
    {
      title: "Total Likes",
      value: stats.total_likes,
      icon: Heart,
      description: "Appreciations from the community",
      color: "text-red-600"
    },
    {
      title: "Featured Palettes",
      value: stats.featured_palettes,
      icon: Star,
      description: "Curated highlights from our collection",
      color: "text-yellow-600"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 font-mono">
            ColorVerse Community
          </h1>
          <p className="text-xl text-gray-600 font-mono max-w-3xl mx-auto">
            Join thousands of designers, developers, and creatives who are exploring the infinite possibilities of color. 
            Share your palettes, discover new combinations, and connect with fellow color enthusiasts.
          </p>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {statCards.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="text-center">
                <CardHeader className="pb-2">
                  <div className={`mx-auto w-12 h-12 ${stat.color} flex items-center justify-center rounded-lg bg-gray-50`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-2xl font-mono">
                    {loading ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-16 mx-auto rounded"></div>
                    ) : (
                      stat.value.toLocaleString()
                    )}
                  </CardTitle>
                  <CardDescription className="font-mono font-semibold">
                    {stat.title}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 font-mono">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Most Popular Palettes */}
        <MostClickedPalettes />

        {/* Community Features */}
        <div className="grid md:grid-cols-2 gap-8 mt-16">
          <Card>
            <CardHeader>
              <CardTitle className="font-mono">Share Your Creations</CardTitle>
              <CardDescription className="font-mono">
                Upload and showcase your unique color palettes to inspire others in the community.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 font-mono text-sm">
                Every palette you create contributes to our growing library of beautiful color combinations. 
                Get feedback, earn likes, and see your work featured in our curated collections.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-mono">Discover & Explore</CardTitle>
              <CardDescription className="font-mono">
                Browse thousands of AI-generated and human-curated palettes for endless inspiration.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 font-mono text-sm">
                Filter by mood, theme, or color to find exactly what you need for your next project. 
                Save your favorites and build your personal palette collection.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Community;
