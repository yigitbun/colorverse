
interface Palette {
  id: string;
  name: string;
  colors: string[];
}

interface MosaicVisualProps {
  palette: Palette;
}

export const MosaicVisual = ({ palette }: MosaicVisualProps) => {
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
        {/* Mosaic tiles */}
        <polygon points="20,10 40,10 35,25 15,25" fill={getColor(0)} opacity="0.8" />
        <polygon points="40,10 65,15 60,30 35,25" fill={getColor(1)} opacity="0.9" />
        <polygon points="65,15 85,20 75,35 60,30" fill={getColor(2)} opacity="0.7" />
        <polygon points="85,20 110,25 100,40 75,35" fill={getColor(3) || getColor(0)} opacity="0.8" />
        <polygon points="110,25 135,30 125,45 100,40" fill={getColor(4) || getColor(1)} opacity="0.6" />
        
        <polygon points="15,25 35,25 30,40 10,40" fill={getColor(1)} opacity="0.7" />
        <polygon points="35,25 60,30 55,45 30,40" fill={getColor(2)} opacity="0.8" />
        <polygon points="60,30 75,35 70,50 55,45" fill={getColor(0)} opacity="0.9" />
        <polygon points="75,35 100,40 95,55 70,50" fill={getColor(3) || getColor(2)} opacity="0.7" />
        
        <polygon points="10,40 30,40 25,55 5,55" fill={getColor(4) || getColor(0)} opacity="0.6" />
        <polygon points="30,40 55,45 50,60 25,55" fill={getColor(0)} opacity="0.8" />
        <polygon points="55,45 70,50 65,65 50,60" fill={getColor(1)} opacity="0.9" />
        
        {/* Additional tiles */}
        <polygon points="140,15 165,20 160,35 135,30" fill={getColor(2)} opacity="0.8" />
        <polygon points="165,20 185,25 180,40 160,35" fill={getColor(3) || getColor(0)} opacity="0.7" />
        <polygon points="135,30 160,35 155,50 130,45" fill={getColor(4) || getColor(1)} opacity="0.6" />
        <polygon points="160,35 180,40 175,55 155,50" fill={getColor(0)} opacity="0.8" />
      </svg>
    </div>
  );
};
