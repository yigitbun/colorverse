
interface Palette {
  id: string;
  name: string;
  colors: string[];
}

interface DiamondVisualProps {
  palette: Palette;
}

export const DiamondVisual = ({ palette }: DiamondVisualProps) => {
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
        {/* Main diamond */}
        <polygon 
          points="100,15 120,40 100,65 80,40" 
          fill={getColor(0)} 
          opacity="0.9"
        />
        <polygon 
          points="100,15 110,27 100,40 90,27" 
          fill={getColor(1)} 
          opacity="0.8"
        />
        <polygon 
          points="100,40 110,53 100,65 90,53" 
          fill={getColor(2)} 
          opacity="0.7"
        />
        
        {/* Diamond facets */}
        <polygon 
          points="80,40 90,27 100,40 90,53" 
          fill={getColor(3) || getColor(0)} 
          opacity="0.6"
        />
        <polygon 
          points="120,40 110,27 100,40 110,53" 
          fill={getColor(4) || getColor(1)} 
          opacity="0.6"
        />
        
        {/* Smaller diamonds */}
        <polygon 
          points="50,30 60,40 50,50 40,40" 
          fill={getColor(1)} 
          opacity="0.7"
        />
        <polygon 
          points="150,25 160,35 150,45 140,35" 
          fill={getColor(2)} 
          opacity="0.8"
        />
        <polygon 
          points="170,50 180,60 170,70 160,60" 
          fill={getColor(0)} 
          opacity="0.6"
        />
        
        {/* Sparkles */}
        <g stroke={getColor(0)} strokeWidth="1" opacity="0.7">
          <line x1="25" y1="20" x2="35" y2="20" />
          <line x1="30" y1="15" x2="30" y2="25" />
          <line x1="180" y1="30" x2="190" y2="30" />
          <line x1="185" y1="25" x2="185" y2="35" />
        </g>
        
        <g stroke={getColor(1)} strokeWidth="0.8" opacity="0.6">
          <line x1="65" y1="65" x2="72" y2="65" />
          <line x1="68.5" y1="61.5" x2="68.5" y2="68.5" />
          <line x1="125" y1="15" x2="132" y2="15" />
          <line x1="128.5" y1="11.5" x2="128.5" y2="18.5" />
        </g>
        
        {/* Light reflections */}
        <line x1="95" y1="20" x2="105" y2="35" stroke={getColor(palette.colors.length - 1)} strokeWidth="2" opacity="0.4" />
        <line x1="85" y1="45" x2="95" y2="60" stroke={getColor(palette.colors.length - 1)} strokeWidth="1.5" opacity="0.3" />
      </svg>
    </div>
  );
};
