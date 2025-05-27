
interface Palette {
  id: string;
  name: string;
  colors: string[];
}

interface ConstellationVisualProps {
  palette: Palette;
}

export const ConstellationVisual = ({ palette }: ConstellationVisualProps) => {
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
        {/* Stars */}
        <circle cx="30" cy="20" r="2" fill={getColor(0)} opacity="0.9" />
        <circle cx="70" cy="15" r="1.5" fill={getColor(1)} opacity="0.8" />
        <circle cx="120" cy="25" r="2.5" fill={getColor(2)} opacity="0.9" />
        <circle cx="160" cy="18" r="1.8" fill={getColor(3) || getColor(0)} opacity="0.8" />
        <circle cx="180" cy="35" r="1.2" fill={getColor(4) || getColor(1)} opacity="0.7" />
        
        <circle cx="50" cy="45" r="1.8" fill={getColor(1)} opacity="0.8" />
        <circle cx="90" cy="55" r="2.2" fill={getColor(2)} opacity="0.9" />
        <circle cx="140" cy="50" r="1.5" fill={getColor(0)} opacity="0.8" />
        <circle cx="170" cy="60" r="2" fill={getColor(3) || getColor(2)} opacity="0.7" />
        
        {/* Constellation lines */}
        <g stroke={getColor(0)} strokeWidth="0.8" opacity="0.5">
          <line x1="30" y1="20" x2="70" y2="15" />
          <line x1="70" y1="15" x2="120" y2="25" />
          <line x1="120" y1="25" x2="160" y2="18" />
          <line x1="160" y1="18" x2="180" y2="35" />
        </g>
        
        <g stroke={getColor(1)} strokeWidth="0.8" opacity="0.4">
          <line x1="50" y1="45" x2="90" y2="55" />
          <line x1="90" y1="55" x2="140" y2="50" />
          <line x1="140" y1="50" x2="170" y2="60" />
        </g>
        
        <g stroke={getColor(2)} strokeWidth="0.8" opacity="0.3">
          <line x1="30" y1="20" x2="50" y2="45" />
          <line x1="120" y1="25" x2="140" y2="50" />
        </g>
      </svg>
    </div>
  );
};
