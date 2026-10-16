/**
 * Hex <-> HSL-triplet conversion.
 *
 * The repo design system stores color tokens as HSL triplets
 * (e.g. `--primary: 222.2 47.4% 11.2%`) and consumes them through
 * `hsl(var(--primary))`. The builder keeps tokens as hex (friendly to color
 * pickers and JSON export) and converts to triplets when painting CSS
 * variables.
 */

function clampByte(value: number): number {

  if (value < 0) {

    return 0;
  }

  if (value > 255) {

    return 255;
  }

  return value;
}

export function normalizeHex(raw: string): string | null {
  const trimmed = raw.trim().toLowerCase();

  const short = /^#([0-9a-f]{3})$/.exec(trimmed);

  if (short) {
    const digits = short[1];

    return `#${digits[0]}${digits[0]}${digits[1]}${digits[1]}${digits[2]}${digits[2]}`;
  }

  const full = /^#([0-9a-f]{6})$/.exec(trimmed);

  if (full) {

    return trimmed;
  }

  return null;
}

export function hexToHslTriplet(hex: string): string {
  const normalized = normalizeHex(hex) ?? '#000000';
  const r = parseInt(normalized.slice(1, 3), 16) / 255;
  const g = parseInt(normalized.slice(3, 5), 16) / 255;
  const b = parseInt(normalized.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2;

  if (max === min) {

    return `0 0% ${(lightness * 100).toFixed(1)}%`;
  }

  const delta = max - min;
  const saturation = lightness > 0.5
    ? delta / (2 - max - min)
    : delta / (max + min);

  let hue = 0;

  if (max === r) {

    hue = ((g - b) / delta + (g < b ? 6 : 0)) * 60;
  } else if (max === g) {

    hue = ((b - r) / delta + 2) * 60;
  } else {

    hue = ((r - g) / delta + 4) * 60;
  }

  return `${hue.toFixed(1)} ${(saturation * 100).toFixed(1)}% ${(lightness * 100).toFixed(1)}%`;
}

export function hslTripletToHex(triplet: string): string {
  const parts = triplet.trim().split(/\s+/);

  if (parts.length !== 3) {

    return '#000000';
  }

  const h = parseFloat(parts[0]) / 360;
  const s = parseFloat(parts[1]) / 100;
  const l = parseFloat(parts[2]) / 100;

  if (Number.isNaN(h) || Number.isNaN(s) || Number.isNaN(l)) {

    return '#000000';
  }

  if (s === 0) {
    const gray = Math.round(l * 255);

    return rgbToHex(gray, gray, gray);
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  const r = hueToRgb(p, q, h + 1 / 3);
  const g = hueToRgb(p, q, h);
  const b = hueToRgb(p, q, h - 1 / 3);

  return rgbToHex(
    clampByte(Math.round(r * 255)),
    clampByte(Math.round(g * 255)),
    clampByte(Math.round(b * 255)),
  );
}

function hueToRgb(p: number, q: number, t: number): number {
  let tt = t;

  if (tt < 0) {

    tt += 1;
  }

  if (tt > 1) {

    tt -= 1;
  }

  if (tt < 1 / 6) {

    return p + (q - p) * 6 * tt;
  }

  if (tt < 1 / 2) {

    return q;
  }

  if (tt < 2 / 3) {

    return p + (q - p) * (2 / 3 - tt) * 6;
  }

  return p;
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0');

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
