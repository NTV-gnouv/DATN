export type AiSurfaceStyle = {
  className: string;
  interactionCss: string;
  displayFont: string;
  bodyFont: string;
  headingWeight: number;
  bodyWeight: number;
  lineHeight: number;
};

export const AI_SURFACE_STYLES: Record<string, AiSurfaceStyle> = {
  'theme-surface-handrawn': {
    className: 'theme-surface-handrawn',
    displayFont: 'Delicious Handrawn',
    bodyFont: 'Elms Sans',
    headingWeight: 400,
    bodyWeight: 400,
    lineHeight: 1.7,
    interactionCss:
      '.theme-surface-handrawn .phone-content-card, .theme-surface-handrawn .content-link-item { transition: transform 150ms ease, box-shadow 150ms ease; } .theme-surface-handrawn .phone-content-card:hover, .theme-surface-handrawn .content-link-item:hover { transform: translate(-2px, -2px); box-shadow: 0 0 0 4px #f4eddf, 1px 1px 4px 2px rgba(43, 36, 24, 0.5) !important; }',
  },
  'theme-surface-doodle': {
    className: 'theme-surface-doodle',
    displayFont: 'Delius Swash Caps',
    bodyFont: 'Delius Swash Caps',
    headingWeight: 600,
    bodyWeight: 400,
    lineHeight: 1.5,
    interactionCss:
      '.theme-surface-doodle .phone-content-card { transition: transform 180ms ease, box-shadow 180ms ease; } .theme-surface-doodle .phone-content-card:hover { transform: translate(-2px, -2px) rotate(-0.6deg); }',
  },
  'theme-surface-win95': {
    className: 'theme-surface-win95',
    displayFont: 'Silkscreen',
    bodyFont: 'Silkscreen',
    headingWeight: 700,
    bodyWeight: 400,
    lineHeight: 1.45,
    interactionCss:
      '.theme-surface-win95 .phone-content-card:active { border-color: #808080 #ffffff #ffffff #808080 !important; }',
  },
  'theme-surface-riso': {
    className: 'theme-surface-riso',
    displayFont: 'Space Grotesk',
    bodyFont: 'Space Grotesk',
    headingWeight: 700,
    bodyWeight: 400,
    lineHeight: 1.5,
    interactionCss:
      '.theme-surface-riso .phone-content-card { transition: transform 120ms ease-out, box-shadow 120ms ease-out; } .theme-surface-riso .phone-content-card:hover { transform: translate(-2px, -2px); }',
  },
};

export function getAiSurfaceStyle(surfaceClass?: string | null): AiSurfaceStyle | null {
  const key = String(surfaceClass ?? '').trim();
  return key ? (AI_SURFACE_STYLES[key] ?? null) : null;
}
