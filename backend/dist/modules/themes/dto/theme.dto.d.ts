import { ThemeSocialLink, ThemeColors, ThemeTypography, ThemeLayout, ThemeBorders, ThemeEffects, ThemeComponents } from '@/shared/types/theme.types';
declare class SocialLinkDto implements ThemeSocialLink {
    platform: string;
    url: string;
    icon?: string;
}
declare class ColorsDto implements Partial<ThemeColors> {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    textLight: string;
    border: string;
    success?: string;
    warning?: string;
    error?: string;
}
declare class TypographyDto implements Partial<ThemeTypography> {
    fontFamily: string;
    headingSize: number;
    bodySize: number;
    headingWeight: number;
    bodyWeight: number;
    lineHeight: number;
    letterSpacing?: number;
}
declare class LayoutDto implements Partial<ThemeLayout> {
    maxWidth: number;
    padding: number;
    gap: number;
    alignment: 'center' | 'left' | 'right';
    borderRadius?: number;
}
declare class BordersDto implements Partial<ThemeBorders> {
    radius: number;
    width: number;
    style: 'solid' | 'dashed' | 'dotted';
    color: string;
}
declare class EffectsDto implements Partial<ThemeEffects> {
    shadowEnabled: boolean;
    shadowIntensity: 'light' | 'medium' | 'heavy';
    shadowColor?: string;
    transitionDuration: number;
    hoverScale: number;
    borderAnimation?: string;
    fadeInOnLoad?: boolean;
    parallaxEnabled?: boolean;
}
declare class ComponentsDto implements Partial<ThemeComponents> {
    cardStyle: 'flat' | 'elevated' | 'outlined';
    buttonStyle: 'flat' | 'elevated' | 'outlined';
    avatarShape: 'circle' | 'square' | 'rounded';
    headerStyle?: 'minimal' | 'bold' | 'gradient';
}
export declare class CreateThemeDto {
    name: string;
    description?: string;
    pageId: string;
    username: string;
    displayName: string;
    description_text: string;
    industry: string;
    socialLinks?: SocialLinkDto[];
    avatar?: string;
    colors: ColorsDto;
    typography: TypographyDto;
    layout: LayoutDto;
    borders: BordersDto;
    effects: EffectsDto;
    components: ComponentsDto;
    customCss?: string;
    tone?: string;
    preferredStyle?: string;
}
export declare class UpdateThemeDto {
    name?: string;
    description?: string;
    colors?: Partial<ColorsDto>;
    typography?: Partial<TypographyDto>;
    layout?: Partial<LayoutDto>;
    borders?: Partial<BordersDto>;
    effects?: Partial<EffectsDto>;
    components?: Partial<ComponentsDto>;
    customCss?: string;
}
export declare class GenerateThemeDto {
    username: string;
    displayName: string;
    description: string;
    industry: string;
    socialLinks?: SocialLinkDto[];
    tone?: string;
    preferredStyle?: string;
}
export {};
