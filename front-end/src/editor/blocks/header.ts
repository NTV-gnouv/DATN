export type SocialPlatform = {
  id: string;
  label: string;
  supportsFavicon: boolean;
};

export type HeaderBlockSchema = {
  id: string;
  name: 'header';
  title: string;
  description: string;
  fields: Array<{
    key: string;
    label: string;
    type: 'text' | 'number' | 'select' | 'color' | 'file' | 'toggle';
    help?: string;
    options?: Array<{ label: string; value: string }>;
  }>;
};

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  { id: 'facebook', label: 'Facebook', supportsFavicon: true },
  { id: 'instagram', label: 'Instagram', supportsFavicon: true },
  { id: 'tiktok', label: 'TikTok', supportsFavicon: true },
  { id: 'x', label: 'X', supportsFavicon: true },
  { id: 'youtube', label: 'YouTube', supportsFavicon: true },
  { id: 'linkedin', label: 'LinkedIn', supportsFavicon: true },
  { id: 'snapchat', label: 'Snapchat', supportsFavicon: true },
  { id: 'pinterest', label: 'Pinterest', supportsFavicon: true },
  { id: 'reddit', label: 'Reddit', supportsFavicon: true },
  { id: 'discord', label: 'Discord', supportsFavicon: true },
  { id: 'threads', label: 'Threads', supportsFavicon: true },
  { id: 'tumblr', label: 'Tumblr', supportsFavicon: true },
  { id: 'quora', label: 'Quora', supportsFavicon: true },
  { id: 'twitch', label: 'Twitch', supportsFavicon: true },
  { id: 'bereal', label: 'BeReal', supportsFavicon: true },
];

export const HEADER_BLOCK_SCHEMA: HeaderBlockSchema = {
  id: 'block-header-default',
  name: 'header',
  title: 'Header mặc định',
  description: 'Khối tiêu đề của landingpage với avatar, tên, tiểu sử và mạng xã hội.',
  fields: [
    { key: 'profile.avatarUrl', label: 'Ảnh đại diện', type: 'file', help: 'Kích thước tối đa 300px, tối thiểu 50px.' },
    {
      key: 'colors.pageBackground.mode',
      label: 'Background',
      type: 'select',
      options: [
        { label: 'Màu đơn', value: 'solid' },
        { label: 'Gradient', value: 'gradient' },
        { label: 'Image', value: 'image' },
      ],
    },
    { key: 'colors.pageBackground.solid', label: 'Background color', type: 'color' },
    { key: 'colors.pageBackground.gradient.start', label: 'Background start', type: 'color' },
    { key: 'colors.pageBackground.gradient.end', label: 'Background end', type: 'color' },
    {
      key: 'colors.pageBackground.gradient.type',
      label: 'Gradient type',
      type: 'select',
      options: [
        { label: 'Linear', value: 'linear' },
        { label: 'Radial', value: 'radial' },
        { label: 'Diagonal', value: 'diagonal' },
      ],
    },
    { key: 'colors.pageBackground.imageUrl', label: 'Background image', type: 'file', help: 'Tải ảnh nền cho page.' },
    { key: 'profile.displayName', label: 'Tên', type: 'text' },
    { key: 'profile.bio', label: 'Tiểu sử', type: 'text' },
    {
      key: 'theme.defaultThemeId',
      label: 'Chủ đề',
      type: 'select',
      options: [{ label: 'Minimal Theme', value: 'minimal' }],
    },
    { key: 'layout.mode', label: 'Bố cục layout', type: 'select', options: [{ label: 'Sẽ code sau', value: 'default' }] },
    { key: 'colors.headerTextAndIcon', label: 'Màu tiêu đề và biểu tượng', type: 'color' },
    { key: 'colors.socialBlockBackground', label: 'Màu khối social', type: 'color' },
    { key: 'colors.socialBlockText', label: 'Màu chữ khối social', type: 'color' },
    { key: 'colors.contentBlockBackground', label: 'Màu khối nội dung', type: 'color' },
    { key: 'colors.contentBlockText', label: 'Màu chữ khối nội dung', type: 'color' },
    { key: 'colors.contentBlockButton', label: 'Màu nút khối nội dung', type: 'color' },
    { key: 'typography.fontFamily', label: 'Phông chữ', type: 'text' },
    { key: 'profile.avatarDisplayStyle', label: 'Kiểu hiển thị avatar', type: 'select', options: [
      { label: 'Tròn', value: 'circle' },
      { label: 'Vuông', value: 'square' },
      { label: 'Vòm', value: 'arched' },
      { label: 'Viền chấm', value: 'ring' },
      { label: 'Ngang trái', value: 'horizontal' },
    ] },
    { key: 'profile.avatarSize', label: 'Chiều ngang avatar (%)', type: 'number' },
    { key: 'profile.displayNameSize', label: 'Kích cỡ tên (%)', type: 'number' },
    { key: 'socials.iconSize', label: 'Kích thước icon mạng xã hội', type: 'number' },
    { key: 'socials.displayMode', label: 'Kiểu hiển thị icon', type: 'select', options: [{ label: 'Chỉ icon', value: 'icon-only' }, { label: 'Icon + tên', value: 'icon-and-name' }] },
    { key: 'divLayout.widthPercent', label: 'Chiều ngang khối (%)', type: 'number' },
    { key: 'divLayout.border.width', label: 'Border width', type: 'number' },
    { key: 'divLayout.border.color', label: 'Border color', type: 'color' },
    { key: 'divLayout.border.radius', label: 'Border radius', type: 'number' },
    { key: 'divLayout.boxShadow.enabled', label: 'Box shadow', type: 'toggle' },
  ],
};

export function createHeaderBlockFieldMap() {
  return HEADER_BLOCK_SCHEMA.fields.reduce<Record<string, string>>((accumulator, field) => {
    accumulator[field.key] = field.label;
    return accumulator;
  }, {});
}
