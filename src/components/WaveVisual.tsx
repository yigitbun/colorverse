
interface Palette {
  id: string;
  name: string;
  colors: string[];
}

interface WaveVisualProps {
  palette: Palette;
}

export const WaveVisual = ({ palette }: WaveVisualProps) => {
  const [primary, secondary, accent, background, text] = palette.colors;

  return (
    <div className="w-full h-20 overflow-hidden rounded-lg">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 200 80"
        style={{ backgroundColor: background || palette.colors[4] || '#f8f9fa' }}
      >
        {/* Wave layers */}
        <path
          d="M0,60 Q50,20 100,60 T200,60 L200,80 L0,80 Z"
          fill={primary || palette.colors[0]}
          opacity="0.9"
        />
        <path
          d="M0,65 Q40,35 80,65 T160,65 T240,65 L200,80 L0,80 Z"
          fill={secondary || palette.colors[1]}
          opacity="0.8"
        />
        <path
          d="M0,70 Q30,45 60,70 T120,70 T180,70 T240,70 L200,80 L0,80 Z"
          fill={accent || palette.colors[2]}
          opacity="0.7"
        />
        
        {/* Foam details */}
        <circle cx="25" cy="45" r="3" fill={background || palette.colors[4] || '#ffffff'} opacity="0.6" />
        <circle cx="75" cy="40" r="2" fill={background || palette.colors[4] || '#ffffff'} opacity="0.7" />
        <circle cx="125" cy="35" r="2.5" fill={background || palette.colors[4] || '#ffffff'} opacity="0.5" />
        <circle cx="160" cy="38" r="2" fill={background || palette.colors[4] || '#ffffff'} opacity="0.6" />
        
        {/* Droplets */}
        <circle cx="40" cy="25" r="1.5" fill={accent || palette.colors[2]} opacity="0.8" />
        <circle cx="90" cy="20" r="1" fill={primary || palette.colors[0]} opacity="0.7" />
        <circle cx="140" cy="15" r="1.5" fill={secondary || palette.colors[1]} opacity="0.6" />
        <circle cx="170" cy="22" r="1" fill={palette.colors[3] || text || palette.colors[0]} opacity="0.5" />
      </svg>
    </div>
  );
};
