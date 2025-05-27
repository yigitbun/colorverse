
interface Palette {
  id: string;
  name: string;
  colors: string[];
}

interface GeometricVisualProps {
  palette: Palette;
}

export const GeometricVisual = ({ palette }: GeometricVisualProps) => {
  const [primary, secondary, accent, background, text] = palette.colors;

  return (
    <div className="w-full h-20 overflow-hidden rounded-lg">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 200 80"
        style={{ backgroundColor: background || palette.colors[4] || '#f8f9fa' }}
      >
        {/* Main geometric shapes */}
        <polygon 
          points="20,10 60,10 40,40" 
          fill={primary || palette.colors[0]} 
          opacity="0.9"
        />
        <rect 
          x="70" 
          y="15" 
          width="25" 
          height="25" 
          fill={secondary || palette.colors[1]} 
          opacity="0.8"
        />
        <circle 
          cx="130" 
          cy="27" 
          r="15" 
          fill={accent || palette.colors[2]} 
          opacity="0.9"
        />
        <polygon 
          points="160,40 180,20 200,40 180,60" 
          fill={palette.colors[3] || text || palette.colors[0]} 
          opacity="0.7"
        />
        
        {/* Secondary layer */}
        <polygon 
          points="10,50 30,70 50,50" 
          fill={palette.colors[2] || accent} 
          opacity="0.6"
        />
        <rect 
          x="80" 
          y="50" 
          width="15" 
          height="15" 
          fill={palette.colors[1] || secondary} 
          opacity="0.7"
        />
        <circle 
          cx="140" 
          cy="60" 
          r="8" 
          fill={palette.colors[0] || primary} 
          opacity="0.8"
        />
      </svg>
    </div>
  );
};
