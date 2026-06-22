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

const CURSIVE_FONTS = new Set([
  'Delius Swash Caps',
  'Delicious Handrawn',
  'Pacifico',
  'Caveat',
  'Permanent Marker',
]);

const MONO_FONTS = new Set(['Silkscreen', 'IBM Plex Mono']);

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
  if (SERIF_FONTS.has(fontName)) {
    return `'${fontName}', Georgia, serif`;
  }
  if (CURSIVE_FONTS.has(fontName)) {
    return `'${fontName}', cursive`;
  }
  if (MONO_FONTS.has(fontName)) {
    return `'${fontName}', 'IBM Plex Mono', monospace`;
  }
  const fallback = 'system-ui, sans-serif';
  return `'${fontName}', ${fallback}`;
}

function readTypographyRecord(fields: HeaderBlockFields | null | undefined) {
  return (fields?.typography ?? {}) as Record<string, unknown>;
}

function readThemeTypography(themeTokens?: Record<string, unknown> | null) {
  if (!themeTokens?.typography || typeof themeTokens.typography !== 'object') {
    return null;
  }
  return themeTokens.typography as Record<string, unknown>;
}

function resolveThemeFontNames(
  typography: Record<string, unknown>,
  tokenTypography: Record<string, unknown> | null,
  pairing: ReturnType<typeof getFontPairing>,
) {
  const tokenDisplay = extractPrimaryFontName(String(tokenTypography?.displayFont ?? tokenTypography?.fontFamily ?? ''));
  const tokenBody = extractPrimaryFontName(String(tokenTypography?.bodyFont ?? tokenTypography?.fontFamily ?? ''));
  const fieldThemeFont = extractPrimaryFontName(String(typography.fontFamily ?? ''));

  const displayFont =
    tokenDisplay ||
    fieldThemeFont ||
    extractPrimaryFontName(String(typography.displayFontFamily ?? '')) ||
    pairing.displayFont;

  const bodyFont =
    tokenBody ||
    fieldThemeFont ||
    extractPrimaryFontName(String(typography.bodyFontFamily ?? '')) ||
    pairing.bodyFont;

  return { displayFont, bodyFont };
}

export function resolvePageTypography(
  fields: HeaderBlockFields | null | undefined,
  themeTokens?: Record<string, unknown> | null,
): ResolvedPageTypography {
  const typography = readTypographyRecord(fields);
  const tokenTypography = readThemeTypography(themeTokens);

  const pairingId = String(typography.fontPairingId ?? themeTokens?.fontPairingId ?? '').trim();
  const pairing = getFontPairing(pairingId || 'modern-inter');

  const { displayFont: resolvedDisplay, bodyFont: resolvedBody } = resolveThemeFontNames(
    typography,
    tokenTypography,
    pairing,
  );

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

export function getThemeTypographyCssVars(typography: ResolvedPageTypography): CSSProperties {
  return {
    ['--theme-display-font' as string]: typography.displayFontStack,
    ['--theme-body-font' as string]: typography.bodyFontStack,
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
