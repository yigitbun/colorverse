
interface Palette {
  id: string;
  name: string;
  colors: string[];
}

interface CrystalVisualProps {
  palette: Palette;
}

export const CrystalVisual = ({ palette }: CrystalVisualProps) => {
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
        {/* Crystal formations */}
        <polygon 
          points="50,10 70,30 50,50 30,30" 
          fill={getColor(0)} 
          opacity="0.8"
        />
        <polygon 
          points="120,5 145,25 120,45 95,25" 
          fill={getColor(1)} 
          opacity="0.9"
        />
        <polygon 
          points="170,20 185,35 170,50 155,35" 
          fill={getColor(2)} 
          opacity="0.7"
        />
        <polygon 
          points="80,40 100,55 80,70 60,55" 
          fill={getColor(3) || getColor(0)} 
          opacity="0.8"
        />
        <polygon 
          points="20,50 35,65 20,80 5,65" 
          fill={getColor(4) || getColor(1)} 
          opacity="0.6"
        />
        
        {/* Crystal reflections */}
        <line x1="50" y1="10" x2="50" y2="50" stroke={getColor(palette.colors.length - 1)} strokeWidth="1" opacity="0.3" />
        <line x1="120" y1="5" x2="120" y2="45" stroke={getColor(palette.colors.length - 1)} strokeWidth="1" opacity="0.3" />
      </svg>
    </div>
  );
};
