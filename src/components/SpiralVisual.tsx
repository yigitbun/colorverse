
interface Palette {
  id: string;
  name: string;
  colors: string[];
}

interface SpiralVisualProps {
  palette: Palette;
}

export const SpiralVisual = ({ palette }: SpiralVisualProps) => {
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
        {/* Spiral patterns */}
        <path
          d="M100,40 A5,5 0 0,1 110,40 A10,10 0 0,1 90,40 A15,15 0 0,1 115,40 A20,20 0 0,1 85,40"
          stroke={getColor(0)}
          strokeWidth="3"
          fill="none"
          opacity="0.8"
        />
        <path
          d="M40,20 A3,3 0 0,1 46,20 A6,6 0 0,1 34,20 A9,9 0 0,1 49,20"
          stroke={getColor(1)}
          strokeWidth="2"
          fill="none"
          opacity="0.7"
        />
        <path
          d="M160,60 A4,4 0 0,1 168,60 A8,8 0 0,1 152,60 A12,12 0 0,1 172,60"
          stroke={getColor(2)}
          strokeWidth="2"
          fill="none"
          opacity="0.6"
        />
        <circle cx="100" cy="40" r="2" fill={getColor(3) || getColor(0)} opacity="0.9" />
        <circle cx="40" cy="20" r="1.5" fill={getColor(4) || getColor(1)} opacity="0.8" />
        <circle cx="160" cy="60" r="1.5" fill={getColor(0)} opacity="0.7" />
      </svg>
    </div>
  );
};
