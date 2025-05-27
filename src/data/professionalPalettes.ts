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
  {
    id: "rainbow-identity",
    name: "Rainbow Identity",
    colors: ["#FF0000", "#FFA500", "#FFFF00", "#00FF00", "#0000FF", "#800080"],
    isAI: false,
    theme: "vibrant",
    likes: 0,
    clickCount: 0
  },
  {
    id: "night-wolf",
    name: "Night Wolf",
    colors: ["#1A1A2E", "#FFA500", "#D3D3D3", "#FFFFFF", "#8B4513"],
    isAI: true,
    theme: "dark",
    likes: 0,
    clickCount: 0
  },
  {
    id: "ocean-flow",
    name: "Ocean Flow",
    colors: ["#4169E1", "#F5F5F5"],
    isAI: true,
    theme: "minimalist",
    likes: 0,
    clickCount: 0
  },
  {
    id: "lavender-sunset",
    name: "Lavender Sunset",
    colors: ["#663399", "#E6E6FA", "#FFB6C1", "#DB7093"],
    isAI: false,
    theme: "calm",
    likes: 0,
    clickCount: 0
  },
  {
    id: "cozy-comfort",
    name: "Cozy Comfort",
    colors: ["#808080", "#556B2F", "#F5F5DC", "#8B7355"],
    isAI: false,
    theme: "earthy",
    likes: 0,
    clickCount: 0
  },
  // Existing palettes...
  {
    id: "urban-cool",
    name: "Urban Cool",
    colors: ["#2C3E50", "#5E7A8E", "#95A5A6"],
    isAI: true,
    theme: "corporate",
    likes: 324,
    clickCount: 1250
  },
  // ... rest of existing palettes
];