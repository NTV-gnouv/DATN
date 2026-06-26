import { ApplyAiThemeDto } from './dto/apply-ai-theme.dto';
import { AutoAiThemeDto } from './dto/auto-ai-theme.dto';
import { ApplyAiChatDto, SendAiChatMessageDto, StartAiChatDto } from './dto/ai-chat.dto';
import { AiService } from './ai.service';
export declare class AiController {
    private readonly aiService;
    constructor(aiService: AiService);
    startChat(body: StartAiChatDto): Promise<{
        session: import("./ai.repository").AiChatSessionRecord;
        assistantMessage: string;
        nextPrompt: string;
        canApply: boolean;
    }>;
    getSession(sessionId: string): Promise<{
        session: import("./ai.repository").AiChatSessionRecord;
        canApply: boolean;
    }>;
    sendMessage(body: SendAiChatMessageDto): Promise<{
        session: import("./ai.repository").AiChatSessionRecord;
        assistantMessage: string;
        nextPrompt: null;
        canApply: boolean;
    } | {
        session: import("./ai.repository").AiChatSessionRecord;
        assistantMessage: string;
        nextPrompt: string;
        canApply: boolean;
    }>;
    applyChatTheme(body: ApplyAiChatDto): Promise<{
        session: import("./ai.repository").AiChatSessionRecord;
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
    applyTheme(body: ApplyAiThemeDto): Promise<{
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
    autoApplyTheme(body: AutoAiThemeDto): Promise<{
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
}
