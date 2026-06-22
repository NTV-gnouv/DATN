import type { CSSProperties } from 'react';

import type { HeaderBlockFields } from '@/models/editor.model';

export type SocialBlockStyleInput = {
  background: string;
  color: string;
  widthPercent: number;
  border: HeaderBlockFields['divLayout']['border'];
  shadow: HeaderBlockFields['divLayout']['boxShadow'];
  cardSurfaceStyle?: CSSProperties;
  bodyFontStack?: string;
  labelFontSize?: number;
  labelFontWeight?: number;
};

export function buildSocialButtonsShellStyle(_input?: Pick<SocialBlockStyleInput, 'widthPercent'>): CSSProperties {
  return {
    width: 'var(--block-shell-width, 100%)',
    marginInline: 'auto',
  };
}

export function buildSocialButtonSurfaceStyle(
  input: Pick<SocialBlockStyleInput, 'background' | 'color' | 'border' | 'shadow' | 'cardSurfaceStyle'>,
): CSSProperties {
  const { background, color, border, shadow, cardSurfaceStyle } = input;

  return {
    background,
    color,
    border: border.width > 0 ? `${border.width}px ${border.style} ${border.color}` : '0',
    borderRadius: `${border.radius}px`,
    boxShadow: shadow.enabled
      ? `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}`
      : 'none',
    ...(cardSurfaceStyle ?? {}),
  };
}

export function buildSocialButtonLabelStyle(
  input: Pick<SocialBlockStyleInput, 'bodyFontStack' | 'labelFontSize' | 'labelFontWeight' | 'color'>,
): CSSProperties {
  return {
    color: input.color,
    fontFamily: input.bodyFontStack,
    fontSize: input.labelFontSize ? `${input.labelFontSize}px` : undefined,
    fontWeight: input.labelFontWeight ?? 700,
    lineHeight: 1.2,
  };
}

export function buildSocialBlockStyleFromHeader(
  fields: HeaderBlockFields | null | undefined,
  options?: {
    cardSurfaceStyle?: CSSProperties;
    bodyFontStack?: string;
    labelFontSize?: number;
    labelFontWeight?: number;
  },
): SocialBlockStyleInput {
  const border = fields?.divLayout.border ?? { width: 1, style: 'solid' as const, color: '#cccccc', radius: 12 };
  const shadow = fields?.divLayout.boxShadow ?? {
    enabled: false,
    x: 0,
    y: 6,
    blur: 18,
    spread: 0,
    color: 'rgba(0, 0, 0, 0.18)',
  };

  return {
    background: fields?.colors.socialBlockBackground ?? '#111111',
    color: fields?.colors.socialBlockText ?? '#ffffff',
    widthPercent: fields?.divLayout.widthPercent ?? 100,
    border,
    shadow,
    cardSurfaceStyle: options?.cardSurfaceStyle,
    bodyFontStack: options?.bodyFontStack,
    labelFontSize: options?.labelFontSize,
    labelFontWeight: options?.labelFontWeight,
  };
}
