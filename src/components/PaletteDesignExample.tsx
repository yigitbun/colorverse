
interface Palette {
  id: string;
  name: string;
  colors: string[];
}

interface PaletteDesignExampleProps {
  palette: Palette;
}

export const PaletteDesignExample = ({ palette }: PaletteDesignExampleProps) => {
  const getColor = (index: number) => palette.colors[index] || palette.colors[index % palette.colors.length];
  
  // Different design examples based on palette name/theme
  const getDesignType = () => {
    const name = palette.name.toLowerCase();
    if (name.includes('blue') || name.includes('ocean') || name.includes('sky')) return 'website';
    if (name.includes('mobile') || name.includes('app')) return 'mobile';
    if (name.includes('brand') || name.includes('logo')) return 'logo';
    if (name.includes('abstract') || name.includes('art')) return 'abstract';
    
    // Cycle through types based on palette id
    const types = ['website', 'mobile', 'logo', 'abstract', 'card'];
    const index = palette.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % types.length;
    return types[index];
  };

  const designType = getDesignType();

  const renderWebsiteExample = () => (
    <div 
      className="w-full h-full p-4 flex flex-col"
      style={{ backgroundColor: getColor(4) || getColor(palette.colors.length - 1) }}
    >
      <div className="flex items-center justify-between mb-3">
        <div 
          className="text-sm font-bold font-mono"
          style={{ color: getColor(0) }}
        >
          Brand
        </div>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getColor(1) }} />
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getColor(2) }} />
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-center">
        <h3 
          className="text-lg font-bold font-mono mb-2"
          style={{ color: getColor(0) }}
        >
          Hero Title
        </h3>
        <div 
          className="w-16 h-6 rounded text-xs flex items-center justify-center font-mono"
          style={{ 
            backgroundColor: getColor(1), 
            color: getColor(4) || '#ffffff' 
          }}
        >
          CTA
        </div>
      </div>
    </div>
  );

  const renderMobileExample = () => (
    <div className="w-full h-full flex justify-center items-center p-4">
      <div 
        className="w-24 h-40 rounded-lg shadow-lg overflow-hidden"
        style={{ backgroundColor: getColor(4) || getColor(palette.colors.length - 1) }}
      >
        <div className="p-2">
          <div 
            className="w-full h-6 rounded mb-2"
            style={{ backgroundColor: getColor(0) }}
          />
          <div className="space-y-1">
            {palette.colors.slice(0, 3).map((color, index) => (
              <div
                key={index}
                className="w-full h-3 rounded"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderLogoExample = () => (
    <div 
      className="w-full h-full flex items-center justify-center"
      style={{ backgroundColor: getColor(4) || getColor(palette.colors.length - 1) }}
    >
      <div className="flex items-center space-x-2">
        <div 
          className="w-8 h-8 rounded-full"
          style={{ backgroundColor: getColor(0) }}
        />
        <div className="flex flex-col">
          <div 
            className="w-12 h-2 rounded"
            style={{ backgroundColor: getColor(1) }}
          />
          <div 
            className="w-8 h-1 rounded mt-1"
            style={{ backgroundColor: getColor(2) }}
          />
        </div>
      </div>
    </div>
  );

  const renderAbstractExample = () => (
    <div className="w-full h-full relative overflow-hidden">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 200 192"
        preserveAspectRatio="xMidYMid slice"
        style={{ backgroundColor: getColor(palette.colors.length - 1) }}
      >
        <circle cx="60" cy="60" r="30" fill={getColor(0)} opacity="0.8" />
        <circle cx="140" cy="80" r="25" fill={getColor(1)} opacity="0.7" />
        <rect x="40" y="120" width="40" height="40" fill={getColor(2)} opacity="0.6" />
        <polygon points="120,120 140,160 100,160" fill={getColor(3) || getColor(1)} opacity="0.7" />
      </svg>
    </div>
  );

  const renderCardExample = () => (
    <div 
      className="w-full h-full p-4 flex flex-col"
      style={{ backgroundColor: getColor(4) || getColor(palette.colors.length - 1) }}
    >
      <div className="flex-1">
        <div 
          className="text-sm font-bold font-mono mb-1"
          style={{ color: getColor(0) }}
        >
          Card Title
        </div>
        <div 
          className="text-xs font-mono"
          style={{ color: getColor(1) }}
        >
          Subtitle
        </div>
      </div>
      <div className="flex gap-1 mt-4">
        {palette.colors.slice(0, 3).map((color, index) => (
          <div
            key={index}
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </div>
  );

  switch (designType) {
    case 'website': return renderWebsiteExample();
    case 'mobile': return renderMobileExample();
    case 'logo': return renderLogoExample();
    case 'abstract': return renderAbstractExample();
    case 'card': return renderCardExample();
    default: return renderWebsiteExample();
  }
};
