import type { Palette } from "@/data/palettes";

const SHAPES = ["dot", "stripe", "triangle", "arc", "diamond"] as const;

function shapeForId(id: string): (typeof SHAPES)[number] {
  let sum = 0;
  for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i);
  return SHAPES[sum % SHAPES.length];
}

export function PaletteBadge({ palette, size = 28 }: { palette: Palette; size?: number }) {
  const { primary, accent } = palette.colors;
  const shape = shapeForId(palette.id);
  const svgProps = {
    width: size,
    height: size,
    viewBox: "0 0 32 32",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true as const,
    style: { display: "block" as const },
  };

  switch (shape) {
    case "dot":
      return (
        <svg {...svgProps}>
          <rect width="32" height="32" rx="8" fill={primary} />
          <circle cx="16" cy="16" r="6" fill={accent} />
        </svg>
      );
    case "stripe":
      return (
        <svg {...svgProps}>
          <rect width="32" height="32" rx="8" fill={primary} />
          <rect y="12" width="32" height="4" fill={accent} />
          <rect y="20" width="32" height="2" fill={accent} opacity="0.55" />
        </svg>
      );
    case "triangle":
      return (
        <svg {...svgProps}>
          <rect width="32" height="32" rx="8" fill={primary} />
          <polygon points="16,7 26,24 6,24" fill={accent} />
        </svg>
      );
    case "arc":
      return (
        <svg {...svgProps}>
          <rect width="32" height="32" rx="8" fill={primary} />
          <path d="M 6 22 A 10 10 0 0 1 26 22 Z" fill={accent} />
        </svg>
      );
    case "diamond":
      return (
        <svg {...svgProps}>
          <rect width="32" height="32" rx="8" fill={primary} />
          <rect
            x="16"
            y="6"
            width="14"
            height="14"
            fill={accent}
            transform="rotate(45 16 16)"
          />
        </svg>
      );
  }
}
