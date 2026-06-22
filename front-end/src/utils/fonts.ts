import type { CSSProperties } from 'react';

import { getFontPairing } from '@/config/font-catalog';
import type { HeaderBlockFields } from '@/models/editor.model';

const SERIF_FONTS = new Set([
  'Playfair Display',
  'Cormorant Garamond',
  'Libre Baskerville',
  'Lora',
  'Merriweather',
  'Abril Fatface',
]);

export type ResolvedPageTypography = {
  fontPairingId: string;
  displayFont: string;
  bodyFont: string;
  displayFontStack: string;
  bodyFontStack: string;
  headingSize: number;
  bodySize: number;
  headingWeight: number;
  bodyWeight: number;
  headingLetterSpacing: string;
  headingTransform: 'none' | 'uppercase';
  lineHeight: number;
  cardTitleSize: number;
  googleFontFamilies: string[];
};

function extractPrimaryFontName(value: string): string {
  const first = value.split(',')[0]?.trim().replace(/^['"]|['"]$/g, '') ?? '';
  return first || 'Inter';
}

function buildFontStack(fontName: string): string {
  const fallback = SERIF_FONTS.has(fontName) ? 'Georgia, serif' : 'system-ui, sans-serif';
  return `'${fontName}', ${fallback}`;
}

function readTypographyRecord(fields: HeaderBlockFields | null | undefined) {
  return (fields?.typography ?? {}) as Record<string, unknown>;
}

export function resolvePageTypography(
  fields: HeaderBlockFields | null | undefined,
  themeTokens?: Record<string, unknown> | null,
): ResolvedPageTypography {
  const typography = readTypographyRecord(fields);
  const tokenTypography =
    themeTokens?.typography && typeof themeTokens.typography === 'object'
      ? (themeTokens.typography as Record<string, unknown>)
      : null;

  const pairingId = String(typography.fontPairingId ?? themeTokens?.fontPairingId ?? '').trim();
  const pairing = getFontPairing(pairingId || 'modern-inter');

  const displayFont = String(typography.displayFontFamily ?? pairing.displayFont);
  const bodyFont = String(typography.bodyFontFamily ?? typography.fontFamily ?? pairing.bodyFont);
  const legacyFont = extractPrimaryFontName(String(typography.fontFamily ?? ''));

  const resolvedDisplay = displayFont || legacyFont || pairing.displayFont;
  const resolvedBody = bodyFont || legacyFont || pairing.bodyFont;

  const headingSize = Number(typography.headingSize ?? tokenTypography?.headingSize ?? pairing.headingSize) || pairing.headingSize;
  const bodySize = Number(typography.fontSize ?? tokenTypography?.bodySize ?? pairing.bodySize) || pairing.bodySize;
  const headingWeight = Number(typography.headingWeight ?? tokenTypography?.headingWeight ?? pairing.headingWeight) || pairing.headingWeight;
  const bodyWeight = Number(typography.fontWeight ?? tokenTypography?.bodyWeight ?? pairing.bodyWeight) || pairing.bodyWeight;
  const lineHeight = Number(typography.lineHeight ?? tokenTypography?.lineHeight ?? pairing.lineHeight) || pairing.lineHeight;
  const headingLetterSpacingEm = Number(typography.headingLetterSpacing ?? pairing.headingLetterSpacing) || 0;
  const headingTransform = (typography.headingTransform as 'none' | 'uppercase' | undefined) ?? pairing.headingTransform;

  return {
    fontPairingId: pairing.id,
    displayFont: resolvedDisplay,
    bodyFont: resolvedBody,
    displayFontStack: buildFontStack(resolvedDisplay),
    bodyFontStack: buildFontStack(resolvedBody),
    headingSize,
    bodySize,
    headingWeight,
    bodyWeight,
    headingLetterSpacing: `${headingLetterSpacingEm}em`,
    headingTransform,
    lineHeight,
    cardTitleSize: Math.round(bodySize * 1.12),
    googleFontFamilies: [...new Set([resolvedDisplay, resolvedBody])],
  };
}

export function buildGoogleFontsHref(families: string[]): string {
  const unique = [...new Set(families.map((item) => item.trim()).filter(Boolean))];
  if (!unique.length) {
    return '';
  }

  const params = unique
    .map((family) => {
      const encoded = encodeURIComponent(family).replace(/%20/g, '+');
      return `family=${encoded}:wght@400;500;600;700;800`;
    })
    .join('&');

  return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}

export function getHeadingStyle(typography: ResolvedPageTypography, titleFontSize: number, color: string): CSSProperties {
  return {
    color,
    fontFamily: typography.displayFontStack,
    fontSize: `${titleFontSize}px`,
    fontWeight: typography.headingWeight,
    letterSpacing: typography.headingLetterSpacing,
    textTransform: typography.headingTransform,
    lineHeight: 1.15,
    margin: 0,
  };
}

export function getBodyStyle(typography: ResolvedPageTypography, fontSize: number, color: string): CSSProperties {
  return {
    color,
    fontFamily: typography.bodyFontStack,
    fontSize: `${fontSize}px`,
    fontWeight: typography.bodyWeight,
    lineHeight: typography.lineHeight,
    margin: 0,
  };
}

export function getCardTitleStyle(typography: ResolvedPageTypography, fontSize: number, color: string): CSSProperties {
  return {
    color,
    fontFamily: typography.displayFontStack,
    fontSize: `${fontSize}px`,
    fontWeight: Math.max(typography.headingWeight, 600),
    lineHeight: 1.25,
    margin: 0,
  };
}
