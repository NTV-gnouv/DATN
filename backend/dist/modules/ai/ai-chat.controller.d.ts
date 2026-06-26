import { SubmitAiChatSocialsDto } from './dto/submit-ai-chat-socials.dto';
import { ApplyAiChatStyleDto } from './dto/apply-ai-chat-style.dto';
import { AiChatService } from './ai-chat.service';
export declare class StartAiChatDto {
    userId: string;
    username?: string;
    pageId?: string;
}
export declare class SendAiChatMessageDto {
    message: string;
}
export declare class AiChatController {
    private readonly aiChatService;
    constructor(aiChatService: AiChatService);
    start(body: StartAiChatDto): Promise<{
        newMessages: import("./ai-chat.repository").AiChatMessage[];
        awaitingInput: boolean;
        canGenerate: boolean;
        session: import("./ai-chat.repository").AiChatSessionRecord;
        inputType: "text" | "none" | "socials";
    }>;
    getSession(sessionId: string): Promise<{
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
        session: import("./ai-chat.repository").AiChatSessionRecord;
        inputType: "text" | "none" | "socials";
    }>;
    sendMessage(sessionId: string, body: SendAiChatMessageDto): Promise<{
        newMessages: import("./ai-chat.repository").AiChatMessage[];
        awaitingInput: boolean;
        canGenerate: boolean;
        session: import("./ai-chat.repository").AiChatSessionRecord;
        inputType: "text" | "none" | "socials";
    } | {
        newMessages: import("./ai-chat.repository").AiChatMessage[];
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
        session: import("./ai-chat.repository").AiChatSessionRecord;
        inputType: "text" | "none" | "socials";
    }>;
    submitSocials(sessionId: string, body: SubmitAiChatSocialsDto): Promise<{
        newMessages: import("./ai-chat.repository").AiChatMessage[];
        awaitingInput: boolean;
        canGenerate: boolean;
        avatarUrl: string | undefined;
        displayName: string | undefined;
        session: import("./ai-chat.repository").AiChatSessionRecord;
        inputType: "text" | "none" | "socials";
    } | {
        newMessages: never[];
        awaitingInput: boolean;
        canGenerate: boolean;
        formError: string;
        session: import("./ai-chat.repository").AiChatSessionRecord;
        inputType: "text" | "none" | "socials";
    } | {
        newMessages: never[];
        awaitingInput: boolean;
        canGenerate: boolean;
        socialErrors: Partial<Record<import("../social-profiles/social-profiles.types").SupportedSocialPlatform, string>>;
        session: import("./ai-chat.repository").AiChatSessionRecord;
        inputType: "text" | "none" | "socials";
    }>;
    goBack(sessionId: string): Promise<{
        newMessages: import("./ai-chat.repository").AiChatMessage[];
        awaitingInput: boolean;
        canGenerate: boolean;
        prefillValue: string | undefined;
        socialPrefill: {
            tiktok: string;
            instagram: string;
            youtube: string;
            x: string;
        } | undefined;
        session: import("./ai-chat.repository").AiChatSessionRecord;
        inputType: "text" | "none" | "socials";
    }>;
    generate(sessionId: string): Promise<{
        session: import("./ai-chat.repository").AiChatSessionRecord;
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
        newMessages: import("./ai-chat.repository").AiChatMessage[];
        pageId?: undefined;
        profile?: undefined;
    } | {
        session: import("./ai-chat.repository").AiChatSessionRecord;
        pageId: string;
        profile: Record<string, unknown> | null;
        newMessages: import("./ai-chat.repository").AiChatMessage[];
        styleOptions?: undefined;
        awaitingStyleChoice?: undefined;
    }>;
    applyStyle(sessionId: string, body: ApplyAiChatStyleDto): Promise<{
        session: import("./ai-chat.repository").AiChatSessionRecord;
        pageId: string;
        slug: string;
        profile: import("../../shared/types/brand-profile.types").BrandProfile;
        uxDesign: import("../../shared/types/ux-design.types").UxDesignProfile;
        images: {
            galleryUrls: string[];
            backgroundUrl: string;
            avatarUrl: string;
        };
        newMessages: import("./ai-chat.repository").AiChatMessage[];
        awaitingStyleChoice: boolean;
    }>;
}
