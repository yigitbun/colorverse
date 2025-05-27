
interface Palette {
  id: string;
  name: string;
  colors: string[];
}

interface FloralVisualProps {
  palette: Palette;
}

export const FloralVisual = ({ palette }: FloralVisualProps) => {
  const [primary, secondary, accent, background, text] = palette.colors;

  return (
    <div className="w-full h-20 overflow-hidden rounded-lg">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 200 80"
        style={{ backgroundColor: background || palette.colors[4] || '#f8f9fa' }}
      >
        {/* Flower petals */}
        <g transform="translate(50, 40)">
          <ellipse cx="0" cy="-15" rx="8" ry="15" fill={primary || palette.colors[0]} opacity="0.8" />
          <ellipse cx="12" cy="-8" rx="8" ry="15" fill={primary || palette.colors[0]} opacity="0.8" transform="rotate(45)" />
          <ellipse cx="12" cy="8" rx="8" ry="15" fill={primary || palette.colors[0]} opacity="0.8" transform="rotate(90)" />
          <ellipse cx="0" cy="15" rx="8" ry="15" fill={primary || palette.colors[0]} opacity="0.8" transform="rotate(135)" />
          <ellipse cx="-12" cy="8" rx="8" ry="15" fill={primary || palette.colors[0]} opacity="0.8" transform="rotate(180)" />
          <ellipse cx="-12" cy="-8" rx="8" ry="15" fill={primary || palette.colors[0]} opacity="0.8" transform="rotate(225)" />
          <circle cx="0" cy="0" r="5" fill={accent || palette.colors[2]} />
        </g>
        
        {/* Second flower */}
        <g transform="translate(120, 25)">
          <ellipse cx="0" cy="-10" rx="6" ry="12" fill={secondary || palette.colors[1]} opacity="0.9" />
          <ellipse cx="8" cy="-5" rx="6" ry="12" fill={secondary || palette.colors[1]} opacity="0.9" transform="rotate(60)" />
          <ellipse cx="8" cy="5" rx="6" ry="12" fill={secondary || palette.colors[1]} opacity="0.9" transform="rotate(120)" />
          <ellipse cx="0" cy="10" rx="6" ry="12" fill={secondary || palette.colors[1]} opacity="0.9" transform="rotate(180)" />
          <ellipse cx="-8" cy="5" rx="6" ry="12" fill={secondary || palette.colors[1]} opacity="0.9" transform="rotate(240)" />
          <ellipse cx="-8" cy="-5" rx="6" ry="12" fill={secondary || palette.colors[1]} opacity="0.9" transform="rotate(300)" />
          <circle cx="0" cy="0" r="3" fill={palette.colors[3] || text || palette.colors[0]} />
        </g>
        
        {/* Stems and leaves */}
        <line x1="50" y1="40" x2="50" y2="75" stroke={palette.colors[3] || text || palette.colors[0]} strokeWidth="2" opacity="0.7" />
        <line x1="120" y1="25" x2="120" y2="75" stroke={palette.colors[3] || text || palette.colors[0]} strokeWidth="2" opacity="0.7" />
        
        <ellipse cx="40" cy="60" rx="8" ry="4" fill={palette.colors[3] || text || palette.colors[0]} opacity="0.6" transform="rotate(-30)" />
        <ellipse cx="130" cy="50" rx="6" ry="3" fill={palette.colors[3] || text || palette.colors[0]} opacity="0.6" transform="rotate(20)" />
        
        {/* Decorative elements */}
        <circle cx="20" cy="20" r="3" fill={accent || palette.colors[2]} opacity="0.5" />
        <circle cx="170" cy="60" r="4" fill={palette.colors[1] || secondary} opacity="0.4" />
        <circle cx="180" cy="30" r="2" fill={palette.colors[0] || primary} opacity="0.6" />
      </svg>
    </div>
  );
};
