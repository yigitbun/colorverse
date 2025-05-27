
interface Palette {
  id: string;
  name: string;
  colors: string[];
}

interface LightningVisualProps {
  palette: Palette;
}

export const LightningVisual = ({ palette }: LightningVisualProps) => {
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
        {/* Main lightning bolt */}
        <path 
          d="M100,5 L90,25 L105,25 L95,45 L110,45 L85,75 L105,35 L95,35 L110,15 L100,5" 
          fill={getColor(0)} 
          opacity="0.9"
        />
        
        {/* Secondary lightning */}
        <path 
          d="M60,10 L55,30 L65,30 L50,55 L70,25 L60,25 L70,10 L60,10" 
          fill={getColor(1)} 
          opacity="0.7"
        />
        
        <path 
          d="M150,15 L145,35 L155,35 L140,60 L160,30 L150,30 L160,15 L150,15" 
          fill={getColor(2)} 
          opacity="0.8"
        />
        
        {/* Electric sparks */}
        <g stroke={getColor(0)} strokeWidth="1.5" opacity="0.6">
          <path d="M110,20 L115,18 L113,23 L118,21" />
          <path d="M80,40 L85,38 L83,43 L88,41" />
          <path d="M120,50 L125,48 L123,53 L128,51" />
        </g>
        
        <g stroke={getColor(1)} strokeWidth="1" opacity="0.5">
          <path d="M70,25 L75,23 L73,28 L78,26" />
          <path d="M160,35 L165,33 L163,38 L168,36" />
        </g>
        
        {/* Energy particles */}
        <circle cx="95" cy="15" r="1.5" fill={getColor(3) || getColor(0)} opacity="0.8" />
        <circle cx="105" cy="30" r="1" fill={getColor(4) || getColor(1)} opacity="0.7" />
        <circle cx="85" cy="50" r="1.2" fill={getColor(2)} opacity="0.9" />
        <circle cx="55" cy="20" r="1" fill={getColor(0)} opacity="0.8" />
        <circle cx="155" cy="25" r="1.3" fill={getColor(1)} opacity="0.6" />
        
        {/* Storm clouds */}
        <ellipse cx="30" cy="15" rx="20" ry="8" fill={getColor(3) || getColor(2)} opacity="0.4" />
        <ellipse cx="170" cy="20" rx="25" ry="10" fill={getColor(4) || getColor(0)} opacity="0.3" />
      </svg>
    </div>
  );
};
