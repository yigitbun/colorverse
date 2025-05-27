
interface Palette {
  id: string;
  name: string;
  colors: string[];
}

interface TriangleVisualProps {
  palette: Palette;
}

export const TriangleVisual = ({ palette }: TriangleVisualProps) => {
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
        {/* Triangle patterns */}
        <polygon points="40,10 60,10 50,30" fill={getColor(0)} opacity="0.9" />
        <polygon points="60,10 80,10 70,30" fill={getColor(1)} opacity="0.8" />
        <polygon points="30,30 50,30 40,50" fill={getColor(2)} opacity="0.7" />
        <polygon points="50,30 70,30 60,50" fill={getColor(3) || getColor(0)} opacity="0.8" />
        <polygon points="70,30 90,30 80,50" fill={getColor(4) || getColor(1)} opacity="0.6" />
        
        <polygon points="120,15 140,15 130,35" fill={getColor(1)} opacity="0.9" />
        <polygon points="140,15 160,15 150,35" fill={getColor(2)} opacity="0.8" />
        <polygon points="110,35 130,35 120,55" fill={getColor(0)} opacity="0.7" />
        <polygon points="130,35 150,35 140,55" fill={getColor(3) || getColor(2)} opacity="0.8" />
        <polygon points="150,35 170,35 160,55" fill={getColor(4) || getColor(0)} opacity="0.6" />
        
        {/* Inverted triangles */}
        <polygon points="20,50 40,50 30,70" fill={getColor(2)} opacity="0.8" />
        <polygon points="60,50 80,50 70,70" fill={getColor(0)} opacity="0.7" />
        <polygon points="180,20 200,20 190,40" fill={getColor(1)} opacity="0.8" />
        <polygon points="170,40 190,40 180,60" fill={getColor(3) || getColor(2)} opacity="0.7" />
      </svg>
    </div>
  );
};
