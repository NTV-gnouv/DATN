import type { BrandProfileInput } from '@/shared/types/brand-profile.types';
export declare const BRAND_PROFILE_LIMITS: {
    readonly shortBio: 90;
    readonly longBio: 180;
    readonly brandStyle: 80;
    readonly galleryTitle: 50;
    readonly galleryDescription: 80;
};
export declare function buildBrandProfilePrompt(input: BrandProfileInput): string;
