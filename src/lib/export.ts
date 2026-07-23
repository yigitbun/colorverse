import type { Palette } from "@/data/palettes";

export function toCssVariables(palette: Palette): string {
  const { bg, surface, primary, accent, text } = palette.colors;
  return `/* ${palette.name} */
:root {
  --${palette.id}-bg: ${bg};
  --${palette.id}-surface: ${surface};
  --${palette.id}-primary: ${primary};
  --${palette.id}-accent: ${accent};
  --${palette.id}-text: ${text};
}`;
}

export function toScss(palette: Palette): string {
  const { bg, surface, primary, accent, text } = palette.colors;
  return `// ${palette.name}
$${palette.id}-bg: ${bg};
$${palette.id}-surface: ${surface};
$${palette.id}-primary: ${primary};
$${palette.id}-accent: ${accent};
$${palette.id}-text: ${text};`;
}

export function toJson(palette: Palette): string {
  return JSON.stringify(
    { id: palette.id, name: palette.name, colors: palette.colors },
    null,
    2,
  );
}

export function toTailwindConfig(palette: Palette): string {
  const { bg, surface, primary, accent, text } = palette.colors;
  return `// tailwind.config.js — add to theme.extend.colors
module.exports = {
  theme: {
    extend: {
      colors: {
        '${palette.id}': {
          bg: '${bg}',
          surface: '${surface}',
          primary: '${primary}',
          accent: '${accent}',
          text: '${text}',
        }
      }
    }
  }
};`;
}

export function toHexList(palette: Palette): string {
  return palette.swatches.map((s) => s.toUpperCase()).join("\n");
}

export interface ExportFormatOption {
  key: string;
  label: string;
  fn: (palette: Palette) => string;
  requiresAccount: boolean;
}

export const exportFormats: ExportFormatOption[] = [
  { key: "css", label: "CSS", fn: toCssVariables, requiresAccount: false },
  { key: "scss", label: "SCSS", fn: toScss, requiresAccount: true },
  { key: "json", label: "JSON", fn: toJson, requiresAccount: true },
  { key: "tailwind", label: "Tailwind", fn: toTailwindConfig, requiresAccount: true },
  { key: "hex", label: "Hex list", fn: toHexList, requiresAccount: true },
];
