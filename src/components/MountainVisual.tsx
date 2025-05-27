
interface Palette {
  id: string;
  name: string;
  colors: string[];
}

interface MountainVisualProps {
  palette: Palette;
}

export const MountainVisual = ({ palette }: MountainVisualProps) => {
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
        {/* Mountain layers */}
        <path 
          d="M0,80 L30,40 L60,20 L90,35 L120,15 L150,30 L180,10 L200,25 L200,80 Z" 
          fill={getColor(0)} 
          opacity="0.9"
        />
        <path 
          d="M0,80 L40,50 L70,35 L100,45 L130,25 L160,40 L190,20 L200,35 L200,80 Z" 
          fill={getColor(1)} 
          opacity="0.8"
        />
        <path 
          d="M0,80 L50,60 L80,50 L110,55 L140,40 L170,50 L200,45 L200,80 Z" 
          fill={getColor(2)} 
          opacity="0.7"
        />
        
        {/* Snow caps */}
        <polygon points="60,20 70,30 50,30" fill={getColor(palette.colors.length - 1)} opacity="0.8" />
        <polygon points="120,15 130,25 110,25" fill={getColor(palette.colors.length - 1)} opacity="0.8" />
        <polygon points="180,10 190,20 170,20" fill={getColor(palette.colors.length - 1)} opacity="0.8" />
        
        {/* Sun */}
        <circle cx="170" cy="25" r="8" fill={getColor(3) || getColor(0)} opacity="0.7" />
        
        {/* Birds */}
        <g stroke={getColor(4) || getColor(1)} strokeWidth="1" fill="none" opacity="0.5">
          <path d="M50,35 Q52,33 54,35" />
          <path d="M52,33 Q54,31 56,33" />
          <path d="M80,30 Q82,28 84,30" />
          <path d="M82,28 Q84,26 86,28" />
        </g>
        
        {/* Clouds */}
        <ellipse cx="40" cy="30" rx="12" ry="6" fill={getColor(palette.colors.length - 1)} opacity="0.4" />
        <ellipse cx="130" cy="35" rx="15" ry="8" fill={getColor(palette.colors.length - 1)} opacity="0.3" />
      </svg>
    </div>
  );
};
