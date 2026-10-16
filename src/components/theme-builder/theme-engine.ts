/**
 * CSS-variable engine for the theme builder.
 *
 * Two scopes, matching the draft/apply split:
 * - `paintTokens(element, tokens)` writes variables onto any element. The
 *   preview canvas calls this on its own container, so draft edits render
 *   live inside the preview without touching the rest of the app.
 * - `activateTheme(tokens)` paints the tokens onto `document.documentElement`
 *   (`:root`) and tags it with `data-theme="custom"`, so the whole app adopts
 *   the theme.
 * - `deactivateTheme()` removes every managed variable (and the marker),
 *   restoring the stylesheet defaults — the "Reset" path.
 */

import type { ThemeColors, ThemeTokens } from './types';
import { hexToHslTriplet } from './color-utils';

export const ACTIVE_THEME_MARKER = 'custom';
export const THEME_DATA_ATTRIBUTE = 'data-theme';

const COLOR_VAR_BY_TOKEN: Record<keyof ThemeColors, string> = {
  primary: '--primary',
  primaryForeground: '--primary-foreground',
  secondary: '--secondary',
  secondaryForeground: '--secondary-foreground',
  accent: '--accent',
  accentForeground: '--accent-foreground',
  background: '--background',
  foreground: '--foreground',
  card: '--card',
  cardForeground: '--card-foreground',
  popover: '--popover',
  popoverForeground: '--popover-foreground',
  muted: '--muted',
  mutedForeground: '--muted-foreground',
  border: '--border',
  input: '--input',
  ring: '--ring',
  destructive: '--destructive',
  destructiveForeground: '--destructive-foreground',
};

const MANAGED_VARS: string[] = [
  ...Object.values(COLOR_VAR_BY_TOKEN),
  '--radius',
  '--font-heading',
  '--font-body',
  '--tb-card-padding',
  '--tb-gap',
  '--tb-section-gap',
];

/** Paints a token set as CSS variables onto the given element. */
export function paintTokens(element: HTMLElement, tokens: ThemeTokens): void {
  const style = element.style;

  (Object.keys(COLOR_VAR_BY_TOKEN) as (keyof ThemeColors)[]).forEach((tokenId) => {
    style.setProperty(COLOR_VAR_BY_TOKEN[tokenId], hexToHslTriplet(tokens.colors[tokenId]));
  });

  style.setProperty('--radius', `${tokens.radius}rem`);
  style.setProperty('--font-heading', tokens.fonts.heading);
  style.setProperty('--font-body', tokens.fonts.body);
  style.setProperty('--tb-card-padding', `${tokens.spacing.cardPadding}px`);
  style.setProperty('--tb-gap', `${tokens.spacing.gap}px`);
  style.setProperty('--tb-section-gap', `${tokens.spacing.sectionGap}px`);
}

/** Promotes a token set to the active app-wide theme (`:root`). */
export function activateTheme(tokens: ThemeTokens): void {
  paintTokens(document.documentElement, tokens);
  document.documentElement.setAttribute(THEME_DATA_ATTRIBUTE, ACTIVE_THEME_MARKER);
}

/** Removes the active custom theme, restoring stylesheet defaults. */
export function deactivateTheme(): void {
  const style = document.documentElement.style;

  MANAGED_VARS.forEach((name) => {
    style.removeProperty(name);
  });

  document.documentElement.removeAttribute(THEME_DATA_ATTRIBUTE);
}

/** Reports whether a custom theme is currently active app-wide. */
export function hasActiveCustomTheme(): boolean {

  return document.documentElement.getAttribute(THEME_DATA_ATTRIBUTE) === ACTIVE_THEME_MARKER;
}
