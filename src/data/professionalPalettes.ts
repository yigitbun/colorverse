
export interface Palette {
  id: string;
  name: string;
  colors: string[];
  isAI: boolean;
  theme: string;
  likes: number;
  clickCount: number;
}

export const professionalPalettes: Palette[] = [
  // Corporate & Modern Professional (3-9 colors)
  {
    id: "urban-cool",
    name: "Urban Cool",
    colors: ["#2C3E50", "#5E7A8E", "#95A5A6"],
    isAI: true,
    theme: "corporate",
    likes: 324,
    clickCount: 1250
  },
  {
    id: "soft-earth",
    name: "Soft Earth",
    colors: ["#6B7A89", "#95A5A6", "#C8D1D8", "#E9ECF0"],
    isAI: false,
    theme: "organic",
    likes: 289,
    clickCount: 987
  },
  {
    id: "deep-blue-accent",
    name: "Deep Blue Accent",
    colors: ["#2980B9", "#34495E", "#7F8C8D", "#C0C0C0", "#F8F8F8"],
    isAI: true,
    theme: "corporate",
    likes: 445,
    clickCount: 1876
  },
  {
    id: "monochromatic-green",
    name: "Monochromatic Green",
    colors: ["#27AE60", "#2ECC71", "#5CBF80", "#8AD09F", "#BDE0BF", "#E8F5E8"],
    isAI: false,
    theme: "organic",
    likes: 356,
    clickCount: 1432
  },
  {
    id: "subtle-burgundy",
    name: "Subtle Burgundy",
    colors: ["#8E44AD", "#B6A6C7", "#D2BFDE", "#ECE0EF", "#F8F2F6", "#FFFFFF", "#F5F5F5"],
    isAI: true,
    theme: "minimalist",
    likes: 278,
    clickCount: 1098
  },
  {
    id: "charcoal-cream",
    name: "Charcoal & Cream",
    colors: ["#34495E", "#7F8C8D", "#BDC3C7", "#FDF5E6", "#FFFFFF", "#F8F8F8", "#EEEEEE", "#E0E0E0"],
    isAI: false,
    theme: "minimalist",
    likes: 512,
    clickCount: 2145
  },
  {
    id: "sleek-teal",
    name: "Sleek Teal",
    colors: ["#16A085", "#2C3E50", "#95A5A6", "#ECF0F1", "#F2F2F2", "#FAFAFA", "#F8F8F8", "#FFFFFF", "#F5F5F5"],
    isAI: true,
    theme: "calm",
    likes: 423,
    clickCount: 1789
  },

  // Vibrant & Expressive (3-9 colors)
  {
    id: "electric-sunset",
    name: "Electric Sunset",
    colors: ["#FF5733", "#FFC300", "#E67E22"],
    isAI: true,
    theme: "vibrant",
    likes: 678,
    clickCount: 2934
  },
  {
    id: "digital-pop",
    name: "Digital Pop",
    colors: ["#9B59B6", "#3498DB", "#2ECC71", "#F1C40F"],
    isAI: false,
    theme: "energetic",
    likes: 589,
    clickCount: 2567
  },
  {
    id: "aqua-burst",
    name: "Aqua Burst",
    colors: ["#00FFFF", "#33CCCC", "#3498DB", "#1ABC9C", "#2C3E50"],
    isAI: true,
    theme: "vibrant",
    likes: 445,
    clickCount: 1987
  },
  {
    id: "neon-accents",
    name: "Neon Accents",
    colors: ["#FF00FF", "#00FF00", "#FFFF00", "#212121", "#F0F0F0", "#FFFFFF"],
    isAI: false,
    theme: "futuristic",
    likes: 734,
    clickCount: 3214
  },
  {
    id: "tropical-energy",
    name: "Tropical Energy",
    colors: ["#FF6347", "#FFD700", "#ADFF2F", "#1E90FF", "#2F4F4F", "#FF69B4", "#32CD32"],
    isAI: true,
    theme: "vibrant",
    likes: 567,
    clickCount: 2456
  },
  {
    id: "cyberpunk-blend",
    name: "Cyberpunk Blend",
    colors: ["#FF00FF", "#00FFFF", "#39FF14", "#212121", "#424242", "#FF0080", "#00FF80", "#8000FF"],
    isAI: false,
    theme: "futuristic",
    likes: 892,
    clickCount: 3876
  },
  {
    id: "citrus-punch",
    name: "Citrus Punch",
    colors: ["#FFD700", "#FFA500", "#FF6347", "#4CAF50", "#F0F8FF", "#FF4500", "#32CD32", "#FFE4B5", "#FFDEAD"],
    isAI: true,
    theme: "energetic",
    likes: 423,
    clickCount: 1876
  },

  // Calm & Serene (3-9 colors)
  {
    id: "cloud-whisper",
    name: "Cloud Whisper",
    colors: ["#BDC3C7", "#ECF0F1", "#F8F8F8"],
    isAI: false,
    theme: "calm",
    likes: 289,
    clickCount: 1234
  },
  {
    id: "misty-green",
    name: "Misty Green",
    colors: ["#778899", "#B0C4DE", "#DCDCDC", "#2F4F4F"],
    isAI: true,
    theme: "calm",
    likes: 334,
    clickCount: 1456
  },
  {
    id: "soft-lavender",
    name: "Soft Lavender",
    colors: ["#E6E6FA", "#D8BFD8", "#B2A2D4", "#9370DB", "#5B4785"],
    isAI: false,
    theme: "calm",
    likes: 412,
    clickCount: 1789
  },
  {
    id: "desert-blossom",
    name: "Desert Blossom",
    colors: ["#D2B48C", "#F5DEB3", "#FFE4B5", "#FFC7B3", "#FDF5E6", "#FAEBD7"],
    isAI: true,
    theme: "earthy",
    likes: 367,
    clickCount: 1567
  },
  {
    id: "ocean-breeze",
    name: "Ocean Breeze",
    colors: ["#87CEEB", "#B0E0E6", "#ADD8E6", "#5F9EA0", "#F0F8FF", "#E0F6FF", "#B0E2FF"],
    isAI: false,
    theme: "calm",
    likes: 445,
    clickCount: 1934
  },
  {
    id: "blush-softness",
    name: "Blush Softness",
    colors: ["#F08080", "#FFDAB9", "#FFB6C1", "#FFC0CB", "#FDF5E6", "#FFF0F5", "#FFEBEF", "#FFE4E1"],
    isAI: true,
    theme: "calm",
    likes: 523,
    clickCount: 2234
  },
  {
    id: "woodland-haze",
    name: "Woodland Haze",
    colors: ["#6B8E23", "#8FBC8F", "#A2B59F", "#778899", "#E0E0E0", "#F0F0F0", "#F5F5F5", "#FAFAFA", "#FFFFFF"],
    isAI: false,
    theme: "organic",
    likes: 398,
    clickCount: 1678
  },

  // Bold & Luxurious (3-9 colors)
  {
    id: "regal-plum",
    name: "Regal Plum",
    colors: ["#4A007F", "#6A00A6", "#9B009B"],
    isAI: true,
    theme: "industrial",
    likes: 678,
    clickCount: 2987
  },
  {
    id: "deep-emerald",
    name: "Deep Emerald",
    colors: ["#004B49", "#00736A", "#008C7F", "#212121"],
    isAI: false,
    theme: "industrial",
    likes: 567,
    clickCount: 2456
  },
  {
    id: "midnight-sapphire",
    name: "Midnight Sapphire",
    colors: ["#0A1C2B", "#1F3B54", "#345A73", "#7F8C8D", "#ECF0F1"],
    isAI: true,
    theme: "industrial",
    likes: 745,
    clickCount: 3123
  },
  {
    id: "gothic-ruby",
    name: "Gothic Ruby",
    colors: ["#800000", "#B22222", "#DC143C", "#212121", "#F0F0F0", "#FFFFFF"],
    isAI: false,
    theme: "industrial",
    likes: 634,
    clickCount: 2789
  },
  {
    id: "charcoal-gold",
    name: "Charcoal & Gold",
    colors: ["#212121", "#333333", "#616161", "#D4AF37", "#F0F0F0", "#FFD700", "#FFA500"],
    isAI: true,
    theme: "industrial",
    likes: 856,
    clickCount: 3567
  },
  {
    id: "obsidian-bronze",
    name: "Obsidian & Bronze",
    colors: ["#212121", "#424242", "#8B4513", "#CD853F", "#F0F0F0", "#B87333", "#D2691E", "#DEB887"],
    isAI: false,
    theme: "industrial",
    likes: 723,
    clickCount: 3098
  },
  {
    id: "velvet-green",
    name: "Velvet Green",
    colors: ["#2F4F4F", "#5F9EA0", "#8FBC8F", "#212121", "#F8F8F8", "#2E8B57", "#228B22", "#32CD32", "#90EE90"],
    isAI: true,
    theme: "organic",
    likes: 445,
    clickCount: 1987
  },

  // Artistic & Creative (3-9 colors)
  {
    id: "pastel-pop",
    name: "Pastel Pop",
    colors: ["#ADD8E6", "#90EE90", "#FFB6C1"],
    isAI: false,
    theme: "retro",
    likes: 423,
    clickCount: 1876
  },
  {
    id: "abstract-expression",
    name: "Abstract Expression",
    colors: ["#FF4500", "#FFD700", "#00BFFF", "#8A2BE2"],
    isAI: true,
    theme: "vibrant",
    likes: 567,
    clickCount: 2456
  },
  {
    id: "retro-futurism",
    name: "Retro Futurism",
    colors: ["#9B59B6", "#3498DB", "#F1C40F", "#FF00FF", "#00FFFF"],
    isAI: false,
    theme: "retro",
    likes: 689,
    clickCount: 2987
  },
  {
    id: "earthy-artisan",
    name: "Earthy Artisan",
    colors: ["#A0522D", "#CD853F", "#D2B48C", "#8B4513", "#696969", "#F5DEB3"],
    isAI: true,
    theme: "earthy",
    likes: 345,
    clickCount: 1567
  },
  {
    id: "vibrant-contrast",
    name: "Vibrant Contrast",
    colors: ["#E74C3C", "#2ECC71", "#3498DB", "#F1C40F", "#9B59B6", "#E67E22", "#1ABC9C"],
    isAI: false,
    theme: "vibrant",
    likes: 789,
    clickCount: 3456
  },
  {
    id: "neo-memphis",
    name: "Neo-Memphis",
    colors: ["#FF69B4", "#00FFFF", "#FFFF00", "#212121", "#F8F8F8", "#FF1493", "#00CED1", "#32CD32"],
    isAI: true,
    theme: "retro",
    likes: 834,
    clickCount: 3678
  },
  {
    id: "cosmic-dust",
    name: "Cosmic Dust",
    colors: ["#483D8B", "#6A5ACD", "#9370DB", "#CBB6DD", "#E6E6FA", "#4B0082", "#8B008B", "#9400D3", "#BA55D3"],
    isAI: false,
    theme: "futuristic",
    likes: 678,
    clickCount: 2934
  },

  // Additional Professional Palettes
  {
    id: "warm-neutral",
    name: "Warm Neutral",
    colors: ["#7B7B7B", "#A0A0A0", "#C8C8C8", "#EBEBEB", "#FAF3E0"],
    isAI: true,
    theme: "minimalist",
    likes: 234,
    clickCount: 1098
  },
  {
    id: "concrete-moss",
    name: "Concrete & Moss",
    colors: ["#7F8C8D", "#95A5A6", "#2F4F4F", "#5F9EA0", "#F3F5F6", "#E8F5E8"],
    isAI: false,
    theme: "industrial",
    likes: 378,
    clickCount: 1654
  },
  {
    id: "dusty-rose",
    name: "Dusty Rose",
    colors: ["#C28B9B", "#D4A2B2", "#E0B6C2", "#F0D5D9", "#F8F0F2", "#FFF5F7", "#FFEEF1"],
    isAI: true,
    theme: "calm",
    likes: 456,
    clickCount: 1987
  },
  {
    id: "clean-aqua",
    name: "Clean Aqua",
    colors: ["#00BCD4", "#80DEEA", "#B2EBF2", "#E0F7FA", "#F8F8F8", "#E0F8FF", "#B0E8FF", "#87CEEB"],
    isAI: false,
    theme: "calm",
    likes: 334,
    clickCount: 1456
  },
  {
    id: "muted-clay",
    name: "Muted Clay",
    colors: ["#A0522D", "#CD853F", "#D2B48C", "#E9DCC9", "#FDF5E6", "#F5E6D3", "#FAEBD7", "#F0E68C", "#DEB887"],
    isAI: true,
    theme: "earthy",
    likes: 289,
    clickCount: 1234
  },

  // Gradient and Modern Palettes
  {
    id: "sunrise-peaks",
    name: "Sunrise Peaks",
    colors: ["#F1C40F", "#F39C12", "#E67E22", "#D35400"],
    isAI: false,
    theme: "energetic",
    likes: 445,
    clickCount: 1876
  },
  {
    id: "aqua-dream",
    name: "Aqua Dream",
    colors: ["#00BCD4", "#4DD0E1", "#80DEEA", "#B2EBF2", "#E0F7FA"],
    isAI: true,
    theme: "calm",
    likes: 567,
    clickCount: 2234
  },
  {
    id: "mystic-garden",
    name: "Mystic Garden",
    colors: ["#6B8E23", "#8FBC8F", "#A2B59F", "#D8BFD8", "#E6E6FA", "#F0FFF0"],
    isAI: false,
    theme: "organic",
    likes: 398,
    clickCount: 1678
  },
  {
    id: "modern-rust",
    name: "Modern Rust",
    colors: ["#A0522D", "#CD853F", "#D2691E", "#8B4513", "#4A6572", "#B87333", "#DEB887"],
    isAI: true,
    theme: "industrial",
    likes: 423,
    clickCount: 1789
  },
  {
    id: "urban-greenery",
    name: "Urban Greenery",
    colors: ["#2F4F4F", "#3CB371", "#6B8E23", "#7F8C8D", "#BDC3C7", "#F0F8FF", "#E0FFE0", "#F5FFFA"],
    isAI: false,
    theme: "organic",
    likes: 356,
    clickCount: 1567
  },
  {
    id: "geometric-brights",
    name: "Geometric Brights",
    colors: ["#FF0000", "#0000FF", "#FFFF00", "#FF00FF", "#00FF00", "#FFA500", "#800080", "#008000", "#FF4500"],
    isAI: true,
    theme: "vibrant",
    likes: 734,
    clickCount: 3214
  }
];
