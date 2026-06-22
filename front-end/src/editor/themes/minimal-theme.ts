export type ThemeToken = {
  id: string;
  name: string;
  description: string;
  previewMode: 'mobile-first';
  surface: {
    canvas: string;
    panel: string;
    ink: string;
    line: string;
    accent: string;
  };
  typography: {
    fontFamily: string;
    headingWeight: number;
    bodyWeight: number;
  };
  mobile: {
    maxWidth: number;
    minPadding: number;
  };
};

export const MINIMAL_THEME: ThemeToken = {
  id: 'minimal',
  name: 'Minimal Theme',
  description: 'Theme mặc định tối ưu cho giao diện editor và landing page nhẹ.',
  previewMode: 'mobile-first',
  surface: {
    canvas: '#ffffff',
    panel: '#f7f7f7',
    ink: '#111111',
    line: '#d0d0d0',
    accent: '#76b900',
  },
  typography: {
    fontFamily: 'NVIDIA-EMEA, Inter, Arial, Helvetica, sans-serif',
    headingWeight: 700,
    bodyWeight: 400,
  },
  mobile: {
    maxWidth: 420,
    minPadding: 16,
  },
};
