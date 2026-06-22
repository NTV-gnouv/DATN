import { inferFontPairingFromBrand } from '@/shared/fonts/font-catalog';
import type { UxDesignInput, UxDesignProfile } from '@/shared/types/ux-design.types';

export type AvatarDisplayStylePreset = 'circle' | 'square' | 'arched' | 'ring' | 'horizontal';
export type BackgroundEffect = 'none' | 'sparkle' | 'shimmer' | 'grain';
export type ContentBlockStyle = 'white' | 'tinted' | 'glass' | 'contrast-soft';

export type UxStylePresetDefinition = {
  id: string;
  label: string;
  description: string;
  overrides: Partial<UxDesignProfile> & {
    avatar_display_style: AvatarDisplayStylePreset;
    background_effect: BackgroundEffect;
    content_block_style: ContentBlockStyle;
  };
};

export type UxStyleOption = {
  id: string;
  label: string;
  description: string;
  uxDesign: UxDesignProfile;
  preview: {
    themeTokens: Record<string, unknown>;
    headerPatch: Record<string, unknown>;
  };
};

export const UX_STYLE_PRESETS: UxStylePresetDefinition[] = [
  {
    id: 'hero-photo',
    label: 'Ảnh nổi bật',
    description: 'Nền ảnh full, block trong suốt nhẹ, avatar viền chấm và hiệu ứng lấp lánh tinh tế.',
    overrides: {
      background_style: 'image',
      background_effect: 'shimmer',
      shadow_style: 'soft',
      border_style: 'soft',
      animation_style: 'fade',
      avatar_display_style: 'ring',
      content_block_style: 'glass',
      color_mood: 'clean',
      spacing_scale: 'airy',
    },
  },
  {
    id: 'vibrant-gradient',
    label: 'Gradient sống động',
    description: 'Nền gradient chuyển màu, block tint màu thương hiệu, avatar vòm và bóng phát sáng.',
    overrides: {
      background_style: 'gradient',
      background_effect: 'sparkle',
      shadow_style: 'glow',
      border_style: 'none',
      animation_style: 'gradient-shift',
      avatar_display_style: 'arched',
      content_block_style: 'tinted',
      color_mood: 'vibrant',
      spacing_scale: 'balanced',
    },
  },
  {
    id: 'bold-solid',
    label: 'Tối giản mạnh',
    description: 'Nền màu đơn, viền outline rõ, avatar ngang trái và block tương phản nhẹ.',
    overrides: {
      background_style: 'solid',
      background_effect: 'grain',
      shadow_style: 'strong',
      border_style: 'brutal',
      animation_style: 'pulse',
      avatar_display_style: 'horizontal',
      content_block_style: 'contrast-soft',
      color_mood: 'warm',
      spacing_scale: 'tight',
    },
  },
];

function inferTypographyStyle(input: UxDesignInput): UxDesignProfile['typography_style'] {
  const context = `${input.brand_style} ${input.personality_traits.join(' ')} ${input.occupation} ${input.description}`.toLowerCase();
  if (/sáng tạo|creative|nghệ thuật|art|design|photo|nhiếp ảnh/.test(context)) {
    return 'editorial';
  }
  if (/ấm áp|gần gũi|friendly|thân thiện|warm|lifestyle|food|travel/.test(context)) {
    return 'friendly';
  }
  if (/tối giản|minimal|clean|chuyên nghiệp|professional|business/.test(context)) {
    return 'minimal';
  }
  return 'modern';
}

export function buildUxProfileFromPreset(
  preset: UxStylePresetDefinition,
  input: UxDesignInput,
  baseUx?: Partial<UxDesignProfile>,
): UxDesignProfile {
  const pairing = inferFontPairingFromBrand(input);
  const typographyStyle = baseUx?.typography_style ?? inferTypographyStyle(input);

  return {
    design_language: 'modern',
    design_language_label: preset.label,
    color_mood: preset.overrides.color_mood ?? 'clean',
    background_style: preset.overrides.background_style ?? 'image',
    typography_style: typographyStyle,
    font_pairing_id: baseUx?.font_pairing_id ?? pairing.id,
    font_family: pairing.bodyFont,
    heading_size: baseUx?.heading_size ?? pairing.headingSize,
    body_size: baseUx?.body_size ?? pairing.bodySize,
    line_height: baseUx?.line_height ?? pairing.lineHeight,
    font_weight_heading: baseUx?.font_weight_heading ?? pairing.headingWeight,
    font_weight_body: baseUx?.font_weight_body ?? pairing.bodyWeight,
    border_style: preset.overrides.border_style ?? 'soft',
    shadow_style: preset.overrides.shadow_style ?? 'soft',
    animation_style: preset.overrides.animation_style ?? 'fade',
    layout_style: 'centered',
    width_percent: 100,
    spacing_scale: preset.overrides.spacing_scale ?? 'balanced',
    avatar_shape: preset.overrides.avatar_display_style === 'square' ? 'square' : 'circle',
    avatar_display_style: preset.overrides.avatar_display_style,
    avatar_size: baseUx?.avatar_size ?? 32,
    background_effect: preset.overrides.background_effect,
    content_block_style: preset.overrides.content_block_style,
    style_preset_id: preset.id,
    style_preset_label: preset.label,
    gallery_layout: 'column',
    gallery_appearance: 'exposed',
    interaction: baseUx?.interaction ?? { hover_scale: 1.02, transition_ms: 240, focus_ring: true },
    visual_hierarchy: baseUx?.visual_hierarchy ?? { title_emphasis: 'high', content_density: 'balanced' },
    reasoning: preset.description,
  };
}

