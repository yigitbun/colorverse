
interface Palette {
  id: string;
  name: string;
  colors: string[];
}

interface NetworkVisualProps {
  palette: Palette;
}

export const NetworkVisual = ({ palette }: NetworkVisualProps) => {
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
        {/* Network nodes */}
        <circle cx="40" cy="30" r="4" fill={getColor(0)} opacity="0.9" />
        <circle cx="80" cy="20" r="3" fill={getColor(1)} opacity="0.8" />
        <circle cx="120" cy="35" r="5" fill={getColor(2)} opacity="0.9" />
        <circle cx="160" cy="25" r="3.5" fill={getColor(3) || getColor(0)} opacity="0.8" />
        <circle cx="60" cy="55" r="4" fill={getColor(4) || getColor(1)} opacity="0.7" />
        <circle cx="140" cy="60" r="3" fill={getColor(0)} opacity="0.8" />
        <circle cx="180" cy="50" r="4" fill={getColor(2)} opacity="0.9" />
        <circle cx="20" cy="60" r="2.5" fill={getColor(1)} opacity="0.7" />
        
        {/* Network connections */}
        <g stroke={getColor(0)} strokeWidth="1.5" opacity="0.5">
          <line x1="40" y1="30" x2="80" y2="20" />
          <line x1="80" y1="20" x2="120" y2="35" />
          <line x1="120" y1="35" x2="160" y2="25" />
          <line x1="40" y1="30" x2="60" y2="55" />
          <line x1="120" y1="35" x2="140" y2="60" />
          <line x1="160" y1="25" x2="180" y2="50" />
        </g>
        
        <g stroke={getColor(1)} strokeWidth="1" opacity="0.4">
          <line x1="60" y1="55" x2="140" y2="60" />
          <line x1="80" y1="20" x2="160" y2="25" />
          <line x1="20" y1="60" x2="60" y2="55" />
          <line x1="140" y1="60" x2="180" y2="50" />
        </g>
        
        <g stroke={getColor(2)} strokeWidth="0.8" opacity="0.3">
          <line x1="40" y1="30" x2="120" y2="35" />
          <line x1="80" y1="20" x2="140" y2="60" />
          <line x1="20" y1="60" x2="180" y2="50" />
        </g>
      </svg>
    </div>
  );
};
