
interface Palette {
  id: string;
  name: string;
  colors: string[];
}

interface CircuitVisualProps {
  palette: Palette;
}

export const CircuitVisual = ({ palette }: CircuitVisualProps) => {
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
        {/* Circuit paths */}
        <g stroke={getColor(0)} strokeWidth="2" fill="none" opacity="0.8">
          <path d="M20,40 L50,40 L50,20 L80,20" />
          <path d="M80,20 L110,20 L110,60 L140,60" />
          <path d="M140,60 L170,60 L170,30 L200,30" />
        </g>
        
        <g stroke={getColor(1)} strokeWidth="1.5" fill="none" opacity="0.7">
          <path d="M10,60 L40,60 L40,10 L70,10" />
          <path d="M130,10 L160,10 L160,50 L190,50" />
        </g>
        
        {/* Circuit nodes */}
        <circle cx="50" cy="40" r="3" fill={getColor(2)} opacity="0.9" />
        <circle cx="110" cy="20" r="2.5" fill={getColor(3) || getColor(0)} opacity="0.8" />
        <circle cx="140" cy="60" r="3" fill={getColor(4) || getColor(1)} opacity="0.7" />
        <circle cx="40" cy="60" r="2" fill={getColor(0)} opacity="0.8" />
        <circle cx="160" cy="10" r="2.5" fill={getColor(2)} opacity="0.9" />
        
        {/* Component rectangles */}
        <rect x="75" y="17" width="10" height="6" fill={getColor(1)} opacity="0.8" />
        <rect x="135" y="57" width="10" height="6" fill={getColor(3) || getColor(2)} opacity="0.7" />
        <rect x="35" y="57" width="8" height="6" fill={getColor(4) || getColor(0)} opacity="0.6" />
      </svg>
    </div>
  );
};
