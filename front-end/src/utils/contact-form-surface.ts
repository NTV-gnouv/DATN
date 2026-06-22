import type { CSSProperties } from 'react';

import { getCardTitleStyle, type ResolvedPageTypography } from '@/utils/fonts';

export function buildContactFormSurfaceStyle(options: {
  divWidth: number;
  contentBg: string;
  border: { width: number; style: string; color: string; radius: number };
  shadow: { enabled: boolean; x: number; y: number; blur: number; spread: number; color: string };
  extra?: CSSProperties;
}): CSSProperties {
  const { divWidth, contentBg, border, shadow, extra } = options;
  return {
    width: `${divWidth}%`,
    marginInline: 'auto',
    background: contentBg,
    border: `${border.width}px ${border.style} ${border.color}`,
    borderRadius: `${border.radius}px`,
    boxShadow: shadow.enabled
      ? `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}`
      : 'none',
    ...extra,
  };
}

export function buildContactFormPreviewStyles(options: {
  divWidth: number;
  contentBg: string;
  contentText: string;
  border: { width: number; style: string; color: string; radius: number };
  shadow: { enabled: boolean; x: number; y: number; blur: number; spread: number; color: string };
  typography: ResolvedPageTypography;
  reviewFontSize: number;
  cardTitleFontSize: number;
  cardSurfaceStyle?: CSSProperties;
}): { surfaceStyle: CSSProperties; titleStyle: CSSProperties } {
  const { typography, reviewFontSize, cardTitleFontSize, contentText, cardSurfaceStyle } = options;

  return {
    surfaceStyle: buildContactFormSurfaceStyle({
      divWidth: options.divWidth,
      contentBg: options.contentBg,
      border: options.border,
      shadow: options.shadow,
      extra: {
        color: contentText,
        fontFamily: typography.bodyFontStack,
        fontSize: `${reviewFontSize}px`,
        fontWeight: typography.bodyWeight,
        lineHeight: typography.lineHeight,
        ...(cardSurfaceStyle ?? {}),
      },
    }),
    titleStyle: getCardTitleStyle(typography, cardTitleFontSize, contentText),
  };
}
