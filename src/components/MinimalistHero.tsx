
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const MinimalistHero = () => {
  return (
    <section className="container mx-auto px-4 py-12 lg:py-16 max-w-4xl text-center">
      <div className="space-y-6">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 font-mono leading-tight">
            The Universe of Colors
          </h1>
          <p className="text-lg md:text-xl text-gray-600 font-mono max-w-2xl mx-auto">
            Discover perfect color palettes and see them in action. 
            Create, explore, and apply colors that tell your story.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to="/explore">
            <Button size="lg" className="font-mono px-8 py-3 text-lg">
              Discover Palettes
            </Button>
          </Link>
          <Button variant="outline" size="lg" className="font-mono px-8 py-3 text-lg">
            Generate Palette
          </Button>
        </div>
      </div>
    </section>
  );
};
