
interface Palette {
  id: string;
  name: string;
  colors: string[];
}

interface CloudVisualProps {
  palette: Palette;
}

export const CloudVisual = ({ palette }: CloudVisualProps) => {
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
        {/* Main cloud */}
        <g opacity="0.8">
          <ellipse cx="80" cy="35" rx="25" ry="15" fill={getColor(0)} />
          <ellipse cx="100" cy="30" rx="30" ry="18" fill={getColor(0)} />
          <ellipse cx="120" cy="35" rx="20" ry="12" fill={getColor(0)} />
          <ellipse cx="90" cy="45" rx="35" ry="12" fill={getColor(0)} />
        </g>
        
        {/* Secondary cloud */}
        <g opacity="0.6">
          <ellipse cx="150" cy="20" rx="18" ry="10" fill={getColor(1)} />
          <ellipse cx="165" cy="18" rx="22" ry="12" fill={getColor(1)} />
          <ellipse cx="175" cy="22" rx="15" ry="8" fill={getColor(1)} />
          <ellipse cx="160" cy="28" rx="25" ry="8" fill={getColor(1)} />
        </g>
        
        {/* Small clouds */}
        <g opacity="0.7">
          <ellipse cx="30" cy="25" rx="12" ry="7" fill={getColor(2)} />
          <ellipse cx="40" cy="23" rx="15" ry="9" fill={getColor(2)} />
          <ellipse cx="48" cy="27" rx="10" ry="6" fill={getColor(2)} />
        </g>
        
        <g opacity="0.5">
          <ellipse cx="160" cy="55" rx="15" ry="8" fill={getColor(3) || getColor(0)} />
          <ellipse cx="172" cy="53" rx="18" ry="10" fill={getColor(3) || getColor(0)} />
          <ellipse cx="180" cy="57" rx="12" ry="7" fill={getColor(3) || getColor(0)} />
        </g>
        
        {/* Tiny wispy clouds */}
        <ellipse cx="20" cy="50" rx="8" ry="4" fill={getColor(4) || getColor(1)} opacity="0.4" />
        <ellipse cx="190" cy="40" rx="6" ry="3" fill={getColor(0)} opacity="0.5" />
        <ellipse cx="70" cy="65" rx="10" ry="5" fill={getColor(2)} opacity="0.4" />
      </svg>
    </div>
  );
};
