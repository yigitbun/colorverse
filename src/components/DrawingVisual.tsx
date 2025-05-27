
interface Palette {
  id: string;
  name: string;
  colors: string[];
}

interface DrawingVisualProps {
  palette: Palette;
}

export const DrawingVisual = ({ palette }: DrawingVisualProps) => {
  const [primary, secondary, accent, background, text] = palette.colors;

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <div className="relative w-full h-80 overflow-hidden rounded-lg shadow-lg">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 400 320"
          className="transition-all duration-500"
          style={{ backgroundColor: background || palette.colors[4] || '#f8f9fa' }}
        >
          {/* Mountain landscape */}
          <path
            d="M 0 200 L 80 120 L 160 180 L 240 100 L 320 160 L 400 140 L 400 320 L 0 320 Z"
            fill={primary || palette.colors[0]}
            opacity="0.9"
          />
          
          {/* Secondary mountain layer */}
          <path
            d="M 0 220 L 60 160 L 140 200 L 220 140 L 300 180 L 400 160 L 400 320 L 0 320 Z"
            fill={secondary || palette.colors[1]}
            opacity="0.8"
          />
          
          {/* Sun/Moon */}
          <circle
            cx="320"
            cy="80"
            r="25"
            fill={accent || palette.colors[2]}
            opacity="0.9"
          />
          
          {/* Sun rays */}
          <g stroke={accent || palette.colors[2]} strokeWidth="2" opacity="0.7">
            <line x1="320" y1="45" x2="320" y2="35" />
            <line x1="345" y1="55" x2="352" y2="48" />
            <line x1="355" y1="80" x2="365" y2="80" />
            <line x1="345" y1="105" x2="352" y2="112" />
            <line x1="320" y1="115" x2="320" y2="125" />
            <line x1="295" y1="105" x2="288" y2="112" />
            <line x1="285" y1="80" x2="275" y2="80" />
            <line x1="295" y1="55" x2="288" y2="48" />
          </g>
          
          {/* Trees */}
          <g>
            {/* Tree 1 */}
            <rect x="95" y="160" width="8" height="40" fill={text || palette.colors[0]} opacity="0.8" />
            <polygon 
              points="99,160 85,140 113,140" 
              fill={palette.colors[3] || secondary || palette.colors[1]} 
              opacity="0.9"
            />
            
            {/* Tree 2 */}
            <rect x="275" y="140" width="6" height="35" fill={text || palette.colors[0]} opacity="0.8" />
            <polygon 
              points="278,140 268,125 288,125" 
              fill={palette.colors[3] || secondary || palette.colors[1]} 
              opacity="0.9"
            />
            
            {/* Tree 3 */}
            <rect x="180" y="170" width="10" height="45" fill={text || palette.colors[0]} opacity="0.8" />
            <polygon 
              points="185,170 170,145 200,145" 
              fill={palette.colors[3] || secondary || palette.colors[1]} 
              opacity="0.9"
            />
          </g>
          
          {/* Birds */}
          <g stroke={text || palette.colors[0]} strokeWidth="2" fill="none" opacity="0.6">
            <path d="M 150 60 Q 155 55 160 60" />
            <path d="M 155 55 Q 160 50 165 55" />
            
            <path d="M 200 70 Q 205 65 210 70" />
            <path d="M 205 65 Q 210 60 215 65" />
            
            <path d="M 120 80 Q 125 75 130 80" />
            <path d="M 125 75 Q 130 70 135 75" />
          </g>
          
          {/* Clouds */}
          <g fill={text || palette.colors[0]} opacity="0.3">
            <ellipse cx="80" cy="60" rx="25" ry="12" />
            <ellipse cx="100" cy="55" rx="30" ry="15" />
            <ellipse cx="120" cy="60" rx="20" ry="10" />
            
            <ellipse cx="250" cy="40" rx="20" ry="8" />
            <ellipse cx="265" cy="35" rx="25" ry="12" />
          </g>
          
          {/* Water reflection */}
          <ellipse 
            cx="200" 
            cy="280" 
            rx="80" 
            ry="15" 
            fill={accent || palette.colors[2]} 
            opacity="0.4"
          />
          
          {/* Decorative geometric shapes */}
          <g opacity="0.6">
            <polygon 
              points="50,250 60,230 70,250 60,270" 
              fill={palette.colors[2] || accent} 
            />
            <polygon 
              points="350,280 365,260 380,280 365,300" 
              fill={palette.colors[1] || secondary} 
            />
          </g>
        </svg>
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-sm font-mono text-gray-600">
          Abstract Landscape • Palette: {palette.name}
        </p>
      </div>
    </div>
  );
};
