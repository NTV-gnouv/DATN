export const SOCIAL_ICON_SIZE_MIN = 20;
export const SOCIAL_ICON_SIZE_MAX = 50;

export function clampSocialIconSize(value: unknown, fallback = 24): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.max(SOCIAL_ICON_SIZE_MIN, Math.min(SOCIAL_ICON_SIZE_MAX, Math.round(parsed)));
}
