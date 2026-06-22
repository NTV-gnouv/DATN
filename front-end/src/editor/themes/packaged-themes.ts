import type { ThemeToken } from './minimal-theme';

export const DOODLE_SKETCH_THEME: ThemeToken = {
  id: 'doodle-sketch',
  name: 'Doodle Sketch',
  description: 'Phác thảo tay với viền nét và nền kem ấm.',
  previewMode: 'mobile-first',
  surface: {
    canvas: '#F9F6F0',
    panel: '#EFEBE1',
    ink: '#1F2937',
    line: '#111827',
    accent: '#EACDC2',
  },
  typography: {
    fontFamily: 'Delius Swash Caps, cursive',
    headingWeight: 600,
    bodyWeight: 400,
  },
  mobile: {
    maxWidth: 420,
    minPadding: 16,
  },
};

export const RETRO_WIN95_THEME: ThemeToken = {
  id: 'retro-win95',
  name: 'Retro Win95',
  description: 'Giao diện Windows 95 với nền teal và panel bạc.',
  previewMode: 'mobile-first',
  surface: {
    canvas: '#008081',
    panel: '#C0C0C0',
    ink: '#000000',
    line: '#808080',
    accent: '#000080',
  },
  typography: {
    fontFamily: 'Silkscreen, IBM Plex Mono, monospace',
    headingWeight: 700,
    bodyWeight: 400,
  },
  mobile: {
    maxWidth: 420,
    minPadding: 16,
  },
};

export const RISOGRAPH_PRINT_THEME: ThemeToken = {
  id: 'risograph-print',
  name: 'Risograph Print',
  description: 'In risograph — giấy kem, hồng neon và bóng offset xanh.',
  previewMode: 'mobile-first',
  surface: {
    canvas: '#F3EEE4',
    panel: '#FBF6EC',
    ink: '#2C3FA7',
    line: '#E4E0D9',
    accent: '#F237A1',
  },
  typography: {
    fontFamily: 'Space Grotesk, sans-serif',
    headingWeight: 700,
    bodyWeight: 400,
  },
  mobile: {
    maxWidth: 420,
    minPadding: 16,
  },
};

export const HANDRAWN_CREAM_THEME: ThemeToken = {
  id: 'handrawn-cream',
  name: 'Handrawn Cream',
  description: 'Phác thảo bút chì trên giấy kem — viền nét đứt và accent teal.',
  previewMode: 'mobile-first',
  surface: {
    canvas: '#FFFAF5',
    panel: '#F4EDDF',
    ink: '#1F1B12',
    line: '#2B2418',
    accent: '#1DAD97',
  },
  typography: {
    fontFamily: 'Delicious Handrawn, Elms Sans, cursive',
    headingWeight: 400,
    bodyWeight: 400,
  },
  mobile: {
    maxWidth: 420,
    minPadding: 16,
  },
};
