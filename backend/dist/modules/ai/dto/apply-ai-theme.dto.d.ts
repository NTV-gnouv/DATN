export declare class SocialLinkDto {
    platform: string;
    url: string;
}
export declare class AiAnswersDto {
    displayName: string;
    bio: string;
    category: string;
    targetAudience: string;
    tone: string;
    preferredFont: string;
    colorStyle: string;
    primaryColor: string;
    accentColor: string;
    includeSocials: boolean;
    socials?: SocialLinkDto[];
    includeBackgroundImage: boolean;
    backgroundQuery?: string;
    notes?: string;
}
export declare class ApplyAiThemeDto {
    pageId: string;
    answers: AiAnswersDto;
}
