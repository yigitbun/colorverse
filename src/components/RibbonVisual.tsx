
interface Palette {
  id: string;
  name: string;
  colors: string[];
}

interface RibbonVisualProps {
  palette: Palette;
}

export const RibbonVisual = ({ palette }: RibbonVisualProps) => {
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
        {/* Flowing ribbons */}
        <path
          d="M0,30 Q50,10 100,30 Q150,50 200,30 L200,40 Q150,60 100,40 Q50,20 0,40 Z"
          fill={getColor(0)}
          opacity="0.8"
        />
        <path
          d="M0,45 Q40,25 80,45 Q120,65 160,45 Q180,35 200,45 L200,55 Q180,45 160,55 Q120,75 80,55 Q40,35 0,55 Z"
          fill={getColor(1)}
          opacity="0.7"
        />
        <path
          d="M0,60 Q30,40 60,60 Q90,80 120,60 Q150,40 180,60 L200,60 L200,80 L0,80 Z"
          fill={getColor(2)}
          opacity="0.6"
        />
        
        {/* Accent dots */}
        <circle cx="50" cy="25" r="2" fill={getColor(3) || getColor(0)} opacity="0.9" />
        <circle cx="100" cy="35" r="1.5" fill={getColor(4) || getColor(1)} opacity="0.8" />
        <circle cx="150" cy="45" r="2" fill={getColor(0)} opacity="0.7" />
      </svg>
    </div>
  );
};
