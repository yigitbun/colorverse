export interface PaletteColors {
  bg: string;
  surface: string;
  primary: string;
  accent: string;
  text: string;
}

export interface Palette {
  id: string;
  name: string;
  description: string;
  colors: PaletteColors;
  swatches: string[];
  image: string;
  imageCredit: string;
}

function buildUnsplashUrl(photoId: string, width = 900): string {
  return `https://images.unsplash.com/photo-${photoId}?w=${width}&q=80&auto=format&fit=crop`;
}

function definePalette(
  id: string,
  name: string,
  description: string,
  bg: string,
  surface: string,
  primary: string,
  accent: string,
  text: string,
  unsplashPhotoId: string,
  credit: string,
): Palette {
  return {
    id,
    name,
    description,
    colors: { bg, surface, primary, accent, text },
    swatches: [bg, surface, primary, accent, text],
    image: buildUnsplashUrl(unsplashPhotoId),
    imageCredit: credit,
  };
}

export const palettes: Palette[] = [
  definePalette(
    "warm-cafe",
    "Warm Cafe",
    "Cozy browns and creams — perfect for coffee shops, bakeries, and slow-living brands.",
    "#FBF6F0",
    "#F0E3D2",
    "#8B5A3C",
    "#D17F3F",
    "#3E2A1F",
    "1495474472287-4d71bcdd2085",
    "Unsplash",
  ),
  definePalette(
    "nordic-calm",
    "Nordic Calm",
    "Cool whites and grays with a single blue accent — minimal, trustworthy, software-startup.",
    "#F5F7FA",
    "#E4E9F0",
    "#2D5BFF",
    "#7FA8FF",
    "#1A2330",
    "1505691938895-1758d7feb511",
    "Unsplash",
  ),
  definePalette(
    "sunset-pop",
    "Sunset Pop",
    "Hot pinks and golden oranges — bold, joyful, energetic landing pages and event sites.",
    "#FFF4E8",
    "#FFE1C2",
    "#E63B7A",
    "#F59E0B",
    "#3A1B2C",
    "1506905925346-21bda4d32df4",
    "Unsplash",
  ),
  definePalette(
    "forest-floor",
    "Forest Floor",
    "Earth greens and warm browns — outdoorsy, grounded, organic-feeling brands.",
    "#F4F1EA",
    "#D9D3C0",
    "#3A6B3E",
    "#A38450",
    "#1F2C1D",
    "1441974231531-c6227db76b6e",
    "Unsplash",
  ),
  definePalette(
    "midnight-tech",
    "Midnight Tech",
    "Deep navy with cyan and violet accents — modern, sharp, developer-focused dark mode.",
    "#0B1220",
    "#15203A",
    "#22D3EE",
    "#A78BFA",
    "#E2E8F0",
    "1419242902214-272b3f66ee7a",
    "Unsplash",
  ),
  definePalette(
    "pastel-daydream",
    "Pastel Daydream",
    "Soft pinks and dreamy purples — playful, gentle, lifestyle and creator brands.",
    "#FFF7FB",
    "#FCE7F3",
    "#A78BFA",
    "#F472B6",
    "#3F2A4B",
    "1500964757637-c85e8a162699",
    "Unsplash",
  ),
  definePalette(
    "bold-minimal",
    "Bold Minimal",
    "Stark whites and blacks with a single red accent — confident, editorial, magazine-feel.",
    "#FAFAFA",
    "#EDEDED",
    "#E11D48",
    "#171717",
    "#0A0A0A",
    "1493238792000-8113da705763",
    "Unsplash",
  ),
  definePalette(
    "tuscan-earth",
    "Tuscan Earth",
    "Terracotta and olive — Mediterranean, sun-baked, artisanal and handmade products.",
    "#FBF4E8",
    "#E7CFAF",
    "#C75B39",
    "#8A8F4D",
    "#3D2A1A",
    "1530841344095-9f73b1d7a30c",
    "Unsplash",
  ),
  definePalette(
    "cyber-neon",
    "Cyber Neon",
    "Black with electric green and magenta — futuristic, gaming, edgy tech brands.",
    "#0A0A0F",
    "#1A1A24",
    "#39FF14",
    "#FF2E97",
    "#F5F5F7",
    "1483406147867-c1b94d4d3b94",
    "Unsplash",
  ),
  definePalette(
    "ocean-breeze",
    "Ocean Breeze",
    "Aqua and warm sand — calm, coastal, summery travel and wellness vibes.",
    "#F0F8F8",
    "#CFE7E5",
    "#1FAFA0",
    "#F4C977",
    "#1B3B3A",
    "1507525428034-b723cf961d3e",
    "Unsplash",
  ),
];

export function getPaletteById(id: string): Palette | undefined {
  return palettes.find((p) => p.id === id);
}

export const DEFAULT_PALETTE_ID = "warm-cafe";
