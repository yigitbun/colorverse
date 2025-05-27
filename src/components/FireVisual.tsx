
interface Palette {
  id: string;
  name: string;
  colors: string[];
}

interface FireVisualProps {
  palette: Palette;
}

export const FireVisual = ({ palette }: FireVisualProps) => {
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
        {/* Main flames */}
        <path 
          d="M100,70 Q90,50 95,30 Q105,20 100,10 Q110,25 115,45 Q105,60 100,70" 
          fill={getColor(0)} 
          opacity="0.9"
        />
        <path 
          d="M95,65 Q85,45 90,25 Q100,15 95,5 Q105,20 110,40 Q100,55 95,65" 
          fill={getColor(1)} 
          opacity="0.8"
        />
        <path 
          d="M105,65 Q115,45 110,25 Q100,15 105,5 Q95,20 90,40 Q100,55 105,65" 
          fill={getColor(2)} 
          opacity="0.7"
        />
        
        {/* Side flames */}
        <path 
          d="M70,75 Q65,55 70,35 Q75,25 70,15 Q80,30 85,50 Q75,65 70,75" 
          fill={getColor(1)} 
          opacity="0.6"
        />
        <path 
          d="M130,75 Q135,55 130,35 Q125,25 130,15 Q120,30 115,50 Q125,65 130,75" 
          fill={getColor(3) || getColor(0)} 
          opacity="0.6"
        />
        
        {/* Small flames */}
        <path 
          d="M50,80 Q45,65 50,50 Q55,45 50,35 Q60,50 65,65 Q55,75 50,80" 
          fill={getColor(4) || getColor(2)} 
          opacity="0.5"
        />
        <path 
          d="M150,80 Q155,65 150,50 Q145,45 150,35 Q140,50 135,65 Q145,75 150,80" 
          fill={getColor(0)} 
          opacity="0.5"
        />
        
        {/* Sparks */}
        <circle cx="80" cy="25" r="1.5" fill={getColor(1)} opacity="0.8" />
        <circle cx="120" cy="30" r="1" fill={getColor(2)} opacity="0.9" />
        <circle cx="110" cy="15" r="1.2" fill={getColor(0)} opacity="0.7" />
        <circle cx="90" cy="10" r="0.8" fill={getColor(3) || getColor(1)} opacity="0.6" />
      </svg>
    </div>
  );
};
