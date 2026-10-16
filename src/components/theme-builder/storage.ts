/**
 * localStorage persistence for the theme builder.
 *
 * Two buckets, mirroring the awansoft draft/active split:
 * - `draft`  — work in progress; restored when the builder re-opens.
 * - `active` — the last theme promoted with "Apply"; re-applied to `:root`
 *   on startup by `activation.ts`.
 *
 * All access is try/catch guarded so private-mode storage denials never throw.
 */

import type { ThemeDraft, ThemeTokens } from './types';
import { createDefaultDraft } from './default-theme';

const DRAFT_KEY = 'wp-exam.theme-builder.draft.v1';
const ACTIVE_KEY = 'wp-exam.theme-builder.active.v1';

function readJson(key: string): unknown | null {

  try {
    const raw = window.localStorage.getItem(key);

    if (!raw) {

      return null;
    }

    return JSON.parse(raw) as unknown;
  } catch {

    return null;
  }
}

function writeJson(key: string, value: unknown): boolean {

  try {
    window.localStorage.setItem(key, JSON.stringify(value));

    return true;
  } catch {

    return false;
  }
}

function isThemeDraft(value: unknown): value is ThemeDraft {

  if (typeof value !== 'object' || value === null) {

    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    candidate['version'] === 1 &&
    typeof candidate['tokens'] === 'object' &&
    candidate['tokens'] !== null
  );
}

export function loadDraft(): ThemeDraft {
  const stored = readJson(DRAFT_KEY);

  if (isThemeDraft(stored)) {

    return stored;
  }

  return createDefaultDraft();
}

export function saveDraft(draft: ThemeDraft): boolean {
  const stamped: ThemeDraft = {
    ...draft,
    updatedAt: new Date().toISOString(),
  };

  return writeJson(DRAFT_KEY, stamped);
}

export function clearDraft(): void {

  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    // Private mode — nothing to clear.
  }
}

export function loadActiveTheme(): ThemeTokens | null {
  const stored = readJson(ACTIVE_KEY);

  if (isThemeDraft(stored)) {

    return stored.tokens;
  }

  return null;
}

export function saveActiveTheme(tokens: ThemeTokens): boolean {
  const record: ThemeDraft = {
    version: 1,
    name: 'active-theme',
    updatedAt: new Date().toISOString(),
    tokens,
  };

  return writeJson(ACTIVE_KEY, record);
}

export function clearActiveTheme(): void {

  try {
    window.localStorage.removeItem(ACTIVE_KEY);
  } catch {
    // Private mode — nothing to clear.
  }
}
