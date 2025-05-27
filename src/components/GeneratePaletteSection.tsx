
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Palette } from "lucide-react";

export const GeneratePaletteSection = () => {
  return (
    <section className="bg-gray-50 py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 lg:p-12 text-center">
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="p-4 bg-blue-100 rounded-full">
                  <Palette className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-mono">
                  Create Your Perfect Palette
                </h2>
                <p className="text-lg text-gray-600 font-mono max-w-2xl mx-auto">
                  Generate custom color combinations using AI or explore thousands of curated palettes
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button size="lg" className="font-mono px-8 py-3">
                  Generate AI Palette
                </Button>
                <Button variant="outline" size="lg" className="font-mono px-8 py-3">
                  Browse Community
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
