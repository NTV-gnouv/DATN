import type { CSSProperties } from 'react';

import {
  DEFAULT_AVATAR_WIDTH_PERCENT,
  normalizeAvatarWidthPercent,
  resolveAvatarPixelSize,
} from '@/utils/avatar-size';
import {
  normalizeDisplayNameSizePercent,
  resolveDisplayNameFontSize,
} from '@/utils/display-name-size';

export const MOBILE_REFERENCE_WIDTH = 375;
export const PHONE_PREVIEW_WIDTH = 263;

export type ThemePreviewCanvasMode = 'phone-frame' | 'public-page';

export type ThemePreviewMetricsInput = {
  viewportWidth?: number;
  canvasMode?: ThemePreviewCanvasMode;
  typographyFontSize?: number;
  typographyHeadingSize?: number;
  themeReviewFontSize?: number;
  divWidthPercent?: number;
  avatarSize?: number;
  displayNameSize?: number;
  socialIconSize?: number;
};

export type ThemePreviewMetrics = {
  frameScale: number;
  reviewFontSize: number;
  titleFontSize: number;
  bioFontSize: number;
  cardTitleFontSize: number;
  socialLabelFontSize: number;
  avatarWidthPercent: number;
  avatarSize: number;
  displayNameSizePercent: number;
  divWidth: number;
  cssVars: CSSProperties;
};

export function resolveThemePreviewMetrics(input: ThemePreviewMetricsInput): ThemePreviewMetrics {
  const canvasMode = input.canvasMode ?? 'phone-frame';
  const viewportWidth =
    input.viewportWidth ?? (canvasMode === 'public-page' ? MOBILE_REFERENCE_WIDTH : PHONE_PREVIEW_WIDTH);

  const frameScale =
    canvasMode === 'phone-frame'
      ? Math.min(1, Math.max(0.72, viewportWidth / MOBILE_REFERENCE_WIDTH))
      : Math.min(1.08, Math.max(0.88, viewportWidth / MOBILE_REFERENCE_WIDTH));

  const baseBody =
    input.themeReviewFontSize && input.themeReviewFontSize > 0
      ? input.themeReviewFontSize
      : Math.max(12, input.typographyFontSize ?? 14);

  const baseHeading =
    input.typographyHeadingSize && input.typographyHeadingSize > 0
      ? input.typographyHeadingSize
      : Math.round(baseBody * 2.05);

  const reviewFontSize = Math.round(Math.max(12, baseBody * frameScale));
  const baseTitleFontSize = Math.round(Math.max(20, baseHeading * frameScale));
  const displayNameSizePercent = normalizeDisplayNameSizePercent(input.displayNameSize);
  const titleFontSize = resolveDisplayNameFontSize(baseTitleFontSize, displayNameSizePercent);
  const bioFontSize = Math.round(Math.max(12, baseBody * 0.94 * frameScale));
  const cardTitleFontSize = Math.round(Math.max(14, baseBody * 1.12 * frameScale));
  const socialLabelFontSize = Math.max(
    11,
    Math.round((input.socialIconSize ?? 24) * 0.55 * frameScale),
  );

  const avatarWidthPercent = normalizeAvatarWidthPercent(input.avatarSize ?? DEFAULT_AVATAR_WIDTH_PERCENT);
  const avatarSize = resolveAvatarPixelSize(viewportWidth, avatarWidthPercent);

  const gap = Math.round(12 * frameScale);
  const paddingX = Math.round(Math.max(10, viewportWidth * 0.045));
  const paddingY = Math.round(Math.max(14, viewportWidth * 0.05));
  const cardPaddingY = Math.round(Math.max(8, 10 * frameScale));
  const cardPaddingX = Math.round(Math.max(10, 12 * frameScale));

  return {
    frameScale,
    reviewFontSize,
    titleFontSize,
    bioFontSize,
    cardTitleFontSize,
    socialLabelFontSize,
    avatarWidthPercent,
    avatarSize,
    displayNameSizePercent,
    divWidth: input.divWidthPercent ?? 100,
    cssVars: {
      ['--block-shell-width' as string]: `${input.divWidthPercent ?? 100}%`,
      ['--profile-avatar-width-percent' as string]: `${avatarWidthPercent}%`,
      ['--theme-preview-gap' as string]: `${gap}px`,
      ['--theme-preview-padding-x' as string]: `${paddingX}px`,
      ['--theme-preview-padding-y' as string]: `${paddingY}px`,
      ['--theme-title-size' as string]: `${titleFontSize}px`,
      ['--theme-bio-size' as string]: `${bioFontSize}px`,
      ['--theme-body-size' as string]: `${reviewFontSize}px`,
      ['--theme-card-title-size' as string]: `${cardTitleFontSize}px`,
      ['--theme-card-padding-y' as string]: `${cardPaddingY}px`,
      ['--theme-card-padding-x' as string]: `${cardPaddingX}px`,
      ['--theme-card-gap' as string]: `${Math.round(8 * frameScale)}px`,
      ['--theme-social-gap' as string]: `${Math.round(6 * frameScale)}px`,
    },
  };
}
