export const DEFAULT_DISPLAY_NAME_SIZE_PERCENT = 100;
export const MIN_DISPLAY_NAME_SIZE_PERCENT = 10;
export const MAX_DISPLAY_NAME_SIZE_PERCENT = 100;

/** Stored value is scale % relative to the theme heading size. */
export function normalizeDisplayNameSizePercent(stored?: number | null): number {
  if (stored == null || Number.isNaN(stored)) {
    return DEFAULT_DISPLAY_NAME_SIZE_PERCENT;
  }

  return clampDisplayNameSizePercent(Math.round(stored));
}

export function clampDisplayNameSizePercent(value: number): number {
  return Math.min(MAX_DISPLAY_NAME_SIZE_PERCENT, Math.max(MIN_DISPLAY_NAME_SIZE_PERCENT, value));
}

export function resolveDisplayNameFontSize(baseTitleFontSize: number, stored?: number | null): number {
  const scale = normalizeDisplayNameSizePercent(stored) / 100;
  return Math.max(10, Math.round(baseTitleFontSize * scale));
}
