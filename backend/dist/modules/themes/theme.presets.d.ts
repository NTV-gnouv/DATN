import { ThemeTemplate, ColorPalette } from '@/shared/types/theme.types';
export declare const INDUSTRY_COLOR_PALETTES: Record<string, ColorPalette[]>;
export declare const THEME_TEMPLATES: ThemeTemplate[];
export declare const AVAILABLE_FONTS: {
    id: string;
    name: string;
    family: string;
}[];
export declare function getDefaultPaletteForIndustry(industry: string): ColorPalette;
export declare function getAlternativePalettes(industry: string, exclude?: string): ColorPalette[];
