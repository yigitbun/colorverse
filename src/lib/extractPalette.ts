import { relativeLuminance } from "@/lib/color";
import type { Palette, PaletteColors } from "@/data/palettes";

const MAX_SAMPLE_DIMENSION = 120;
const CLUSTER_COUNT = 5;
const KMEANS_ITERATIONS = 14;

type Rgb = [number, number, number];

export async function extractPaletteFromImage(file: File): Promise<Palette> {
  const image = await loadImage(file);
  const pixels = samplePixels(image);
  if (pixels.length === 0) {
    throw new Error("Could not read any pixels from this image.");
  }
  const clusters = kMeans(pixels, CLUSTER_COUNT, KMEANS_ITERATIONS);
  const colors = assignRoles(clusters);
  const swatches = [
    colors.bg,
    colors.surface,
    colors.primary,
    colors.accent,
    colors.text,
  ];
  return {
    id: "extracted",
    name: "Your extracted palette",
    description:
      "Pulled from the image you uploaded — five hex codes that capture its mood.",
    colors,
    swatches,
    image: "",
    imageCredit: "",
  };
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Image failed to load."));
      image.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Could not read the file."));
    reader.readAsDataURL(file);
  });
}

function samplePixels(image: HTMLImageElement): Rgb[] {
  const scale = Math.min(
    1,
    MAX_SAMPLE_DIMENSION / Math.max(image.width, image.height),
  );
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];
  ctx.drawImage(image, 0, 0, width, height);
  const data = ctx.getImageData(0, 0, width, height).data;
  const pixels: Rgb[] = [];
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 200) continue;
    pixels.push([data[i], data[i + 1], data[i + 2]]);
  }
  return pixels;
}

function squaredDistance(a: Rgb, b: Rgb): number {
  const dr = a[0] - b[0];
  const dg = a[1] - b[1];
  const db = a[2] - b[2];
  return dr * dr + dg * dg + db * db;
}

/** K-means++ initialization followed by Lloyd's-algorithm iterations. */
function kMeans(pixels: Rgb[], k: number, iterations: number): Rgb[] {
  if (pixels.length <= k) return pixels.slice();

  const centroids: Rgb[] = [pixels[Math.floor(Math.random() * pixels.length)]];
  while (centroids.length < k) {
    const distances = pixels.map((pixel) => {
      let minDist = Infinity;
      for (const centroid of centroids) {
        const d = squaredDistance(pixel, centroid);
        if (d < minDist) minDist = d;
      }
      return minDist;
    });
    const total = distances.reduce((sum, d) => sum + d, 0);
    if (total === 0) break;
    let threshold = Math.random() * total;
    let chosenIndex = 0;
    for (let i = 0; i < distances.length; i++) {
      threshold -= distances[i];
      if (threshold <= 0) {
        chosenIndex = i;
        break;
      }
    }
    centroids.push(pixels[chosenIndex]);
  }

  for (let iter = 0; iter < iterations; iter++) {
    const sums = Array.from({ length: centroids.length }, () => [0, 0, 0, 0]);
    for (const pixel of pixels) {
      let closest = 0;
      let minDist = Infinity;
      for (let c = 0; c < centroids.length; c++) {
        const d = squaredDistance(pixel, centroids[c]);
        if (d < minDist) {
          minDist = d;
          closest = c;
        }
      }
      sums[closest][0] += pixel[0];
      sums[closest][1] += pixel[1];
      sums[closest][2] += pixel[2];
      sums[closest][3] += 1;
    }
    let movement = 0;
    for (let c = 0; c < centroids.length; c++) {
      if (sums[c][3] === 0) continue;
      const next: Rgb = [
        Math.round(sums[c][0] / sums[c][3]),
        Math.round(sums[c][1] / sums[c][3]),
        Math.round(sums[c][2] / sums[c][3]),
      ];
      movement += squaredDistance(next, centroids[c]);
      centroids[c] = next;
    }
    if (movement < 1) break;
  }

  return centroids;
}

function rgbToHex([r, g, b]: Rgb): string {
  return (
    "#" +
    [r, g, b]
      .map((c) => Math.max(0, Math.min(255, c)).toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

function saturation([r, g, b]: Rgb): number {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max === 0 ? 0 : (max - min) / max;
}

function padToCount(clusters: Rgb[], target: number): Rgb[] {
  const result = clusters.slice();
  let i = 0;
  while (result.length < target) {
    const base = result[i % clusters.length];
    const offset = result.length < target - 1 ? -40 : 40;
    result.push([
      Math.max(0, Math.min(255, base[0] + offset)),
      Math.max(0, Math.min(255, base[1] + offset)),
      Math.max(0, Math.min(255, base[2] + offset)),
    ]);
    i++;
  }
  return result;
}

/** Sorts clusters by luminance and slots them into the 5-role token model. */
function assignRoles(clusters: Rgb[]): PaletteColors {
  const ranked = (clusters.length >= 5 ? clusters.slice(0, 5) : padToCount(clusters, 5))
    .map((rgb) => ({ rgb, hex: rgbToHex(rgb), lum: 0, sat: saturation(rgb) }))
    .map((c) => ({ ...c, lum: relativeLuminance(c.hex) }))
    .sort((a, b) => a.lum - b.lum);

  const darkest = ranked[0];
  const secondLightest = ranked[ranked.length - 2];
  const lightest = ranked[ranked.length - 1];
  const middle = ranked
    .filter((c) => c !== darkest && c !== secondLightest && c !== lightest)
    .sort((a, b) => b.sat - a.sat);
  const [primary, accent] = middle;

  return {
    bg: lightest.hex,
    surface: secondLightest.hex,
    primary: primary.hex,
    accent: accent.hex,
    text: darkest.hex,
  };
}
