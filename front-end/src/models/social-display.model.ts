export type SocialDisplayMode = 'icons' | 'buttons' | 'both';

export type SocialDisplayModeOption = {
  value: SocialDisplayMode;
  label: string;
  description: string;
};

export const SOCIAL_DISPLAY_MODE_OPTIONS: SocialDisplayModeOption[] = [
  {
    value: 'icons',
    label: 'Chỉ icon',
    description: 'Hàng icon tối giản, không nền — màu theo tiêu đề trang.',
  },
  {
    value: 'buttons',
    label: 'Nút full-width',
    description: 'Mỗi liên kết là một khối nút — dùng màu, viền và bóng của theme.',
  },
  {
    value: 'both',
    label: 'Cả hai',
    description: 'Hàng icon phía trên và danh sách nút full-width bên dưới.',
  },
];

export function normalizeSocialDisplayMode(value?: string | null): SocialDisplayMode {
  const normalized = String(value ?? '').trim();
  if (normalized === 'icon-only' || normalized === 'icon-and-name') {
    return 'icons';
  }
  if (normalized === 'buttons' || normalized === 'both') {
    return normalized;
  }
  if (normalized === 'icons') {
    return 'icons';
  }
  return 'icons';
}

export function shouldShowSocialIcons(mode: SocialDisplayMode): boolean {
  return mode === 'icons' || mode === 'both';
}

export function shouldShowSocialButtons(mode: SocialDisplayMode): boolean {
  return mode === 'buttons' || mode === 'both';
}

export function formatSocialPlatformLabel(platform: string): string {
  const trimmed = String(platform ?? '').trim();
  if (!trimmed) {
    return 'Link';
  }
  if (trimmed.toLowerCase() === 'x') {
    return 'X';
  }
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}
