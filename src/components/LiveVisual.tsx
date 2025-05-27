
interface Palette {
  id: string;
  name: string;
  colors: string[];
}

interface LiveVisualProps {
  palette: Palette;
}

// Function to calculate luminance and determine if text should be light or dark
const getContrastColor = (backgroundColor: string): string => {
  // Remove # if present
  const hex = backgroundColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return dark text for light backgrounds, light text for dark backgrounds
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

export const LiveVisual = ({ palette }: LiveVisualProps) => {
  const getColor = (index: number) => palette.colors[index] || palette.colors[index % palette.colors.length];
  const background = getColor(palette.colors.length - 1);
  const primary = getColor(0);
  const secondary = getColor(1);
  const accent = getColor(Math.min(2, palette.colors.length - 1));
  
  // Get contrasting text color based on background
  const textColor = getContrastColor(background);
  const buttonTextColor = getContrastColor(accent);

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <div 
        className="relative overflow-hidden rounded-lg shadow-lg transition-all duration-500"
        style={{ backgroundColor: background }}
      >
        {/* Website Mockup */}
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div 
              className="text-2xl font-bold font-mono"
              style={{ color: textColor }}
            >
              Brand
            </div>
            <div className="flex gap-4">
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: accent }}
              />
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: secondary }}
              />
            </div>
          </div>

          {/* Hero Content */}
          <div className="space-y-6">
            <h1 
              className="text-4xl font-bold font-mono leading-tight"
              style={{ color: textColor }}
            >
              Design with Purpose
            </h1>
            <p 
              className="text-lg font-mono opacity-80"
              style={{ color: textColor }}
            >
              Create beautiful experiences that inspire and engage your audience through thoughtful color choices.
            </p>
            <button
              className="px-6 py-3 rounded-lg font-semibold font-mono transition-all hover:scale-105"
              style={{ 
                backgroundColor: accent, 
                color: buttonTextColor
              }}
            >
              Get Started
            </button>
          </div>

          {/* Visual Elements */}
          <div className="mt-12 grid grid-cols-3 gap-4">
            <div 
              className="h-20 rounded-lg"
              style={{ backgroundColor: primary }}
            />
            <div 
              className="h-20 rounded-lg"
              style={{ backgroundColor: secondary }}
            />
            <div 
              className="h-20 rounded-lg"
              style={{ backgroundColor: accent }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
