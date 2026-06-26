"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UX_STYLE_PRESETS = void 0;
exports.selectDiverseStylePresetsForProfile = selectDiverseStylePresetsForProfile;
exports.selectStylePresetsForProfile = selectStylePresetsForProfile;
exports.buildUxProfileFromPreset = buildUxProfileFromPreset;
const font_catalog_1 = require("../fonts/font-catalog");
exports.UX_STYLE_PRESETS = [
    {
        id: 'hero-photo',
        label: 'Ảnh nổi bật',
        description: 'Nền ảnh full, block trong suốt nhẹ, avatar viền chấm và hiệu ứng lấp lánh tinh tế.',
        design_language: 'modern',
        tags: ['photo', 'clean', 'professional', 'portfolio', 'lifestyle', 'travel'],
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
        design_language: 'glassmorphism',
        tags: ['vibrant', 'colorful', 'creative', 'youth', 'music', 'fashion', 'energy'],
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
        design_language: 'neo-brutalism',
        tags: ['minimal', 'bold', 'business', 'startup', 'professional', 'strong'],
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
    {
        id: 'handrawn-cream',
        label: 'Phác thảo kem',
        description: 'Giấy kem ấm, viền nét đứt, bóng bút chì và font viết tay — phong cách illustrated.',
        design_language: 'handrawn-sketch',
        surface_class: 'theme-surface-handrawn',
        tags: ['handmade', 'warm', 'organic', 'friendly', 'journal', 'food', 'craft', 'illustration'],
        overrides: {
            background_style: 'solid',
            background_effect: 'none',
            shadow_style: 'offset',
            border_style: 'dashed',
            animation_style: 'fade',
            avatar_display_style: 'circle',
            content_block_style: 'contrast-soft',
            color_mood: 'warm',
            spacing_scale: 'balanced',
            font_pairing_id: 'creative-handrawn',
        },
    },
    {
        id: 'doodle-sketch',
        label: 'Doodle Sketch',
        description: 'Phác thảo tay với viền nét đậm, bóng offset và nền kem — vui nhộn, sáng tạo.',
        design_language: 'doodle-sketch',
        surface_class: 'theme-surface-doodle',
        tags: ['doodle', 'sketch', 'creative', 'art', 'fun', 'playful', 'handmade'],
        overrides: {
            background_style: 'solid',
            background_effect: 'none',
            shadow_style: 'offset',
            border_style: 'brutal',
            animation_style: 'float',
            avatar_display_style: 'square',
            content_block_style: 'tinted',
            color_mood: 'pastel',
            spacing_scale: 'airy',
            font_pairing_id: 'creative-doodle',
        },
    },
    {
        id: 'retro-pixel',
        label: 'Retro Pixel',
        description: 'Giao diện Windows 95 — nền teal, panel bạc, viền 3D và font pixel.',
        design_language: 'retro-pixel',
        surface_class: 'theme-surface-win95',
        tags: ['retro', 'gaming', 'tech', 'pixel', 'nostalgia', 'developer', 'geek'],
        overrides: {
            background_style: 'solid',
            background_effect: 'none',
            shadow_style: 'none',
            border_style: 'sharp',
            animation_style: 'none',
            avatar_display_style: 'square',
            content_block_style: 'white',
            color_mood: 'clean',
            spacing_scale: 'tight',
            font_pairing_id: 'retro-pixel',
        },
    },
    {
        id: 'risograph-print',
        label: 'Risograph Print',
        description: 'In risograph — giấy kem, màu neon và bóng offset xanh, cảm giác in ấn nghệ thuật.',
        design_language: 'risograph',
        surface_class: 'theme-surface-riso',
        tags: ['risograph', 'print', 'art', 'design', 'editorial', 'zine', 'poster'],
        overrides: {
            background_style: 'solid',
            background_effect: 'grain',
            shadow_style: 'offset',
            border_style: 'soft',
            animation_style: 'fade',
            avatar_display_style: 'arched',
            content_block_style: 'tinted',
            color_mood: 'pastel',
            spacing_scale: 'balanced',
            font_pairing_id: 'creative-riso',
        },
    },
    {
        id: 'editorial-luxe',
        label: 'Editorial sang trọng',
        description: 'Serif editorial, nền ảnh mờ, khoảng trắng rộng — phù hợp nhiếp ảnh và thời trang.',
        design_language: 'editorial',
        tags: ['editorial', 'luxury', 'fashion', 'photography', 'elegant', 'magazine'],
        overrides: {
            background_style: 'image',
            background_effect: 'grain',
            shadow_style: 'soft',
            border_style: 'none',
            animation_style: 'fade',
            avatar_display_style: 'ring',
            content_block_style: 'glass',
            color_mood: 'clean',
            spacing_scale: 'airy',
            font_pairing_id: 'classic-playfair',
        },
    },
];
const DEFAULT_STYLE_OPTION_COUNT = 6;
function inferTypographyStyle(input) {
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
function scorePresetForBrand(preset, input) {
    const context = `${input.brand_style} ${input.personality_traits.join(' ')} ${input.occupation} ${input.description}`.toLowerCase();
    let score = 0;
    for (const tag of preset.tags) {
        if (context.includes(tag)) {
            score += 3;
        }
    }
    if (/retro|game|developer|code|pixel|win95/.test(context) && preset.id === 'retro-pixel') {
        score += 8;
    }
    if (/phác thảo|sketch|doodle|hand|tay|illustration|vẽ/.test(context) && (preset.id === 'handrawn-cream' || preset.id === 'doodle-sketch')) {
        score += 8;
    }
    if (/in ấn|riso|zine|poster|print/.test(context) && preset.id === 'risograph-print') {
        score += 8;
    }
    if (/luxury|fashion|editorial|magazine|photo/.test(context) && preset.id === 'editorial-luxe') {
        score += 6;
    }
    if (/gradient|màu sắc|colorful|neon|vibrant/.test(context) && preset.id === 'vibrant-gradient') {
        score += 5;
    }
    if (/minimal|clean|professional|business/.test(context) && (preset.id === 'bold-solid' || preset.id === 'hero-photo')) {
        score += 4;
    }
    return score;
}
function selectDiverseStylePresetsForProfile(input, limit = 3) {
    const ranked = exports.UX_STYLE_PRESETS.map((preset) => ({
        preset,
        score: scorePresetForBrand(preset, input),
    })).sort((a, b) => b.score - a.score);
    const byBackgroundStyle = {
        image: ranked.filter((item) => item.preset.overrides.background_style === 'image'),
        gradient: ranked.filter((item) => item.preset.overrides.background_style === 'gradient'),
        solid: ranked.filter((item) => item.preset.overrides.background_style === 'solid'),
    };
    const selected = [];
    const addPreset = (preset) => {
        if (!preset || selected.some((item) => item.id === preset.id)) {
            return;
        }
        selected.push(preset);
    };
    addPreset(byBackgroundStyle.image[0]?.preset);
    addPreset(byBackgroundStyle.gradient[0]?.preset);
    addPreset(byBackgroundStyle.solid[0]?.preset);
    for (const item of ranked) {
        if (selected.length >= limit) {
            break;
        }
        addPreset(item.preset);
    }
    return selected.slice(0, limit);
}
function selectStylePresetsForProfile(input, limit = DEFAULT_STYLE_OPTION_COUNT) {
    const ranked = exports.UX_STYLE_PRESETS.map((preset) => ({
        preset,
        score: scorePresetForBrand(preset, input),
    })).sort((a, b) => b.score - a.score);
    const selected = new Map();
    const modernIds = new Set(['hero-photo', 'vibrant-gradient', 'bold-solid', 'editorial-luxe']);
    const expressiveIds = new Set(['handrawn-cream', 'doodle-sketch', 'risograph-print']);
    const characterIds = new Set(['retro-pixel', 'doodle-sketch', 'handrawn-cream', 'risograph-print']);
    const pickFrom = (ids) => {
        for (const item of ranked) {
            if (selected.size >= limit) {
                return;
            }
            if (ids.has(item.preset.id) && !selected.has(item.preset.id)) {
                selected.set(item.preset.id, item.preset);
            }
        }
    };
    pickFrom(modernIds);
    pickFrom(expressiveIds);
    pickFrom(characterIds);
    for (const item of ranked) {
        if (selected.size >= limit) {
            break;
        }
        if (!selected.has(item.preset.id)) {
            selected.set(item.preset.id, item.preset);
        }
    }
    return Array.from(selected.values()).slice(0, limit);
}
function buildUxProfileFromPreset(preset, input, baseUx) {
    const pairing = (0, font_catalog_1.inferFontPairingFromBrand)(input);
    const typographyStyle = baseUx?.typography_style ?? inferTypographyStyle(input);
    const presetFontPairingId = preset.overrides.font_pairing_id ?? baseUx?.font_pairing_id ?? pairing.id;
    return {
        design_language: preset.design_language,
        design_language_label: preset.label,
        color_mood: preset.overrides.color_mood ?? 'clean',
        background_style: preset.overrides.background_style ?? 'image',
        typography_style: typographyStyle,
        font_pairing_id: presetFontPairingId,
        font_family: baseUx?.font_family ?? pairing.bodyFont,
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
        surface_class: preset.surface_class,
        gallery_layout: 'column',
        gallery_appearance: 'exposed',
        interaction: baseUx?.interaction ?? { hover_scale: 1.02, transition_ms: 240, focus_ring: true },
        visual_hierarchy: baseUx?.visual_hierarchy ?? { title_emphasis: 'high', content_density: 'balanced' },
        reasoning: preset.description,
    };
}
