
interface Palette {
  id: string;
  name: string;
  colors: string[];
}

interface GradientVisualProps {
  palette: Palette;
}

export const GradientVisual = ({ palette }: GradientVisualProps) => {
  const getColor = (index: number) => palette.colors[index] || palette.colors[index % palette.colors.length];

  return (
    <div className="w-full h-20 overflow-hidden rounded-lg">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 200 80"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id={`gradient-${palette.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            {palette.colors.map((color, index) => (
              <stop key={index} offset={`${(index / (palette.colors.length - 1)) * 100}%`} stopColor={color} />
            ))}
          </linearGradient>
          <radialGradient id={`radial-${palette.id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={getColor(0)} stopOpacity="0.8" />
            <stop offset="50%" stopColor={getColor(1)} stopOpacity="0.6" />
            <stop offset="100%" stopColor={getColor(2)} stopOpacity="0.4" />
          </radialGradient>
        </defs>
        
        <rect width="200" height="80" fill={`url(#gradient-${palette.id})`} />
        <circle cx="100" cy="40" r="25" fill={`url(#radial-${palette.id})`} />
        
        {/* Overlay shapes */}
        <rect x="20" y="20" width="30" height="40" fill={getColor(3) || getColor(0)} opacity="0.3" />
        <rect x="150" y="10" width="25" height="60" fill={getColor(4) || getColor(1)} opacity="0.3" />
      </svg>
    </div>
  );
};
