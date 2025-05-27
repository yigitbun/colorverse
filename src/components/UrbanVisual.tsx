
interface Palette {
  id: string;
  name: string;
  colors: string[];
}

interface UrbanVisualProps {
  palette: Palette;
}

export const UrbanVisual = ({ palette }: UrbanVisualProps) => {
  const [primary, secondary, accent, background, text] = palette.colors;

  return (
    <div className="w-full h-20 overflow-hidden rounded-lg">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 200 80"
        style={{ backgroundColor: background || palette.colors[4] || '#f8f9fa' }}
      >
        {/* City skyline */}
        <rect x="10" y="30" width="15" height="50" fill={primary || palette.colors[0]} opacity="0.9" />
        <rect x="30" y="15" width="12" height="65" fill={secondary || palette.colors[1]} opacity="0.8" />
        <rect x="50" y="25" width="18" height="55" fill={accent || palette.colors[2]} opacity="0.9" />
        <rect x="75" y="10" width="14" height="70" fill={primary || palette.colors[0]} opacity="0.8" />
        <rect x="95" y="20" width="16" height="60" fill={palette.colors[3] || text || palette.colors[0]} opacity="0.7" />
        <rect x="115" y="35" width="12" height="45" fill={secondary || palette.colors[1]} opacity="0.9" />
        <rect x="135" y="5" width="20" height="75" fill={accent || palette.colors[2]} opacity="0.8" />
        <rect x="160" y="25" width="14" height="55" fill={primary || palette.colors[0]} opacity="0.9" />
        <rect x="180" y="40" width="10" height="40" fill={palette.colors[3] || text || palette.colors[0]} opacity="0.7" />
        
        {/* Windows */}
        <g fill={background || palette.colors[4] || '#ffffff'} opacity="0.8">
          <rect x="12" y="35" width="2" height="2" />
          <rect x="16" y="35" width="2" height="2" />
          <rect x="12" y="40" width="2" height="2" />
          <rect x="16" y="40" width="2" height="2" />
          
          <rect x="32" y="20" width="2" height="2" />
          <rect x="36" y="20" width="2" height="2" />
          <rect x="32" y="25" width="2" height="2" />
          <rect x="36" y="25" width="2" height="2" />
          
          <rect x="138" y="15" width="3" height="3" />
          <rect x="145" y="15" width="3" height="3" />
          <rect x="138" y="25" width="3" height="3" />
          <rect x="145" y="25" width="3" height="3" />
        </g>
        
        {/* Street level */}
        <rect x="0" y="75" width="200" height="5" fill={palette.colors[3] || text || palette.colors[0]} opacity="0.6" />
        
        {/* Traffic lights */}
        <rect x="85" y="65" width="3" height="8" fill={palette.colors[3] || text || palette.colors[0]} opacity="0.8" />
        <circle cx="86.5" cy="67" r="1" fill={accent || palette.colors[2]} />
      </svg>
    </div>
  );
};
