
interface Palette {
  id: string;
  name: string;
  colors: string[];
}

interface HexagonVisualProps {
  palette: Palette;
}

export const HexagonVisual = ({ palette }: HexagonVisualProps) => {
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
        {/* Hexagon pattern */}
        <polygon 
          points="50,15 65,25 65,45 50,55 35,45 35,25" 
          fill={getColor(0)} 
          opacity="0.8"
        />
        <polygon 
          points="85,25 100,35 100,55 85,65 70,55 70,35" 
          fill={getColor(1)} 
          opacity="0.9"
        />
        <polygon 
          points="120,15 135,25 135,45 120,55 105,45 105,25" 
          fill={getColor(2)} 
          opacity="0.7"
        />
        <polygon 
          points="155,25 170,35 170,55 155,65 140,55 140,35" 
          fill={getColor(3) || getColor(0)} 
          opacity="0.8"
        />
        
        {/* Small hexagons */}
        <polygon 
          points="25,40 32,45 32,55 25,60 18,55 18,45" 
          fill={getColor(4) || getColor(1)} 
          opacity="0.6"
        />
        <polygon 
          points="175,10 182,15 182,25 175,30 168,25 168,15" 
          fill={getColor(0)} 
          opacity="0.7"
        />
        <polygon 
          points="190,45 197,50 197,60 190,65 183,60 183,50" 
          fill={getColor(2)} 
          opacity="0.6"
        />
      </svg>
    </div>
  );
};
