
interface Palette {
  id: string;
  name: string;
  colors: string[];
}

interface LeafVisualProps {
  palette: Palette;
}

export const LeafVisual = ({ palette }: LeafVisualProps) => {
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
        {/* Main leaf */}
        <ellipse cx="100" cy="40" rx="35" ry="20" fill={getColor(0)} opacity="0.8" transform="rotate(15 100 40)" />
        <line x1="70" y1="35" x2="130" y2="45" stroke={getColor(1)} strokeWidth="2" opacity="0.9" />
        
        {/* Leaf veins */}
        <g stroke={getColor(1)} strokeWidth="1" opacity="0.6">
          <line x1="100" y1="25" x2="85" y2="35" />
          <line x1="100" y1="30" x2="90" y2="40" />
          <line x1="100" y1="35" x2="95" y2="45" />
          <line x1="100" y1="40" x2="115" y2="45" />
          <line x1="100" y1="45" x2="110" y2="50" />
          <line x1="100" y1="50" x2="115" y2="55" />
        </g>
        
        {/* Additional leaves */}
        <ellipse cx="50" cy="25" rx="20" ry="12" fill={getColor(2)} opacity="0.7" transform="rotate(-30 50 25)" />
        <line x1="35" y1="22" x2="65" y2="28" stroke={getColor(3) || getColor(0)} strokeWidth="1.5" opacity="0.8" />
        
        <ellipse cx="150" cy="55" rx="25" ry="15" fill={getColor(3) || getColor(1)} opacity="0.6" transform="rotate(45 150 55)" />
        <line x1="130" y1="48" x2="170" y2="62" stroke={getColor(4) || getColor(2)} strokeWidth="1.5" opacity="0.7" />
        
        {/* Small decorative leaves */}
        <ellipse cx="30" cy="60" rx="12" ry="8" fill={getColor(4) || getColor(0)} opacity="0.5" />
        <ellipse cx="170" cy="20" rx="10" ry="6" fill={getColor(0)} opacity="0.6" />
        <ellipse cx="180" cy="70" rx="8" ry="5" fill={getColor(2)} opacity="0.5" />
      </svg>
    </div>
  );
};
