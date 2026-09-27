// Original collection inherited from colorverse.byigit.dev, plus the five studio studies.
const originalPalettes = [
  {
    "id": "sunset-pop",
    "name": "Sunset Pop",
    "description": "Hot pinks and golden oranges — bold, joyful, energetic landing pages and event sites.",
    "colors": [
      "#FFF4E8",
      "#FFE1C2",
      "#E63B7A",
      "#F59E0B",
      "#3A1B2C"
    ],
    "image": null,
    "source": null,
    "credit": null,
    "category": "Landscape",
    "tags": ["warm", "energetic", "sunset"],
    "useCases": ["campaigns", "events", "editorial"]
  },
  {
    "id": "warm-cafe",
    "name": "Warm Cafe",
    "description": "Cozy browns and creams — perfect for coffee shops, bakeries, and slow-living brands.",
    "colors": [
      "#FBF6F0",
      "#F0E3D2",
      "#8B5A3C",
      "#D17F3F",
      "#3E2A1F"
    ],
    "image": null,
    "source": null,
    "credit": null,
    "category": "Coffee & food",
    "tags": ["warm", "earthy", "comforting"],
    "useCases": ["hospitality", "packaging", "retail"]
  },
  {
    "id": "nordic-calm",
    "name": "Nordic Calm",
    "description": "Cool whites and grays with a single blue accent — minimal, trustworthy, software-startup.",
    "colors": [
      "#F5F7FA",
      "#E4E9F0",
      "#2D5BFF",
      "#7FA8FF",
      "#1A2330"
    ],
    "image": null,
    "source": null,
    "credit": null,
    "category": "Interiors",
    "tags": ["cool", "minimal", "quiet"],
    "useCases": ["software", "architecture", "wellness"]
  },
  {
    "id": "forest-floor",
    "name": "Forest Floor",
    "description": "Earth greens and warm browns — outdoorsy, grounded, organic-feeling brands.",
    "colors": [
      "#F4F1EA",
      "#D9D3C0",
      "#3A6B3E",
      "#A38450",
      "#1F2C1D"
    ],
    "image": null,
    "source": null,
    "credit": null,
    "category": "Nature",
    "tags": ["organic", "earthy", "grounded"],
    "useCases": ["outdoors", "food", "sustainability"]
  },
  {
    "id": "midnight-tech",
    "name": "Midnight Tech",
    "description": "Deep navy with cyan and violet accents — modern, sharp, developer-focused dark mode.",
    "colors": [
      "#0B1220",
      "#15203A",
      "#22D3EE",
      "#A78BFA",
      "#E2E8F0"
    ],
    "image": null,
    "source": null,
    "credit": null,
    "category": "Nightscape",
    "tags": ["dark", "precise", "electric"],
    "useCases": ["software", "data", "technology"]
  },
  {
    "id": "pastel-daydream",
    "name": "Pastel Daydream",
    "description": "Soft pinks and dreamy purples — playful, gentle, lifestyle and creator brands.",
    "colors": [
      "#FFF7FB",
      "#FCE7F3",
      "#A78BFA",
      "#F472B6",
      "#3F2A4B"
    ],
    "image": null,
    "source": null,
    "credit": null,
    "category": "Atmosphere",
    "tags": ["pastel", "soft", "dreamlike"],
    "useCases": ["beauty", "lifestyle", "editorial"]
  },
  {
    "id": "bold-minimal",
    "name": "Bold Minimal",
    "description": "Stark whites and blacks with a single red accent — confident, editorial, magazine-feel.",
    "colors": [
      "#FAFAFA",
      "#EDEDED",
      "#E11D48",
      "#171717",
      "#0A0A0A"
    ],
    "image": null,
    "source": null,
    "credit": null,
    "category": "Automotive",
    "tags": ["graphic", "high-contrast", "editorial"],
    "useCases": ["campaigns", "fashion", "publishing"]
  },
  {
    "id": "tuscan-earth",
    "name": "Tuscan Earth",
    "description": "Terracotta and olive — Mediterranean, sun-baked, artisanal and handmade products.",
    "colors": [
      "#FBF4E8",
      "#E7CFAF",
      "#C75B39",
      "#8A8F4D",
      "#3D2A1A"
    ],
    "image": null,
    "source": null,
    "credit": null,
    "category": "Travel",
    "tags": ["vintage", "sun-baked", "artisanal"],
    "useCases": ["hospitality", "packaging", "craft"]
  },
  {
    "id": "cyber-neon",
    "name": "Cyber Neon",
    "description": "Black with electric green and magenta — futuristic, gaming, edgy tech brands.",
    "colors": [
      "#0A0A0F",
      "#1A1A24",
      "#39FF14",
      "#FF2E97",
      "#F5F5F7"
    ],
    "image": null,
    "source": null,
    "credit": null,
    "category": "Abstract",
    "tags": ["neon", "dark", "futuristic"],
    "useCases": ["technology", "music", "gaming"]
  },
  {
    "id": "ocean-breeze",
    "name": "Ocean Breeze",
    "description": "Aqua and warm sand — calm, coastal, summery travel and wellness vibes.",
    "colors": [
      "#F0F8F8",
      "#CFE7E5",
      "#1FAFA0",
      "#F4C977",
      "#1B3B3A"
    ],
    "image": null,
    "source": null,
    "credit": null,
    "category": "Coastal",
    "tags": ["fresh", "calm", "sunlit"],
    "useCases": ["travel", "wellness", "hospitality"]
  },
  {
    "id": "neon-tide",
    "name": "Neon Tide",
    "description": "Acid yellow and deep ink, with a flash of coral and clear blue.",
    "colors": [
      "#E8D7AC",
      "#63D9EE",
      "#E8FF5F",
      "#FF6B5E",
      "#24213D"
    ],
    "image": null,
    "source": null,
    "credit": null,
    "category": "Abstract",
    "tags": ["electric", "playful", "high-contrast"],
    "useCases": ["music", "campaigns", "digital products"]
  },
  {
    "id": "after-rain",
    "name": "After Rain",
    "description": "Fresh green, rain-washed blue, and a quiet touch of pink.",
    "colors": [
      "#EEF1E5",
      "#F7C1D9",
      "#69E895",
      "#8FD3FF",
      "#273C4D"
    ],
    "image": null,
    "source": null,
    "credit": null,
    "category": "Nature",
    "tags": ["fresh", "soft", "rain-washed"],
    "useCases": ["wellness", "beauty", "lifestyle"]
  },
  {
    "id": "citrus-static",
    "name": "Citrus Static",
    "description": "Citrus orange and electric yellow grounded in deep aubergine.",
    "colors": [
      "#FFE3B7",
      "#F7E55D",
      "#FF9B52",
      "#69E895",
      "#30233B"
    ],
    "image": null,
    "source": null,
    "credit": null,
    "category": "Landscape",
    "tags": ["citrus", "bright", "energetic"],
    "useCases": ["food", "events", "campaigns"]
  },
  {
    "id": "night-garden",
    "name": "Night Garden",
    "description": "Violet, deep teal, and pink, for a garden after dark.",
    "colors": [
      "#D9E9D0",
      "#63D9EE",
      "#9D7CFF",
      "#EF6C9B",
      "#132F39"
    ],
    "image": null,
    "source": null,
    "credit": null,
    "category": "Botanical",
    "tags": ["nocturnal", "lush", "mysterious"],
    "useCases": ["beauty", "hospitality", "editorial"]
  },
  {
    "id": "soft-voltage",
    "name": "Soft Voltage",
    "description": "Cool blue, soft pink, and a small shock of acid yellow.",
    "colors": [
      "#FFE9F0",
      "#9D7CFF",
      "#63D9EE",
      "#E8FF5F",
      "#322447"
    ],
    "image": null,
    "source": null,
    "credit": null,
    "category": "Atmosphere",
    "tags": ["soft", "electric", "contemporary"],
    "useCases": ["fashion", "technology", "editorial"]
  },
  {
    "id": "patina-cycle",
    "name": "Patina Cycle",
    "description": "Rust, faded blue, and warm stone — a lived-in direction for heritage goods and editorial travel work.",
    "colors": ["#F1E4D4", "#B7C0BC", "#8E5B3F", "#41606A", "#202D33"],
    "image": null,
    "credit": null,
    "source": null,
    "category": "Vintage object",
    "tags": ["patina", "vintage", "crafted"],
    "useCases": ["heritage", "travel", "editorial"]
  },
  {
    "id": "civic-shadow",
    "name": "Civic Shadow",
    "description": "Concrete neutrals cut with aubergine and rust — structured, confident, and made for strong visual systems.",
    "colors": ["#E8E1D8", "#B7B0A8", "#A87558", "#5A5165", "#1C2026"],
    "image": null,
    "credit": null,
    "source": null,
    "category": "Architecture",
    "tags": ["structural", "graphic", "editorial"],
    "useCases": ["architecture", "fashion", "portfolio"]
  },
  {
    "id": "quiet-workshop",
    "name": "Quiet Workshop",
    "description": "Soft ceramic, eucalyptus, and wood — a calm material study for interiors, packaging, and slow brands.",
    "colors": ["#F4EFE7", "#D9CBB8", "#B0A096", "#72836F", "#2B2A27"],
    "image": null,
    "credit": null,
    "source": null,
    "category": "Material & craft",
    "tags": ["tactile", "quiet", "natural"],
    "useCases": ["interiors", "packaging", "wellness"]
  },
  {
    "id": "market-signal",
    "name": "Market Signal",
    "description": "Citrus orange, leaf green, and deep ink — a bright, immediate direction for food and retail brands.",
    "colors": ["#FFF2D6", "#F5C247", "#F28B2B", "#6E9A62", "#273D3C"],
    "image": null,
    "credit": null,
    "source": null,
    "category": "Food & retail",
    "tags": ["citrus", "fresh", "immediate"],
    "useCases": ["food", "retail", "campaigns"]
  },
  {
    "id": "reef-current",
    "name": "Reef Current",
    "description": "Clear aqua, coral heat, and deep marine blue — made for coastal hospitality, wellness, and science-led stories.",
    "colors": ["#E7F7F3", "#9CDDD2", "#2E9AAB", "#E86E5B", "#12394A"],
    "image": null,
    "credit": null,
    "source": null,
    "category": "Marine",
    "tags": ["aquatic", "fresh", "vivid"],
    "useCases": ["travel", "wellness", "science"]
  },
  {
    "id": "low-cloud",
    "name": "Low Cloud",
    "description": "Fog-softened greens and blue-grays — restrained, atmospheric, and quietly cinematic.",
    "colors": ["#E9E8E2", "#AEB9B8", "#6D888B", "#3E5054", "#1A2629"],
    "image": null,
    "credit": null,
    "source": null,
    "category": "Landscape",
    "tags": ["quiet", "atmospheric", "cool"],
    "useCases": ["architecture", "travel", "editorial"]
  },
  {
    "id": "after-hours",
    "name": "After Hours",
    "description": "Ink, neon pink, violet, and a warm signal — a nocturnal system for music, nightlife, and digital culture.",
    "colors": ["#121A22", "#253B43", "#E84E82", "#7B5CFF", "#F5D36A"],
    "image": null,
    "credit": null,
    "source": null,
    "category": "Nightlife",
    "tags": ["nocturnal", "electric", "social"],
    "useCases": ["music", "hospitality", "digital products"]
  },
  {
    "id": "prism-light",
    "name": "Prism Light",
    "description": "Colored glass turns daylight into a confident spectrum — for culture, events, and expressive editorial work.",
    "colors": ["#F6F1E5", "#F2C05E", "#DA5B7A", "#4C7CC8", "#292A4A"],
    "image": null,
    "credit": null,
    "source": null,
    "category": "Light & glass",
    "tags": ["luminous", "expressive", "cultural"],
    "useCases": ["arts", "events", "editorial"]
  },
  {
    "id": "dune-signal",
    "name": "Dune Signal",
    "description": "Sand, clay, dry green, and a dark horizon — a sun-baked palette for hospitality and considered packaging.",
    "colors": ["#F5E6C8", "#D8A474", "#B86D43", "#718A74", "#30383A"],
    "image": null,
    "credit": null,
    "source": null,
    "category": "Desert landscape",
    "tags": ["sun-baked", "minimal", "grounded"],
    "useCases": ["hospitality", "outdoors", "packaging"]
  },
  {
    "id": "archive-green",
    "name": "Archive Green",
    "description": "Old paper, bookcloth green, and a precise red mark — a literary palette for publishing, education, and retail.",
    "colors": ["#F5EBDD", "#D7C4A8", "#5D765F", "#A4483F", "#2B2928"],
    "image": null,
    "credit": null,
    "source": null,
    "category": "Culture & reading",
    "tags": ["literary", "heritage", "considered"],
    "useCases": ["publishing", "education", "retail"]
  }
];

const visualSources = {
  heritage: {
    image: null,
    credit: null,
    source: null
  },
  architecture: {
    image: null,
    credit: null,
    source: null
  },
  craft: {
    image: null,
    credit: null,
    source: null
  },
  market: {
    image: null,
    credit: null,
    source: null
  },
  marine: {
    image: null,
    credit: null,
    source: null
  },
  landscape: {
    image: null,
    credit: null,
    source: null
  },
  nightlife: {
    image: null,
    credit: null,
    source: null
  },
  arts: {
    image: null,
    credit: null,
    source: null
  },
  desert: {
    image: null,
    credit: null,
    source: null
  },
  editorial: {
    image: null,
    credit: null,
    source: null
  }
};

const families = [
  {
    key: "editorial", category: "Editorial", hue: 38, accent: 4, source: "editorial",
    tags: ["quiet", "literary", "considered"], useCases: ["editorial", "publishing", "education"],
    description: "Paper-led neutrals with a precise editorial accent for publications, cultural work, and thoughtful reading systems.",
    names: ["Paper Ledger", "Modern Folio", "Margin Note", "Sunday Review", "Quiet Edition"]
  },
  {
    key: "architecture", category: "Architecture", hue: 28, accent: 347, source: "architecture",
    tags: ["minimal", "structural", "grounded"], useCases: ["architecture", "portfolio", "brand"],
    description: "Mineral surfaces and a measured signal color for spatial identities, portfolios, and civic design.",
    names: ["Limewash Grid", "Concrete Sun", "Gallery Steps", "Civic Linen", "Museum Shadow"]
  },
  {
    key: "hospitality", category: "Hospitality", hue: 31, accent: 142, source: "craft",
    tags: ["warm", "comforting", "tactile"], useCases: ["hospitality", "food", "interiors"],
    description: "Linen, clay, and a fresh counterpoint shaped for welcoming rooms, menus, and independent hospitality.",
    names: ["Breakfast Room", "Hearth Table", "Linen Service", "Slow Sunday", "Small Hotel"]
  },
  {
    key: "market", category: "Food & retail", hue: 39, accent: 111, source: "market",
    tags: ["fresh", "warm", "vivid"], useCases: ["food", "retail", "packaging"],
    description: "Produce-led color with sturdy dark type, designed for labels, counters, menus, and seasonal retail stories.",
    names: ["Citrus Counter", "Pantry Label", "Fresh Market", "Olive Press", "Tomato Paper"]
  },
  {
    key: "marine", category: "Coastal", hue: 188, accent: 9, source: "marine",
    tags: ["cool", "fresh", "calm"], useCases: ["travel", "wellness", "science"],
    description: "Clear aquatic tones balanced by a warm marker for coastal services, research, and restorative brands.",
    names: ["Salt Air", "Tide Pool", "Harbor Glass", "Sea Studio", "Coastal Ledger"]
  },
  {
    key: "landscape", category: "Landscape", hue: 163, accent: 41, source: "landscape",
    tags: ["quiet", "atmospheric", "cool"], useCases: ["outdoors", "travel", "editorial"],
    description: "Mist-softened greens and grays for slow travel, landscape practice, and atmospheric editorial work.",
    names: ["Moss Weather", "Silver Rain", "Pine Distance", "Lake Fog", "Field Notes"]
  },
  {
    key: "desert", category: "Desert & earth", hue: 29, accent: 177, source: "desert",
    tags: ["warm", "sun-baked", "grounded"], useCases: ["hospitality", "packaging", "outdoors"],
    description: "Sand, terracotta, and a cool balancing note for grounded destinations, goods, and tactile packaging.",
    names: ["Clay Horizon", "Desert Linen", "Sienna Court", "Canyon Paper", "Dry Garden"]
  },
  {
    key: "heritage", category: "Heritage", hue: 202, accent: 25, source: "heritage",
    tags: ["vintage", "crafted", "grounded"], useCases: ["heritage", "retail", "editorial"],
    description: "Workshop blue, aged metal, and paper neutrals for brands that need history without nostalgia overload.",
    names: ["Workshop Blue", "Brass & Denim", "Railway Poster", "Leather Ledger", "Foundry Cream"]
  },
  {
    key: "arts", category: "Arts & culture", hue: 268, accent: 46, source: "arts",
    tags: ["vivid", "cultural", "expressive"], useCases: ["arts", "events", "editorial"],
    description: "Luminous cultural color built for posters, programs, exhibitions, and expressive identities.",
    names: ["Prism Poster", "Blue Theatre", "Rose Glass", "Festival Ink", "Museum Night"], modes: ["light", "light", "light", "dark", "dark"]
  },
  {
    key: "night", category: "Night culture", hue: 236, accent: 324, source: "nightlife",
    tags: ["dark", "nocturnal", "electric"], useCases: ["music", "events", "digital products"],
    description: "Deep ink, electric highlights, and controlled contrast for music, cinema, and after-dark digital work.",
    names: ["Electric Cinema", "Midnight Transit", "Club Poster", "Afterimage", "Violet Signal"], modes: ["dark", "dark", "dark", "dark", "dark"]
  },
  {
    key: "product", category: "Digital product", hue: 216, accent: 163, source: "architecture",
    tags: ["cool", "precise", "minimal"], useCases: ["software", "digital products", "technology"],
    description: "Accessible interface neutrals with a clear action color, tuned for product screens and useful software.",
    names: ["Clear Product", "Blue System", "Mint Interface", "Amber Utility", "Violet Console"], modes: ["light", "light", "light", "light", "dark"]
  },
  {
    key: "data", category: "Data & reporting", hue: 206, accent: 34, source: "landscape",
    tags: ["cool", "precise", "quiet"], useCases: ["data", "software", "editorial"],
    description: "Calm analytical color with one decisive highlight for dashboards, reports, and evidence-led presentations.",
    names: ["Evidence Blue", "Signal Report", "Quiet Metrics", "Boardroom Ink", "Public Data"], modes: ["light", "light", "light", "dark", "light"]
  },
  {
    key: "wellness", category: "Wellness", hue: 145, accent: 344, source: "craft",
    tags: ["soft", "calm", "fresh"], useCases: ["wellness", "beauty", "health"],
    description: "Gentle mineral tones with enough definition for care, movement, beauty, and everyday wellbeing services.",
    names: ["Mineral Bath", "Sage Practice", "Rose Ritual", "Soft Clinic", "Morning Stretch"]
  },
  {
    key: "fashion", category: "Fashion & beauty", hue: 330, accent: 89, source: "arts",
    tags: ["soft", "editorial", "contemporary"], useCases: ["fashion", "beauty", "editorial"],
    description: "Powdered surfaces, inky type, and a seasonal accent for lookbooks, beauty launches, and modern retail.",
    names: ["Powder Issue", "Studio Rouge", "Ink & Lilac", "Runway Lime", "Soft Tailoring"], modes: ["light", "light", "dark", "light", "light"]
  },
  {
    key: "packaging", category: "Packaging", hue: 23, accent: 195, source: "craft",
    tags: ["warm", "crafted", "considered"], useCases: ["packaging", "retail", "food"],
    description: "Shelf-ready paper, label, and ribbon colors for small-batch goods, gifts, and tactile product systems.",
    names: ["Tea Carton", "Cacao Wrap", "Soap Paper", "Gift Ribbon", "Bottle Label"]
  }
];

const hueOffsets = [-12, -5, 0, 7, 14];
const accentOffsets = [0, 11, -9, 19, -17];

const editionOverrides = {
  "Powder Issue": {
    id: "skincare-system-01",
    name: "Soft Structure",
    series: "Soft Structure",
    seriesCode: "CV / SS",
    description: "A five-product care-object series where color identifies each formula while one structure keeps the range coherent.",
    colors: ["#E9E3D8", "#9B9F83", "#B66F56", "#AAA2AC", "#252B2F"],
    image: null,
    source: null,
    credit: null,
    category: "Care objects",
    tags: ["soft", "material", "considered"],
    useCases: ["care", "packaging", "retail"]
  }
};

function hslToHex(hue, saturation, lightness) {
  const h = ((hue % 360) + 360) % 360;
  const s = saturation / 100;
  const l = lightness / 100;
  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const x = chroma * (1 - Math.abs((h / 60) % 2 - 1));
  const match = l - chroma / 2;
  const segments = h < 60 ? [chroma, x, 0] : h < 120 ? [x, chroma, 0] : h < 180 ? [0, chroma, x] : h < 240 ? [0, x, chroma] : h < 300 ? [x, 0, chroma] : [chroma, 0, x];
  return `#${segments.map(value => Math.round((value + match) * 255).toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}

function slug(value) {
  return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function familyPalette(family, index) {
  const hue = family.hue + hueOffsets[index];
  const accentHue = family.accent + accentOffsets[index];
  const dark = family.modes?.[index] === "dark";
  const colors = dark
    ? [hslToHex(hue, 31, 9 + index % 2), hslToHex(hue, 25, 16 + index % 3), hslToHex(hue, 68, 66), hslToHex(accentHue, 76, 62), hslToHex(hue, 22, 94)]
    : [hslToHex(hue, 34, 97), hslToHex(hue, 30, 89 - index % 2), hslToHex(hue, 56 + index * 2, 39 + index % 3), hslToHex(accentHue, 70, 52 + index % 2), hslToHex(hue, 28, 14)];
  const visual = visualSources[family.source];
  const generated = {
    id: slug(family.names[index]),
    name: family.names[index],
    description: family.description,
    colors,
    ...visual,
    category: family.category,
    tags: [...family.tags],
    useCases: [...family.useCases]
  };
  return { ...generated, ...(editionOverrides[family.names[index]] || {}) };
}

const expandedPalettes = families.flatMap(family => family.names.map((_, index) => familyPalette(family, index)));

export const palettes = [...originalPalettes, ...expandedPalettes];
