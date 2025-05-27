
interface Palette {
  id: string;
  name: string;
  colors: string[];
}

interface AbstractVisualProps {
  palette: Palette;
}

export const AbstractVisual = ({ palette }: AbstractVisualProps) => {
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
        {/* Abstract flowing shapes */}
        <path
          d="M0,40 Q50,10 100,40 T200,40"
          stroke={getColor(0)}
          strokeWidth="3"
          fill="none"
          opacity="0.8"
        />
        <path
          d="M0,20 Q40,60 80,20 T160,20"
          stroke={getColor(1)}
          strokeWidth="2"
          fill="none"
          opacity="0.7"
        />
        <circle cx="30" cy="25" r="8" fill={getColor(2)} opacity="0.6" />
        <circle cx="170" cy="55" r="12" fill={getColor(0)} opacity="0.5" />
        <polygon 
          points="120,15 135,35 105,35" 
          fill={getColor(3) || getColor(1)} 
          opacity="0.7"
        />
        <rect x="60" y="50" width="15" height="20" fill={getColor(4) || getColor(2)} opacity="0.6" />
      </svg>
    </div>
  );
};
