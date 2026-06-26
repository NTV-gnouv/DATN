import { ConfigService } from '@nestjs/config';
import { PagesService } from '@/modules/pages/pages.service';
import { AiRepository, type AiChatSessionRecord } from './ai.repository';
import { type ApplyAiThemeDto } from './dto/apply-ai-theme.dto';
import { type AutoAiThemeDto } from './dto/auto-ai-theme.dto';
type SocialLinkInput = {
    platform: string;
    url: string;
};
type AiAnswers = {
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
    socials?: SocialLinkInput[];
    includeBackgroundImage: boolean;
    backgroundQuery?: string;
    notes?: string;
};
export declare class AiService {
    private readonly configService;
    private readonly pagesService;
    private readonly aiRepository;
    constructor(configService: ConfigService, pagesService: PagesService, aiRepository: AiRepository);
    startChat(pageId: string): Promise<{
        session: AiChatSessionRecord;
        assistantMessage: string;
        nextPrompt: string;
        canApply: boolean;
    }>;
    getChatSession(sessionId: string): Promise<{
        session: AiChatSessionRecord;
        canApply: boolean;
    }>;
    sendChatMessage(sessionId: string, message: string): Promise<{
        session: AiChatSessionRecord;
        assistantMessage: string;
        nextPrompt: null;
        canApply: boolean;
    } | {
        session: AiChatSessionRecord;
        assistantMessage: string;
        nextPrompt: string;
        canApply: boolean;
    }>;
    applyChatSession(sessionId: string): Promise<{
        session: AiChatSessionRecord;
        assistantMessage: string;
        pageId: string;
        themeId: string;
        suggestedTagline: string;
        pexelsImageUrl: string | null;
        editorConfig: {
            pageId: string;
            themeId: string;
            themeTokens: Record<string, unknown> | null;
            headerBlockId: string;
            headerBlock: Record<string, unknown> | null;
        };
    }>;
    applyAiTheme(payload: ApplyAiThemeDto | {
        pageId: string;
        answers: AiAnswers;
    }): Promise<{
        pageId: string;
        themeId: string;
        suggestedTagline: string;
        pexelsImageUrl: string | null;
        editorConfig: {
            pageId: string;
            themeId: string;
            themeTokens: Record<string, unknown> | null;
            headerBlockId: string;
            headerBlock: Record<string, unknown> | null;
        };
    }>;
    autoApplyAiTheme(payload: AutoAiThemeDto): Promise<{
        pageId: string;
        themeId: string;
        suggestedTagline: string;
        pexelsImageUrl: string | null;
        editorConfig: {
            pageId: string;
            themeId: string;
            themeTokens: Record<string, unknown> | null;
            headerBlockId: string;
            headerBlock: Record<string, unknown> | null;
        };
    }>;
    private normalizeAnswers;
    private resolveStepPrompt;
    private parseSocialLinksFromText;
    private readSocialLinks;
    private buildCustomerPromptTemplate;
    private resolveFinalPrompt;
    private buildStepAnswers;
    private findNextStepIndex;
    private buildReadyMessage;
    private buildAnswersFromSession;
    private buildProfileAnalysis;
    private buildPaletteOptions;
    private buildThemeChoicePrompt;
    private parseThemeChoice;
    private readProfileAnalysis;
    private readPaletteOptions;
    private readThemeChoice;
    private resolveSelectedPalette;
    private resolveBackgroundMode;
    private inferBackgroundQueryFromBrief;
    private inferAnswersFromBrief;
    private extractNameFromBrief;
    private appendUserMessage;
    private appendAssistantMessage;
    private generateThemeSuggestion;
    private buildGeminiThemePrompt;
    private buildDeterministicThemeSuggestion;
    private requestGeminiRawText;
    private delay;
    private isTransientGeminiError;
    private normalizeGeminiSuggestion;
    private searchPexelsImage;
    private searchPexelsImageWithFallbacks;
    private buildNextHeaderBlock;
}
export {};
