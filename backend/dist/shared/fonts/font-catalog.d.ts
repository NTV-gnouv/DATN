export type FontCategory = 'modern' | 'classic' | 'creative' | 'future' | 'logo';
export type FontPairing = {
    id: string;
    category: FontCategory;
    label: string;
    displayFont: string;
    bodyFont: string;
    headingWeight: number;
    bodyWeight: number;
    headingSize: number;
    bodySize: number;
    lineHeight: number;
    headingLetterSpacing: number;
    headingTransform: 'none' | 'uppercase';
    tags: string[];
};
export declare const FONT_CATEGORY_LABELS: Record<FontCategory, string>;
export declare const FONT_PAIRINGS: FontPairing[];
export declare function getFontPairing(id: string | undefined | null): FontPairing;
export declare function listFontPairingIds(): string[];
export declare function buildFontCatalogPromptSection(): string;
export declare function inferFontPairingFromBrand(input: {
    brand_style: string;
    personality_traits: string[];
    occupation: string;
    description: string;
}): FontPairing;
