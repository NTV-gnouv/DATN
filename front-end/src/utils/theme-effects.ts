import type { CSSProperties } from 'react';

import type { ThemeAnimationConfig } from './theme-animation';
import { getThemeAnimationConfig } from './theme-animation';

export type ThemeEffectsConfig = ThemeAnimationConfig & {
  interactionCss: string;
  glassmorphism: boolean;
  backdropBlur: string;
  cardStyle?: CSSProperties;
};

export function getThemeEffectsConfig(themeTokens?: Record<string, unknown> | null): ThemeEffectsConfig | null {
  if (!themeTokens || typeof themeTokens !== 'object') {
    return null;
  }

  const animation = getThemeAnimationConfig(themeTokens);
  const effects = themeTokens.effects;
  if (!effects || typeof effects !== 'object') {
    return animation
      ? {
          ...animation,
          interactionCss: '',
          glassmorphism: false,
          backdropBlur: '0px',
        }
      : null;
  }

  const effectRecord = effects as Record<string, unknown>;
  const interactionCss = String(effectRecord.interactionCss ?? '').trim();
  const backgroundEffectCss = String(effectRecord.backgroundEffectCss ?? '').trim();
  const backgroundEffectClassName = String(effectRecord.backgroundEffectClassName ?? '').trim();
  const glassmorphism = Boolean(effectRecord.glassmorphism);
  const backdropBlur = String(effectRecord.backdropBlur ?? '12px');
  const combinedCss = [animation?.css ?? '', backgroundEffectCss, interactionCss].filter(Boolean).join('\n');
  const combinedClassName = [animation?.className ?? '', backgroundEffectClassName].filter(Boolean).join(' ').trim();

  if (!combinedClassName && !combinedCss && !glassmorphism) {
    return null;
  }

  const cardStyle: CSSProperties = glassmorphism
    ? {
        backdropFilter: `blur(${backdropBlur})`,
        WebkitBackdropFilter: `blur(${backdropBlur})`,
      }
    : {};

  return {
    className: combinedClassName || 'theme-effects',
    css: combinedCss,
    interactionCss,
    glassmorphism,
    backdropBlur,
    cardStyle,
  };
}
