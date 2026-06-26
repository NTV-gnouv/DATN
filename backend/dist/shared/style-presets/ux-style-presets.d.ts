import type { DesignLanguage, UxDesignInput, UxDesignProfile } from '@/shared/types/ux-design.types';
export type AvatarDisplayStylePreset = 'circle' | 'square' | 'arched' | 'ring' | 'horizontal';
export type BackgroundEffect = 'none' | 'sparkle' | 'shimmer' | 'grain';
export type ContentBlockStyle = 'white' | 'tinted' | 'glass' | 'contrast-soft';
export type UxStylePresetDefinition = {
    id: string;
    label: string;
    description: string;
    design_language: DesignLanguage;
    surface_class?: string;
    tags: string[];
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
    backgroundImageUrl?: string;
    preview: {
        themeTokens: Record<string, unknown>;
        headerPatch: Record<string, unknown>;
    };
};
export declare const UX_STYLE_PRESETS: UxStylePresetDefinition[];
export declare function selectDiverseStylePresetsForProfile(input: UxDesignInput, limit?: number): UxStylePresetDefinition[];
export declare function selectStylePresetsForProfile(input: UxDesignInput, limit?: number): UxStylePresetDefinition[];
export declare function buildUxProfileFromPreset(preset: UxStylePresetDefinition, input: UxDesignInput, baseUx?: Partial<UxDesignProfile>): UxDesignProfile;
