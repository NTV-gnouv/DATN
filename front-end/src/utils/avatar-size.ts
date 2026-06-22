const LEGACY_AVATAR_REFERENCE_WIDTH = 375;

export const DEFAULT_AVATAR_WIDTH_PERCENT = 32;
export const MIN_AVATAR_WIDTH_PERCENT = 18;
export const MAX_AVATAR_WIDTH_PERCENT = 72;

/** Stored value is width % of the preview container. Legacy pages may still store pixels (>100). */
export function normalizeAvatarWidthPercent(stored?: number | null): number {
  if (stored == null || Number.isNaN(stored)) {
    return DEFAULT_AVATAR_WIDTH_PERCENT;
  }

  if (stored > 100) {
    return clampAvatarWidthPercent(Math.round((stored / LEGACY_AVATAR_REFERENCE_WIDTH) * 100));
  }

  return clampAvatarWidthPercent(Math.round(stored));
}

export function clampAvatarWidthPercent(value: number): number {
  return Math.min(MAX_AVATAR_WIDTH_PERCENT, Math.max(MIN_AVATAR_WIDTH_PERCENT, value));
}

export function resolveAvatarPixelSize(containerWidth: number, stored?: number | null): number {
  const percent = normalizeAvatarWidthPercent(stored);
  return Math.max(48, Math.round(containerWidth * (percent / 100)));
}
