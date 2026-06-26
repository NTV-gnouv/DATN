import type { GeneratedDesignProfile } from '../theme-engine.mapping';
declare class EngineSocialLinkDto {
    platform: string;
    username?: string;
    url?: string;
}
declare class ThemeEngineCustomizationsDto {
    mainBackgroundColor?: string;
    mainTextColor?: string;
    reviewFontSize?: number;
}
export declare class ThemeEngineProfileInputDto {
    username?: string;
    displayName: string;
    description: string;
    industry?: string;
    tone?: string;
    socialLinks?: EngineSocialLinkDto[];
    customizations?: ThemeEngineCustomizationsDto;
}
export declare class ThemeEngineMapDto {
    profile: ThemeEngineProfileInputDto;
    designProfile: GeneratedDesignProfile;
}
export declare class ThemeEngineApplyDto extends ThemeEngineMapDto {
    pageId: string;
}
export declare class ThemeEnginePipelineDto {
    pageId: string;
    profile: ThemeEngineProfileInputDto;
}
export {};
