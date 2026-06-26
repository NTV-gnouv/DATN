import { MediaService } from '@/modules/media/media.service';
import { PagesService } from '@/modules/pages/pages.service';
import { SocialProfilesService } from '@/modules/social-profiles/social-profiles.service';
import type { SupportedSocialPlatform } from '@/modules/social-profiles/social-profiles.types';
import { BrandProfileService } from './brand-profile.service';
import { AiChatMessage, AiChatRepository, AiChatSessionRecord } from './ai-chat.repository';
import { LandingBuilderService } from './landing-builder.service';
import { UxDesignService } from './ux-design.service';
import type { UxDesignProfile } from '@/shared/types/ux-design.types';
export declare class AiChatService {
    private readonly aiChatRepository;
    private readonly brandProfileService;
    private readonly landingBuilderService;
    private readonly uxDesignService;
    private readonly mediaService;
    private readonly socialProfilesService;
    private readonly pagesService;
    private readonly logger;
    constructor(aiChatRepository: AiChatRepository, brandProfileService: BrandProfileService, landingBuilderService: LandingBuilderService, uxDesignService: UxDesignService, mediaService: MediaService, socialProfilesService: SocialProfilesService, pagesService: PagesService);
    getCurrentInputType(currentStep: number): 'text' | 'socials' | 'none';
    private buildSessionPayload;
    startChat(userId: string, username: string, pageId?: string): Promise<{
        newMessages: AiChatMessage[];
        awaitingInput: boolean;
        canGenerate: boolean;
        session: AiChatSessionRecord;
        inputType: "text" | "none" | "socials";
    }>;
    getChatSession(sessionId: string): Promise<{
        canGenerate: boolean;
        styleOptions: {
            id: string;
            label: string;
            description: string;
            backgroundImageUrl?: string;
            preview: {
                themeTokens: Record<string, unknown>;
                headerPatch: Record<string, unknown>;
            };
        }[];
        awaitingStyleChoice: boolean;
        session: AiChatSessionRecord;
        inputType: "text" | "none" | "socials";
    }>;
    sendChatMessage(sessionId: string, message: string): Promise<{
        newMessages: AiChatMessage[];
        awaitingInput: boolean;
        canGenerate: boolean;
        session: AiChatSessionRecord;
        inputType: "text" | "none" | "socials";
    } | {
        newMessages: AiChatMessage[];
        awaitingInput: boolean;
        canGenerate: boolean;
        styleOptions: {
            id: string;
            label: string;
            description: string;
            backgroundImageUrl?: string;
            preview: {
                themeTokens: Record<string, unknown>;
                headerPatch: Record<string, unknown>;
            };
        }[];
        awaitingStyleChoice: boolean;
        session: AiChatSessionRecord;
        inputType: "text" | "none" | "socials";
    }>;
    submitSocials(sessionId: string, payload: {
        tiktok?: string;
        instagram?: string;
        youtube?: string;
        x?: string;
    }): Promise<{
        newMessages: AiChatMessage[];
        awaitingInput: boolean;
        canGenerate: boolean;
        avatarUrl: string | undefined;
        displayName: string | undefined;
        session: AiChatSessionRecord;
        inputType: "text" | "none" | "socials";
    } | {
        newMessages: never[];
        awaitingInput: boolean;
        canGenerate: boolean;
        formError: string;
        session: AiChatSessionRecord;
        inputType: "text" | "none" | "socials";
    } | {
        newMessages: never[];
        awaitingInput: boolean;
        canGenerate: boolean;
        socialErrors: Partial<Record<SupportedSocialPlatform, string>>;
        session: AiChatSessionRecord;
        inputType: "text" | "none" | "socials";
    }>;
    goBack(sessionId: string): Promise<{
        newMessages: AiChatMessage[];
        awaitingInput: boolean;
        canGenerate: boolean;
        prefillValue: string | undefined;
        socialPrefill: {
            tiktok: string;
            instagram: string;
            youtube: string;
            x: string;
        } | undefined;
        session: AiChatSessionRecord;
        inputType: "text" | "none" | "socials";
    }>;
    private completeSocialStep;
    generateLandingPage(sessionId: string): Promise<{
        session: AiChatSessionRecord;
        styleOptions: {
            id: string;
            label: string;
            description: string;
            backgroundImageUrl?: string;
            preview: {
                themeTokens: Record<string, unknown>;
                headerPatch: Record<string, unknown>;
            };
        }[];
        awaitingStyleChoice: boolean;
        newMessages: AiChatMessage[];
        pageId?: undefined;
        profile?: undefined;
    } | {
        session: AiChatSessionRecord;
        pageId: string;
        profile: Record<string, unknown> | null;
        newMessages: AiChatMessage[];
        styleOptions?: undefined;
        awaitingStyleChoice?: undefined;
    }>;
    applyStyleChoice(sessionId: string, styleOptionId: string): Promise<{
        session: AiChatSessionRecord;
        pageId: string;
        slug: string;
        profile: import("@/shared/types/brand-profile.types").BrandProfile;
        uxDesign: UxDesignProfile;
        images: {
            galleryUrls: string[];
            backgroundUrl: string;
            avatarUrl: string;
        };
        newMessages: AiChatMessage[];
        awaitingStyleChoice: boolean;
    }>;
    private completeLandingBuild;
    private persistSocialAvatar;
    private requireSession;
    private toAssistantMessage;
    private appendMessage;
    private appendMessages;
}
