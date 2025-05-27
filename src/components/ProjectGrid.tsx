
import { Card, CardContent } from "@/components/ui/card";

interface Project {
  id: string;
  name: string;
  type: string;
  image: string;
  palette: string[];
}

const featuredProjects: Project[] = [
  {
    id: "pixel-flow",
    name: "Pixel Flow",
    type: "Web Design",
    image: "photo-1488590528505-98d2b5aba04b",
    palette: ["#2c3e50", "#3498db", "#e74c3c", "#f39c12", "#27ae60"]
  },
  {
    id: "vesper-ux", 
    name: "Vesper UX",
    type: "Mobile App",
    image: "photo-1486312338219-ce68d2c6f44d",
    palette: ["#8e44ad", "#3498db", "#e67e22", "#f1c40f", "#2ecc71"]
  },
  {
    id: "canvas-shift",
    name: "Canvas Shift",
    type: "Branding",
    image: "photo-1531297484001-80022131f5a1",
    palette: ["#34495e", "#e74c3c", "#f39c12", "#2ecc71", "#9b59b6"]
  },
  {
    id: "neon-pulse",
    name: "Neon Pulse", 
    type: "Social Media",
    image: "photo-1483058712412-4245e9b90334",
    palette: ["#ff006e", "#8338ec", "#3a86ff", "#06ffa5", "#ffbe0b"]
  },
  {
    id: "minimal-essence",
    name: "Minimal Essence",
    type: "Web Design", 
    image: "photo-1439337153520-7082a56a81f4",
    palette: ["#000000", "#333333", "#666666", "#999999", "#ffffff"]
  },
  {
    id: "urban-rhythms",
    name: "Urban Rhythms",
    type: "Branding",
    image: "photo-1493397212122-2b85dda8106b",
    palette: ["#ff4757", "#2ed573", "#1e90ff", "#ffa502", "#747d8c"]
  }
];

export const ProjectGrid = () => {
  return (
    <div className="mb-16">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 font-mono">
          Featured Projects
        </h2>
        <p className="text-gray-600 font-mono">
          See how great color palettes transform design across different mediums
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {featuredProjects.map((project) => (
          <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="aspect-video bg-gray-100 relative overflow-hidden">
              <img
                src={`https://images.unsplash.com/${project.image}?auto=format&fit=crop&w=800&q=80`}
                alt={project.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 font-mono">
                    {project.name}
                  </h3>
                  <p className="text-sm text-gray-500 font-mono uppercase tracking-wide">
                    {project.type}
                  </p>
                </div>
                
                <div className="flex gap-1">
                  {project.palette.map((color, index) => (
                    <div
                      key={index}
                      className="flex-1 h-8 rounded-sm border border-gray-200"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
