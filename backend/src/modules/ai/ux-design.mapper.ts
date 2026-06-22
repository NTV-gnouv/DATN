import type {
  AnimationStyle,
  AvatarDisplayStyle,
  BackgroundEffect,
  BorderStyle,
  ContentBlockStyle,
  ShadowStyle,
  SpacingScale,
  TypographyStyle,
  UxDesignInput,
  UxDesignMappingResult,
  UxDesignProfile,
} from '@/shared/types/ux-design.types';
import { getFontPairing, inferFontPairingFromBrand, listFontPairingIds } from '@/shared/fonts/font-catalog';

function pickEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  const normalized = String(value ?? '').trim() as T;
  return allowed.includes(normalized) ? normalized : fallback;
}

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

function resolveAvatarWidthPercent(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return 32;
  }

  if (parsed > 100) {
    return clampNumber(Math.round((parsed / 375) * 100), 18, 72, 32);
  }

  return clampNumber(parsed, 18, 72, 32);
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'landing';
}

function readableTextColor(backgroundHex: string): string {
  const hex = backgroundHex.replace('#', '');
  if (hex.length !== 6) {
    return '#111111';
  }
  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.55 ? '#111111' : '#ffffff';
}

function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) {
    return `rgba(255,255,255,${alpha})`;
  }
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function resolveBorder(borderStyle: BorderStyle, contrastHex: string) {
  switch (borderStyle) {
    case 'none':
      return { width: 0, style: 'none' as const, radius: 0, color: contrastHex };
    case 'sharp':
      return { width: 2, style: 'solid' as const, radius: 4, color: contrastHex };
    case 'brutal':
      return { width: 3, style: 'solid' as const, radius: 0, color: contrastHex };
    default:
      return { width: 1, style: 'solid' as const, radius: 14, color: contrastHex };
  }
}

function resolveShadow(shadowStyle: ShadowStyle, accentHex: string) {
  if (shadowStyle === 'none') {
    return { enabled: false, x: 0, y: 0, blur: 0, spread: 0, color: 'rgba(15, 23, 42, 0)' };
  }
  if (shadowStyle === 'glow') {
    return {
      enabled: true,
      x: 0,
      y: 0,
      blur: 36,
      spread: 2,
      color: hexToRgba(accentHex, 0.38),
    };
  }
  if (shadowStyle === 'strong') {
    return { enabled: true, x: 0, y: 12, blur: 32, spread: 0, color: 'rgba(15, 23, 42, 0.24)' };
  }
  return { enabled: true, x: 0, y: 8, blur: 24, spread: 0, color: 'rgba(15, 23, 42, 0.14)' };
}

function buildBackgroundEffect(
  effect: BackgroundEffect,
  scopeClass: string,
  colors: { primary: string; secondary: string; accent: string },
) {
  if (effect === 'none') {
    return { className: '', css: '' };
  }

  const effectClass = `${scopeClass}-bgfx`;

  if (effect === 'sparkle') {
    return {
      className: effectClass,
      css: `
.${effectClass}{position:relative;overflow:hidden;}
.${effectClass}::before{
  content:'';
  position:absolute;
  inset:0;
  pointer-events:none;
  background-image:
    radial-gradient(circle at 18% 24%, ${hexToRgba(colors.accent, 0.45)} 0 1px, transparent 1px),
    radial-gradient(circle at 72% 58%, ${hexToRgba('#ffffff', 0.55)} 0 1px, transparent 1px),
    radial-gradient(circle at 44% 82%, ${hexToRgba(colors.secondary, 0.35)} 0 1.5px, transparent 1.5px);
  background-size:120px 120px,180px 180px,140px 140px;
  animation:${effectClass}-drift 7s linear infinite;
  opacity:0.75;
}
@keyframes ${effectClass}-drift{0%{transform:translateY(0)}100%{transform:translateY(-48px)}}`.trim(),
    };
  }

  if (effect === 'shimmer') {
    return {
      className: effectClass,
      css: `
.${effectClass}{position:relative;overflow:hidden;}
.${effectClass}::after{
  content:'';
  position:absolute;
  inset:-40% -60%;
  pointer-events:none;
  background:linear-gradient(115deg, transparent 35%, ${hexToRgba('#ffffff', 0.22)} 50%, transparent 65%);
  animation:${effectClass}-shine 5.5s ease-in-out infinite;
}
@keyframes ${effectClass}-shine{0%,100%{transform:translateX(-30%) rotate(8deg)}50%{transform:translateX(30%) rotate(8deg)}}`.trim(),
    };
  }

  return {
    className: effectClass,
    css: `
.${effectClass}{position:relative;}
.${effectClass}::before{
  content:'';
  position:absolute;
  inset:0;
  pointer-events:none;
  opacity:0.08;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
}`.trim(),
  };
}

function resolveContentBlockColors(
  blockStyle: ContentBlockStyle,
  brandInput: UxDesignInput,
) {
  const primary = brandInput.color_palette.primary.hex;
  const secondary = brandInput.color_palette.secondary_1.hex;
  const accent = brandInput.color_palette.secondary_2.hex;
  const contrast = brandInput.color_palette.contrast.hex;

  switch (blockStyle) {
    case 'tinted':
      return {
        contentBg: hexToRgba(secondary, 0.16),
        contentText: contrast,
        contentButton: accent,
      };
    case 'glass':
      return {
        contentBg: hexToRgba('#ffffff', readableTextColor(primary) === '#ffffff' ? 0.14 : 0.88),
        contentText: contrast,
        contentButton: accent,
      };
    case 'contrast-soft':
      return {
        contentBg: hexToRgba(contrast, 0.06),
        contentText: contrast,
        contentButton: primary,
      };
    default:
      return {
        contentBg: readableTextColor(primary) === '#ffffff' ? hexToRgba('#ffffff', 0.96) : '#ffffff',
        contentText: contrast,
        contentButton: accent,
      };
  }
}

function resolveAvatarDisplayStyle(ux: UxDesignProfile): AvatarDisplayStyle {
  if (ux.avatar_display_style) {
    return ux.avatar_display_style;
  }
  return ux.avatar_shape === 'square' ? 'square' : 'circle';
}

function resolveLayout(widthPercent: number) {
  return {
    widthPercent: widthPercent > 0 ? widthPercent : 100,
    alignment: 'center' as const,
  };
}

function resolveSpacing(scale: SpacingScale) {
  const map = { tight: 8, balanced: 12, airy: 18 };
  return { gap: map[scale], sectionPadding: map[scale] * 1.5, cardPadding: map[scale] };
}

function buildAnimation(style: AnimationStyle, profileKey: string) {
  const safeKey = slugify(profileKey);
  const className = `theme-anim-${safeKey}`;
  const keyframeName = `anim-${safeKey}`;

  if (style === 'none') {
    return { className, css: '' };
  }
  if (style === 'fade') {
    return {
      className,
      css: `.${className}{animation:${keyframeName} 600ms ease-out both;}@keyframes ${keyframeName}{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`,
    };
  }
  if (style === 'float') {
    return {
      className,
      css: `.${className}{animation:${keyframeName} 4s ease-in-out infinite;}@keyframes ${keyframeName}{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}`,
    };
  }
  if (style === 'pulse') {
    return {
      className,
      css: `.${className}{animation:${keyframeName} 2.2s ease-in-out infinite;}@keyframes ${keyframeName}{0%,100%{transform:scale(1)}50%{transform:scale(1.015)}}`,
    };
  }
  return {
    className,
    css: `.${className}{background-size:200% 200%;animation:${keyframeName} 8s ease infinite;}@keyframes ${keyframeName}{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}`,
  };
}

function buildInteractionCss(hoverScale: number, transitionMs: number, focusRing: boolean, scopeClass: string): string {
  const focusRule = focusRing
    ? `.${scopeClass} .phone-content-card:focus-within,.${scopeClass} .phone-link-card:focus-within,.${scopeClass} .theme-interactive:focus-within{outline:2px solid currentColor;outline-offset:2px;}`
    : '';
  return `
.${scopeClass} .phone-content-card,
.${scopeClass} .phone-link-card,
.${scopeClass} .theme-interactive,
.${scopeClass} .phone-content-card button,
.${scopeClass} .phone-social-icons span {
  transition: transform ${transitionMs}ms ease, box-shadow ${transitionMs}ms ease, opacity ${transitionMs}ms ease, filter ${transitionMs}ms ease;
}
.${scopeClass} .phone-content-card:hover,
.${scopeClass} .phone-link-card:hover,
.${scopeClass} .theme-interactive:hover {
  transform: scale(${hoverScale});
}
.${scopeClass} .phone-content-card button:hover {
  filter: brightness(1.06);
  transform: translateY(-1px);
}
${focusRule}`.trim();
}

function inferTypographyFromBrand(input: UxDesignInput): TypographyStyle {
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

function buildFallbackUxDesign(input: UxDesignInput): UxDesignProfile {
  const pairing = inferFontPairingFromBrand(input);
  const typographyStyle = inferTypographyFromBrand(input);

  return {
    design_language: 'modern',
    design_language_label: 'Hiện đại',
    color_mood: 'clean',
    background_style: 'image',
    typography_style: typographyStyle,
    font_pairing_id: pairing.id,
    font_family: pairing.bodyFont,
    heading_size: pairing.headingSize,
    body_size: pairing.bodySize,
    line_height: pairing.lineHeight,
    font_weight_heading: pairing.headingWeight,
    font_weight_body: pairing.bodyWeight,
    border_style: 'soft',
    shadow_style: 'soft',
    animation_style: 'fade',
    layout_style: 'centered',
    width_percent: 100,
    spacing_scale: 'balanced',
    avatar_shape: 'circle',
    avatar_display_style: 'ring',
    avatar_size: 32,
    background_effect: 'shimmer',
    content_block_style: 'glass',
    style_preset_id: 'hero-photo',
    style_preset_label: 'Ảnh nổi bật',
    gallery_layout: 'column',
    gallery_appearance: 'exposed',
    interaction: { hover_scale: 1.02, transition_ms: 240, focus_ring: true },
    visual_hierarchy: { title_emphasis: 'high', content_density: 'balanced' },
    reasoning: `Font pairing ${pairing.label} phù hợp tính cách thương hiệu.`,
  };
}

export function normalizeUxDesignProfile(raw: unknown, input: UxDesignInput): UxDesignProfile {
  const fallback = buildFallbackUxDesign(input);
  const payload = (raw ?? {}) as Record<string, unknown>;
  const interaction = (payload.interaction ?? {}) as Record<string, unknown>;
  const hierarchy = (payload.visual_hierarchy ?? {}) as Record<string, unknown>;

  const typographyStyle = pickEnum(
    payload.typography_style,
    ['modern', 'editorial', 'friendly', 'minimal', 'bold'],
    fallback.typography_style,
  );
  const fontPairingId = pickEnum(payload.font_pairing_id, listFontPairingIds(), fallback.font_pairing_id);
  const pairing = getFontPairing(fontPairingId);

  return {
    design_language: 'modern',
    design_language_label: 'Hiện đại',
    color_mood: pickEnum(payload.color_mood, ['clean', 'vibrant', 'dark', 'warm', 'pastel'], fallback.color_mood),
    background_style: pickEnum(payload.background_style, ['solid', 'gradient', 'image'], 'image'),
    typography_style: typographyStyle,
    font_pairing_id: pairing.id,
    font_family: pairing.bodyFont,
    heading_size: clampNumber(payload.heading_size, 28, 42, pairing.headingSize),
    body_size: clampNumber(payload.body_size, 14, 18, pairing.bodySize),
    line_height: clampNumber(payload.line_height, 1.4, 1.7, pairing.lineHeight),
    font_weight_heading: clampNumber(payload.font_weight_heading, 400, 800, pairing.headingWeight),
    font_weight_body: clampNumber(payload.font_weight_body, 400, 500, pairing.bodyWeight),
    border_style: pickEnum(payload.border_style, ['none', 'soft', 'sharp', 'brutal'], 'soft'),
    shadow_style: pickEnum(payload.shadow_style, ['none', 'soft', 'strong', 'glow'], 'soft'),
    animation_style: pickEnum(payload.animation_style, ['none', 'fade', 'float', 'pulse', 'gradient-shift'], 'fade'),
    layout_style: 'centered',
    width_percent: clampNumber(payload.width_percent, 92, 100, 100),
    spacing_scale: pickEnum(payload.spacing_scale, ['tight', 'balanced', 'airy'], 'balanced'),
    avatar_shape: pickEnum(payload.avatar_shape, ['circle', 'square'], fallback.avatar_shape),
    avatar_display_style: pickEnum(
      payload.avatar_display_style,
      ['circle', 'square', 'arched', 'ring', 'horizontal'] as const,
      fallback.avatar_display_style ?? 'circle',
    ),
    avatar_size: resolveAvatarWidthPercent(payload.avatar_size),
    background_effect: pickEnum(
      payload.background_effect,
      ['none', 'sparkle', 'shimmer', 'grain'] as const,
      fallback.background_effect ?? 'none',
    ),
    content_block_style: pickEnum(
      payload.content_block_style,
      ['white', 'tinted', 'glass', 'contrast-soft'] as const,
      fallback.content_block_style ?? 'white',
    ),
    style_preset_id: String(payload.style_preset_id ?? fallback.style_preset_id ?? '').slice(0, 40) || undefined,
    style_preset_label: String(payload.style_preset_label ?? fallback.style_preset_label ?? '').slice(0, 80) || undefined,
    gallery_layout: 'column',
    gallery_appearance: 'exposed',
    interaction: {
      hover_scale: clampNumber(interaction.hover_scale, 1.01, 1.03, 1.02),
      transition_ms: clampNumber(interaction.transition_ms, 180, 320, 240),
      focus_ring: interaction.focus_ring !== false,
    },
    visual_hierarchy: {
      title_emphasis: pickEnum(hierarchy.title_emphasis, ['high', 'medium', 'subtle'], 'high'),
      content_density: 'balanced',
    },
    reasoning: String(payload.reasoning ?? fallback.reasoning).slice(0, 200),
  };
}

export function mapUxDesignToPage(
  ux: UxDesignProfile,
  brandInput: UxDesignInput,
  options: { backgroundImageUrl?: string; pageKey: string },
): UxDesignMappingResult {
  const primary = brandInput.color_palette.primary.hex;
  const secondary = brandInput.color_palette.secondary_1.hex;
  const accent = brandInput.color_palette.secondary_2.hex;
  const contrast = brandInput.color_palette.contrast.hex;

  const border = resolveBorder(ux.border_style, ux.border_style === 'brutal' ? contrast : hexToRgba(contrast, 0.35));
  const shadow = resolveShadow(ux.shadow_style, accent);
  const layout = resolveLayout(ux.width_percent);
  const spacing = resolveSpacing(ux.spacing_scale);
  const animation = buildAnimation(ux.animation_style, options.pageKey);
  const backgroundEffect = buildBackgroundEffect(ux.background_effect ?? 'none', animation.className, {
    primary,
    secondary,
    accent,
  });
  const interactionCss = buildInteractionCss(
    ux.interaction.hover_scale,
    ux.interaction.transition_ms,
    ux.interaction.focus_ring,
    animation.className,
  );

  const headerText =
    ux.background_style === 'solid' ? readableTextColor(primary) : ux.background_style === 'gradient' ? '#ffffff' : '#ffffff';
  const socialBg = ux.color_mood === 'vibrant' ? accent : secondary;
  const socialText = readableTextColor(socialBg);
  const blockColors = resolveContentBlockColors(ux.content_block_style ?? 'white', brandInput);
  const avatarDisplayStyle = resolveAvatarDisplayStyle(ux);
  const isDarkPrimary = readableTextColor(primary) === '#ffffff';

  const pageBackground =
    ux.background_style === 'solid'
      ? {
          mode: 'solid' as const,
          solid: primary,
          gradient: { start: primary, end: secondary, type: 'linear' as const },
          imageUrl: '',
          overlayColor: '#000000',
          overlayOpacity: 0,
        }
      : ux.background_style === 'gradient'
        ? {
            mode: 'gradient' as const,
            solid: primary,
            gradient: { start: primary, end: accent, type: 'linear' as const },
            imageUrl: '',
            overlayColor: '#000000',
            overlayOpacity: 0,
          }
        : {
            mode: 'image' as const,
            solid: primary,
            gradient: { start: primary, end: secondary, type: 'linear' as const },
            imageUrl: options.backgroundImageUrl ?? '',
            overlayColor: '#000000',
            overlayOpacity: isDarkPrimary ? 28 : 20,
          };

  const pairing = getFontPairing(ux.font_pairing_id);
  const titleMultiplier = ux.visual_hierarchy.title_emphasis === 'high' ? 1.08 : ux.visual_hierarchy.title_emphasis === 'subtle' ? 0.96 : 1;
  const resolvedHeadingSize = Math.round(ux.heading_size * titleMultiplier);

  const themeTokens: Record<string, unknown> = {
    source: 'ai-ux-design',
    designLanguage: ux.design_language,
    designLanguageLabel: ux.design_language_label,
    fontPairingId: pairing.id,
    fontPairingLabel: pairing.label,
    designProfile: ux,
    colors: {
      primary,
      secondary,
      accent,
      background: primary,
      text: contrast,
      textLight: contrast,
      border: border.color,
    },
    typography: {
      fontFamily: pairing.bodyFont,
      displayFontFamily: pairing.displayFont,
      bodyFontFamily: pairing.bodyFont,
      fontPairingId: pairing.id,
      headingSize: resolvedHeadingSize,
      bodySize: ux.body_size,
      headingWeight: ux.font_weight_heading,
      bodyWeight: ux.font_weight_body,
      lineHeight: ux.line_height,
      headingLetterSpacing: pairing.headingLetterSpacing,
      headingTransform: pairing.headingTransform,
    },
    border,
    shadow,
    layout: {
      ...layout,
      gap: spacing.gap,
      sectionPadding: spacing.sectionPadding,
      cardPadding: spacing.cardPadding,
      contentDensity: ux.visual_hierarchy.content_density,
    },
    spacing,
    review: { fontSize: ux.body_size },
    interaction: ux.interaction,
    effects: {
      animationStyle: ux.animation_style,
      animationClassName: animation.className,
      animationCss: animation.css,
      interactionCss,
      backgroundEffect: ux.background_effect ?? 'none',
      backgroundEffectClassName: backgroundEffect.className,
      backgroundEffectCss: backgroundEffect.css,
      glassmorphism: ux.content_block_style === 'glass',
      backdropBlur: ux.content_block_style === 'glass' ? '14px' : '0px',
    },
    reasoning: ux.reasoning,
    generatedAt: new Date().toISOString(),
  };

  const headerPatch = {
    profile: {
      avatarShape: ux.avatar_shape,
      avatarDisplayStyle,
      avatarSize: ux.avatar_size,
      displayNameSize: 100,
    },
    colors: {
      pageBackground,
      headerTextAndIcon: headerText,
      socialBlockBackground: socialBg,
      socialBlockText: socialText,
      contentBlockBackground: blockColors.contentBg,
      contentBlockText: blockColors.contentText,
      contentBlockButton: blockColors.contentButton,
    },
    typography: {
      fontFamily: pairing.bodyFont,
      displayFontFamily: pairing.displayFont,
      bodyFontFamily: pairing.bodyFont,
      fontPairingId: pairing.id,
      fontSize: ux.body_size,
      fontWeight: ux.font_weight_body,
      headingSize: resolvedHeadingSize,
      headingWeight: ux.font_weight_heading,
      headingLetterSpacing: pairing.headingLetterSpacing,
      headingTransform: pairing.headingTransform,
      lineHeight: ux.line_height,
    },
    divLayout: {
      widthPercent: layout.widthPercent,
      border,
      boxShadow: shadow,
    },
  };

  const galleryPatch = {
    layout: 'column',
    appearance: 'exposed',
    aspectRatio: '16:9',
    imageScale: 100,
  };

  return {
    themeTokens,
    headerPatch,
    galleryPatch,
    animationCss: animation.css,
    animationClassName: animation.className,
    interactionCss,
  };
}

export { buildFallbackUxDesign };
