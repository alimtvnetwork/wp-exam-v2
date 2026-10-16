/**
 * Theme-builder token model.
 *
 * Semantics modeled on the awansoft-v10 builder (`src/builder/`):
 * - Edits land in a *draft* (in-memory + localStorage) and render live in the
 *   preview canvas through CSS variables — the app itself is untouched.
 * - `Apply` promotes the draft to the *active* theme: CSS variables are written
 *   to `:root` (plus a `data-theme` marker) and persisted, so the theme
 *   survives reloads (see `activation.ts`).
 * - `Reset` restores the built-in defaults; `Export` downloads the draft JSON.
 * - Per-area editors (colors, radius, fonts, spacing) are the analogue of the
 *   awansoft text/image/menu/icon per-area editors.
 */

export type ThemeBuilderArea = 'colors' | 'radius' | 'fonts' | 'spacing';

export type SaveStatus = 'clean' | 'dirty' | 'saving' | 'saved' | 'error';

export interface ThemeColors {
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  input: string;
  ring: string;
  destructive: string;
  destructiveForeground: string;
}

export interface ThemeFonts {
  /** Font family used for h1-h6 inside themed surfaces. */
  heading: string;
  /** Font family used for body copy inside themed surfaces. */
  body: string;
}

export interface ThemeSpacing {
  /** Card content padding, px. */
  cardPadding: number;
  /** Gap between sibling components, px. */
  gap: number;
  /** Gap between sections, px. */
  sectionGap: number;
}

export interface ThemeTokens {
  /** All colors stored as lowercase hex, e.g. "#5c45fd". */
  colors: ThemeColors;
  /** Base radius in rem; shadcn sm/md/lg derive from it. */
  radius: number;
  fonts: ThemeFonts;
  spacing: ThemeSpacing;
}

export interface ThemeDraft {
  version: 1;
  name: string;
  updatedAt: string;
  tokens: ThemeTokens;
}

export interface ColorTokenMeta {
  id: keyof ThemeColors;
  label: string;
  hint: string;
}

export const COLOR_TOKENS: ColorTokenMeta[] = [
  { id: 'primary', label: 'Primary', hint: 'Buttons, active accents' },
  { id: 'primaryForeground', label: 'Primary text', hint: 'Text on primary surfaces' },
  { id: 'secondary', label: 'Secondary', hint: 'Secondary buttons, chips' },
  { id: 'secondaryForeground', label: 'Secondary text', hint: 'Text on secondary surfaces' },
  { id: 'accent', label: 'Accent', hint: 'Hover tints, highlights' },
  { id: 'accentForeground', label: 'Accent text', hint: 'Text on accent surfaces' },
  { id: 'background', label: 'Background', hint: 'Page canvas' },
  { id: 'foreground', label: 'Foreground', hint: 'Default text color' },
  { id: 'card', label: 'Card', hint: 'Card surfaces' },
  { id: 'cardForeground', label: 'Card text', hint: 'Text on cards' },
  { id: 'popover', label: 'Popover', hint: 'Dropdowns, tooltips' },
  { id: 'popoverForeground', label: 'Popover text', hint: 'Text on popovers' },
  { id: 'muted', label: 'Muted', hint: 'Subtle backgrounds' },
  { id: 'mutedForeground', label: 'Muted text', hint: 'Secondary copy' },
  { id: 'border', label: 'Border', hint: 'Dividers, outlines' },
  { id: 'input', label: 'Input border', hint: 'Form field borders' },
  { id: 'ring', label: 'Focus ring', hint: 'Keyboard focus outline' },
  { id: 'destructive', label: 'Destructive', hint: 'Delete, danger actions' },
  { id: 'destructiveForeground', label: 'Destructive text', hint: 'Text on danger surfaces' },
];

export const FONT_CHOICES: { value: string; label: string }[] = [
  { value: 'Ubuntu, sans-serif', label: 'Ubuntu' },
  { value: 'Inter, sans-serif', label: 'Inter' },
  { value: 'Poppins, sans-serif', label: 'Poppins' },
  { value: 'Roboto, sans-serif', label: 'Roboto' },
  { value: 'system-ui, sans-serif', label: 'System UI' },
];
