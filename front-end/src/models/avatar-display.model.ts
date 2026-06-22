export type AvatarDisplayStyle =
  | 'circle'
  | 'square'
  | 'arched'
  | 'ring'
  | 'horizontal';

/** @deprecated Legacy values still stored in older pages */
type LegacyAvatarDisplayStyle = 'framed' | 'hero' | 'inset';

export type AvatarProfileFields = {
  avatarShape?: 'circle' | 'square';
  avatarDisplayStyle?: AvatarDisplayStyle | LegacyAvatarDisplayStyle;
};

export const AVATAR_DISPLAY_STYLE_OPTIONS: Array<{
  value: AvatarDisplayStyle;
  label: string;
  description: string;
}> = [
  { value: 'circle', label: 'Tròn', description: 'Avatar tròn, căn giữa' },
  { value: 'square', label: 'Vuông', description: 'Avatar vuông bo góc' },
  { value: 'arched', label: 'Vòm', description: 'Khung vòm phía trên' },
  { value: 'ring', label: 'Viền chấm', description: 'Tròn với viền đứt nét' },
  { value: 'horizontal', label: 'Ngang trái', description: 'Avatar trái, tên và icon bên phải, mô tả phía dưới' },
];

const REMOVED_STYLES = new Set<string>(['framed', 'hero', 'inset']);

export function resolveAvatarDisplayStyle(profile: AvatarProfileFields | null | undefined): AvatarDisplayStyle {
  const stored = profile?.avatarDisplayStyle;
  if (stored && !REMOVED_STYLES.has(stored)) {
    return stored as AvatarDisplayStyle;
  }

  return profile?.avatarShape === 'square' ? 'square' : 'circle';
}

export function resolveAvatarLayoutStyle(style: AvatarDisplayStyle): 'stacked' | 'horizontal' {
  return style === 'horizontal' ? 'horizontal' : 'stacked';
}

export function resolveLegacyAvatarShape(style: AvatarDisplayStyle): 'circle' | 'square' {
  return style === 'square' ? 'square' : 'circle';
}

export function buildAvatarProfilePatch(style: AvatarDisplayStyle) {
  return {
    avatarDisplayStyle: style,
    avatarShape: resolveLegacyAvatarShape(style),
  };
}
