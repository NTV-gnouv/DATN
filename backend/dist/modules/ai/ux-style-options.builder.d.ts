import type { BrandProfile } from '@/shared/types/brand-profile.types';
import type { UxDesignProfile } from '@/shared/types/ux-design.types';
import { type UxStylePresetDefinition, type UxStyleOption } from '@/shared/style-presets/ux-style-presets';
export declare function buildStyleOptionsFromProfile(profile: BrandProfile, options: {
    backgroundImageUrl?: string;
    pageKey: string;
    baseUx?: UxDesignProfile;
}): UxStyleOption[];
export declare function buildStyleOptionsForPresets(profile: BrandProfile, presets: UxStylePresetDefinition[], options: {
    backgroundImageUrl?: string;
    backgroundImageUrls?: string[];
    pageKey: string;
    baseUx?: UxDesignProfile;
}): UxStyleOption[];
export type { UxStyleOption };
