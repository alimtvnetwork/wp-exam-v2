/**
 * Public surface of the theme-builder module.
 *
 * - `ThemeBuilder` renders the full builder (preview canvas + inspector) and
 *   is mounted behind the admin sidebar's "Theme Builder" tab.
 * - `applyPersistedActiveTheme` re-applies the last Apply-ed theme; the
 *   builder calls it on mount, and the app shell may call it once at startup.
 */

export { ThemeBuilder } from './theme-builder';
export { applyPersistedActiveTheme } from './activation';
export { activateTheme, deactivateTheme, hasActiveCustomTheme, paintTokens } from './theme-engine';
export type {
  ThemeBuilderArea,
  ThemeColors,
  ThemeDraft,
  ThemeFonts,
  ThemeSpacing,
  ThemeTokens,
  SaveStatus,
} from './types';
