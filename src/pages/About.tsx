
import { Navigation } from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Palette, Sparkles, Users, Zap } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 font-mono">
            About ColorVerse
          </h1>
          <p className="text-xl text-gray-600 font-mono max-w-3xl mx-auto">
            We're on a mission to democratize design through the power of color. ColorVerse is where creativity meets technology, 
            offering designers and creators the tools they need to explore, discover, and apply beautiful color combinations.
          </p>
        </div>

        {/* Mission */}
        <div className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6 font-mono">
                Our Mission
              </h2>
              <p className="text-gray-600 mb-6 font-mono leading-relaxed">
                Color is one of the most powerful tools in design, yet finding the perfect palette can be challenging. 
                We believe that everyone deserves access to beautiful, professional-grade color combinations that inspire and elevate their work.
              </p>
              <p className="text-gray-600 font-mono leading-relaxed">
                Through AI-generated palettes, community contributions, and innovative visualization tools, 
                we're building the most comprehensive color resource on the web.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-lg">
              <div className="grid grid-cols-4 gap-2 h-32">
                {["#3498DB", "#9B59B6", "#1ABC9C", "#F1C40F", "#E74C3C", "#95A5A6", "#34495E", "#2ECC71"].map((color, index) => (
                  <div
                    key={index}
                    className="rounded"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center font-mono">
            What Makes Us Different
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center">
              <CardContent className="p-6">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
                <h3 className="text-lg font-semibold font-mono mb-3">AI-Powered</h3>
                <p className="text-gray-600 font-mono text-sm">
                  Advanced algorithms generate unique palettes that follow color theory principles
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <Palette className="w-12 h-12 mx-auto mb-4 text-purple-500" />
                <h3 className="text-lg font-semibold font-mono mb-3">Live Visualization</h3>
                <p className="text-gray-600 font-mono text-sm">
                  See how palettes look in real designs with our interactive visualizers
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <Users className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                <h3 className="text-lg font-semibold font-mono mb-3">Community Driven</h3>
                <p className="text-gray-600 font-mono text-sm">
                  Discover and share palettes with a vibrant community of creators
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <Zap className="w-12 h-12 mx-auto mb-4 text-green-500" />
                <h3 className="text-lg font-semibold font-mono mb-3">Easy Export</h3>
                <p className="text-gray-600 font-mono text-sm">
                  Export palettes in multiple formats for your favorite design tools
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Team */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 font-mono">
            Built by Creators, for Creators
          </h2>
          <p className="text-gray-600 font-mono max-w-2xl mx-auto">
            Our team combines expertise in design, technology, and color theory to create tools that truly understand your creative needs.
          </p>
        </div>

        {/* Stats */}
        <div className="bg-gray-50 rounded-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 font-mono">1M+</h3>
              <p className="text-gray-600 font-mono">Palettes Generated</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-gray-900 font-mono">50K+</h3>
              <p className="text-gray-600 font-mono">Active Users</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-gray-900 font-mono">100+</h3>
              <p className="text-gray-600 font-mono">Countries</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
