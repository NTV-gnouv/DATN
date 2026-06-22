export type DesignLanguage =
  | 'neo-brutalism'
  | 'glassmorphism'
  | 'minimalism'
  | 'cyberpunk'
  | 'dashboard'
  | 'space-mission'
  | 'modern'
  | 'editorial'
  | 'warm-organic'
  | 'handrawn-sketch'
  | 'retro-pixel'
  | 'risograph'
  | 'doodle-sketch';

export type ColorMood = 'clean' | 'vibrant' | 'dark' | 'warm' | 'pastel';
export type BackgroundStyle = 'solid' | 'gradient' | 'image';
export type TypographyStyle = 'modern' | 'editorial' | 'friendly' | 'minimal' | 'bold';
export type BorderStyle = 'none' | 'soft' | 'sharp' | 'brutal' | 'dashed';
export type ShadowStyle = 'none' | 'soft' | 'strong' | 'glow' | 'offset';
export type AnimationStyle = 'none' | 'fade' | 'float' | 'pulse' | 'gradient-shift';
export type LayoutStyle = 'centered' | 'compact' | 'split';
export type SpacingScale = 'tight' | 'balanced' | 'airy';
export type TitleEmphasis = 'high' | 'medium' | 'subtle';
export type ContentDensity = 'sparse' | 'balanced' | 'dense';
export type AvatarDisplayStyle = 'circle' | 'square' | 'arched' | 'ring' | 'horizontal';
export type BackgroundEffect = 'none' | 'sparkle' | 'shimmer' | 'grain';
export type ContentBlockStyle = 'white' | 'tinted' | 'glass' | 'contrast-soft';

export type UxDesignProfile = {
  design_language: DesignLanguage;
  design_language_label: string;
  color_mood: ColorMood;
  background_style: BackgroundStyle;
  typography_style: TypographyStyle;
  font_pairing_id: string;
  font_family: string;
  heading_size: number;
  body_size: number;
  line_height: number;
  font_weight_heading: number;
  font_weight_body: number;
  border_style: BorderStyle;
  shadow_style: ShadowStyle;
  animation_style: AnimationStyle;
  layout_style: LayoutStyle;
  width_percent: number;
  spacing_scale: SpacingScale;
  avatar_shape: 'circle' | 'square';
  avatar_display_style?: AvatarDisplayStyle;
  avatar_size: number;
  background_effect?: BackgroundEffect;
  content_block_style?: ContentBlockStyle;
  style_preset_id?: string;
  style_preset_label?: string;
  surface_class?: string;
  gallery_layout: 'column' | 'carousel';
  gallery_appearance: 'exposed' | 'collapsible';
  interaction: {
    hover_scale: number;
    transition_ms: number;
    focus_ring: boolean;
  };
  visual_hierarchy: {
    title_emphasis: TitleEmphasis;
    content_density: ContentDensity;
  };
  reasoning: string;
};

export type UxDesignInput = {
  name: string;
  occupation: string;
  description: string;
  brand_style: string;
  personality_traits: string[];
  color_palette: {
    primary: { hex: string };
    secondary_1: { hex: string };
    secondary_2: { hex: string };
    contrast: { hex: string };
  };
};

export type UxDesignMappingResult = {
  themeTokens: Record<string, unknown>;
  headerPatch: Record<string, unknown>;
  galleryPatch: Record<string, unknown>;
  animationCss: string;
  animationClassName: string;
  interactionCss: string;
};
