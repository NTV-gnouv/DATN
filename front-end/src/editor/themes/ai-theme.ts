import type { ThemeToken } from './minimal-theme';

export const AI_THEME: ThemeToken = {
  id: 'ai-theme',
  name: 'AI Theme',
  description: 'Theme được Shot AI cá nhân hóa theo hồ sơ người dùng.',
  previewMode: 'mobile-first',
  surface: {
    canvas: '#ffffff',
    panel: '#f8fafc',
    ink: '#111827',
    line: '#e5e7eb',
    accent: '#d4a800',
  },
  typography: {
    fontFamily: 'Inter, Arial, Helvetica, sans-serif',
    headingWeight: 700,
    bodyWeight: 400,
  },
  mobile: {
    maxWidth: 420,
    minPadding: 16,
  },
};
