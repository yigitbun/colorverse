
interface Palette {
  id: string;
  name: string;
  colors: string[];
}

interface BookVisualProps {
  palette: Palette;
}

export const BookVisual = ({ palette }: BookVisualProps) => {
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
        {/* Stack of books */}
        <rect x="60" y="45" width="35" height="25" fill={getColor(0)} opacity="0.9" />
        <rect x="60" y="47" width="35" height="2" fill={getColor(palette.colors.length - 1)} opacity="0.3" />
        
        <rect x="65" y="25" width="30" height="20" fill={getColor(1)} opacity="0.8" />
        <rect x="65" y="27" width="30" height="2" fill={getColor(palette.colors.length - 1)} opacity="0.3" />
        
        <rect x="70" y="10" width="25" height="15" fill={getColor(2)} opacity="0.9" />
        <rect x="70" y="12" width="25" height="2" fill={getColor(palette.colors.length - 1)} opacity="0.3" />
        
        {/* Open book */}
        <path 
          d="M120,50 L140,45 L160,50 L160,70 L140,65 L120,70 Z" 
          fill={getColor(3) || getColor(0)} 
          opacity="0.8"
        />
        <line x1="140" y1="45" x2="140" y2="65" stroke={getColor(palette.colors.length - 1)} strokeWidth="1" opacity="0.4" />
        
        {/* Book pages */}
        <g stroke={getColor(4) || getColor(1)} strokeWidth="0.5" opacity="0.5">
          <line x1="125" y1="52" x2="135" y2="50" />
          <line x1="125" y1="55" x2="135" y2="53" />
          <line x1="125" y1="58" x2="135" y2="56" />
          <line x1="145" y1="50" x2="155" y2="52" />
          <line x1="145" y1="53" x2="155" y2="55" />
          <line x1="145" y1="56" x2="155" y2="58" />
        </g>
        
        {/* Small books */}
        <rect x="30" y="55" width="15" height="20" fill={getColor(4) || getColor(2)} opacity="0.7" />
        <rect x="175" y="40" width="12" height="25" fill={getColor(0)} opacity="0.6" />
        
        {/* Bookmark */}
        <rect x="85" y="10" width="2" height="35" fill={getColor(1)} opacity="0.8" />
        <polygon points="85,10 87,10 86,5" fill={getColor(1)} opacity="0.8" />
      </svg>
    </div>
  );
};
