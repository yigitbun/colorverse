
interface Palette {
  id: string;
  name: string;
  colors: string[];
}

interface FeatherVisualProps {
  palette: Palette;
}

export const FeatherVisual = ({ palette }: FeatherVisualProps) => {
  const getColor = (index: number) => palette.colors[index] || palette.colors[index % palette.colors.length];

  return (
    <div className="w-full h-20 overflow-hidden rounded-lg">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 200 80"
        preserveAspectRatio="xMidYMid slice"
        style={{ backgroundColor: getColor(palette.colors.length - 1) }}
      >
        {/* Feather spine */}
        <line x1="100" y1="10" x2="100" y2="70" stroke={getColor(0)} strokeWidth="2" opacity="0.8" />
        
        {/* Feather barbs - left side */}
        <path d="M100,15 Q80,20 85,25 Q95,20 100,25" fill={getColor(1)} opacity="0.7" />
        <path d="M100,25 Q75,30 80,35 Q95,30 100,35" fill={getColor(2)} opacity="0.8" />
        <path d="M100,35 Q70,40 75,45 Q95,40 100,45" fill={getColor(3) || getColor(0)} opacity="0.6" />
        <path d="M100,45 Q75,50 80,55 Q95,50 100,55" fill={getColor(4) || getColor(1)} opacity="0.7" />
        <path d="M100,55 Q80,60 85,65 Q95,60 100,65" fill={getColor(0)} opacity="0.8" />
        
        {/* Feather barbs - right side */}
        <path d="M100,15 Q120,20 115,25 Q105,20 100,25" fill={getColor(1)} opacity="0.7" />
        <path d="M100,25 Q125,30 120,35 Q105,30 100,35" fill={getColor(2)} opacity="0.8" />
        <path d="M100,35 Q130,40 125,45 Q105,40 100,45" fill={getColor(3) || getColor(0)} opacity="0.6" />
        <path d="M100,45 Q125,50 120,55 Q105,50 100,55" fill={getColor(4) || getColor(1)} opacity="0.7" />
        <path d="M100,55 Q120,60 115,65 Q105,60 100,65" fill={getColor(0)} opacity="0.8" />
        
        {/* Additional feathers */}
        <line x1="150" y1="20" x2="150" y2="60" stroke={getColor(2)} strokeWidth="1.5" opacity="0.6" />
        <path d="M150,25 Q135,28 140,32 Q148,28 150,32" fill={getColor(1)} opacity="0.5" />
        <path d="M150,35 Q165,38 160,42 Q152,38 150,42" fill={getColor(0)} opacity="0.6" />
        
        <line x1="50" y1="30" x2="50" y2="70" stroke={getColor(1)} strokeWidth="1.5" opacity="0.6" />
        <path d="M50,35 Q35,38 40,42 Q48,38 50,42" fill={getColor(3) || getColor(2)} opacity="0.5" />
        <path d="M50,45 Q65,48 60,52 Q52,48 50,52" fill={getColor(4) || getColor(0)} opacity="0.6" />
      </svg>
    </div>
  );
};
