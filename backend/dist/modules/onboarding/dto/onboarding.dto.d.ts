import { SocialPlatform, SocialLink } from '@/shared/types/onboarding.types';
export declare class SocialLinkDto implements SocialLink {
    platform: SocialPlatform;
    username: string;
    url?: string;
}
export declare class SubmitStep1Dto {
    socialLinks: SocialLinkDto[];
}
export declare class SubmitStep2Dto {
    isConfirmed: boolean;
    avatar?: string;
    bio?: string;
    displayName?: string;
    interests?: string[];
}
export declare class SubmitStep3Dto {
    editedPrompt?: string;
    tags?: string[];
    selectedTemplate?: string;
}
export declare class SubmitStep4Dto {
    confirmFinal: boolean;
}
export declare class GetOnboardingSessionDto {
    sessionId: string;
}
export declare class StartOnboardingDto {
    pageId?: string;
    userId: string;
}
