export type ThemeAnimationConfig = {
  className: string;
  css: string;
};

export function getThemeAnimationConfig(themeTokens?: Record<string, unknown> | null): ThemeAnimationConfig | null {
  if (!themeTokens || typeof themeTokens !== 'object') {
    return null;
  }

  const effects = themeTokens.effects;
  if (!effects || typeof effects !== 'object') {
    return null;
  }

  const className = String((effects as Record<string, unknown>).animationClassName ?? '').trim();
  const css = String((effects as Record<string, unknown>).animationCss ?? '').trim();

  if (!className || !css) {
    return null;
  }

  return { className, css };
}

