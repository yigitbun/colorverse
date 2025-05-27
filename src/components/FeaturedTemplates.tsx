
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface Template {
  id: string;
  name: string;
  category: string;
  image: string;
  colors: string[];
}

const featuredTemplates: Template[] = [
  {
    id: "modern-brand",
    name: "Modern Brand Identity",
    category: "Branding",
    image: "photo-1493397212122-2b85dda8106b",
    colors: ["#2C3E50", "#3498DB", "#E74C3C", "#F39C12", "#FFFFFF"]
  },
  {
    id: "web-portfolio", 
    name: "Web Portfolio",
    category: "Web Design",
    image: "photo-1488590528505-98d2b5aba04b",
    colors: ["#1A1A2E", "#16213E", "#0F3460", "#533483", "#7209B7"]
  },
  {
    id: "mobile-app",
    name: "Mobile App UI",
    category: "Mobile",
    image: "photo-1486312338219-ce68d2c6f44d",
    colors: ["#667EEA", "#764BA2", "#F093FB", "#F5576C", "#4FACFE"]
  },
  {
    id: "print-design",
    name: "Print Design",
    category: "Print",
    image: "photo-1531297484001-80022131f5a1",
    colors: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"]
  },
  {
    id: "social-media",
    name: "Social Media",
    category: "Social",
    image: "photo-1483058712412-4245e9b90334",
    colors: ["#FF9A8B", "#A8E6CF", "#FFD93D", "#6BCF7F", "#4D96FF"]
  },
  {
    id: "presentation",
    name: "Presentation",
    category: "Business",
    image: "photo-1439337153520-7082a56a81f4",
    colors: ["#2E3440", "#3B4252", "#434C5E", "#4C566A", "#5E81AC"]
  }
];

export const FeaturedTemplates = () => {
  return (
    <section className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 font-mono">
          Apply Colors to Design Templates
        </h2>
        <p className="text-gray-600 font-mono max-w-2xl mx-auto">
          See how your color palettes work across different design projects and mediums
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {featuredTemplates.map((template) => (
          <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
            <div className="aspect-video bg-gray-100 relative overflow-hidden">
              <img
                src={`https://images.unsplash.com/${template.image}?auto=format&fit=crop&w=800&q=80`}
                alt={template.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-1 rounded font-mono mb-2">
                  {template.category}
                </span>
                <h3 className="text-white font-semibold font-mono">
                  {template.name}
                </h3>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex gap-1 mb-3">
                {template.colors.map((color, index) => (
                  <div
                    key={index}
                    className="flex-1 h-6 rounded-sm"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <Button variant="outline" size="sm" className="w-full font-mono">
                Try This Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Link to="/explore">
          <Button size="lg" variant="outline" className="font-mono">
            View All Templates
          </Button>
        </Link>
      </div>
    </section>
  );
};
