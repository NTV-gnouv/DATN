export type DesignColorMood = 'clean' | 'vibrant' | 'dark' | 'warm' | 'pastel';
export type DesignBackgroundStyle = 'solid' | 'gradient' | 'image';
export type DesignTypographyStyle = 'modern' | 'editorial' | 'friendly' | 'minimal' | 'bold';
export type DesignBorderStyle = 'none' | 'soft' | 'sharp';
export type DesignShadowStyle = 'none' | 'soft' | 'strong';
export type DesignAnimationStyle = 'none' | 'fade' | 'float' | 'pulse' | 'gradient-shift';
export type DesignLayoutStyle = 'centered' | 'compact' | 'split';
export type GeneratedDesignProfile = {
    industry: string;
    tone: string;
    colorMood: DesignColorMood;
    backgroundStyle: DesignBackgroundStyle;
    typographyStyle: DesignTypographyStyle;
    borderStyle: DesignBorderStyle;
    shadowStyle: DesignShadowStyle;
    animationStyle: DesignAnimationStyle;
    layoutStyle: DesignLayoutStyle;
    reasoning: string;
};
type Palette = {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    textLight: string;
    border: string;
};
export declare const THEME_ENGINE_MAPPING: {
    palettes: Record<DesignColorMood, Palette>;
    background: Record<DesignBackgroundStyle, Record<string, unknown>>;
    typography: Record<DesignTypographyStyle, {
        fontFamily: string;
        headingWeight: number;
        bodyWeight: number;
        headingSize: number;
        bodySize: number;
        lineHeight: number;
    }>;
    borders: Record<DesignBorderStyle, {
        width: number;
        style: "none" | "solid";
        radius: number;
    }>;
    shadows: Record<DesignShadowStyle, {
        enabled: boolean;
        x: number;
        y: number;
        blur: number;
        spread: number;
        color: string;
    }>;
    layout: Record<DesignLayoutStyle, {
        widthPercent: number;
        alignment: "left" | "center" | "right";
    }>;
};
export {};
