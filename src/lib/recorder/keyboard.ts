/**
 * Keyboard key helpers for the bug recorder UI.
 *
 * Semantics verified against cat-my-v12's KeyboardKeyType source of truth
 * (Space = " ", Enter = "Enter", Escape = "Escape", ArrowUp/ArrowDown).
 */
export function isEscape(key: string | null | undefined): boolean {
  return key === "Escape";
}

export function isEnterOrSpace(key: string | null | undefined): boolean {
  return key === "Enter" || key === " ";
}

export function isArrowDown(key: string | null | undefined): boolean {
  return key === "ArrowDown";
}

export function isArrowUp(key: string | null | undefined): boolean {
  return key === "ArrowUp";
}
