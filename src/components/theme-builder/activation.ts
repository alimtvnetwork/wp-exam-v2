/**
 * Activation: re-applies the last "Apply"-ed theme when the builder mounts.
 *
 * Analogous to the awansoft builder activation check — only this module's
 * entry is imported by the app surface, and it applies the persisted active
 * theme to `:root` exactly once per mount so returning admins see the theme
 * they promoted.
 */

import { loadActiveTheme } from './storage';
import { activateTheme } from './theme-engine';

let hasActivated = false;

export function applyPersistedActiveTheme(): void {

  if (hasActivated) {

    return;
  }

  hasActivated = true;

  const tokens = loadActiveTheme();

  if (!tokens) {

    return;
  }

  activateTheme(tokens);
}
