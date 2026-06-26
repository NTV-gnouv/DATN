import { DatabaseService } from '@/core/database/database.service';
export type AiChatRole = 'assistant' | 'user';
export type AiChatMessage = {
    role: AiChatRole;
    content: string;
    createdAt: string;
};
export type AiChatStatus = 'collecting' | 'ready' | 'generating' | 'choosing_style' | 'completed' | 'applied';
export type AiChatStyleOption = {
    id: string;
    label: string;
    description: string;
    uxDesign?: Record<string, unknown>;
    backgroundImageUrl?: string;
    preview: {
        themeTokens: Record<string, unknown>;
        headerPatch: Record<string, unknown>;
    };
};
export type AiChatSessionRecord = {
    id: string;
    userId: string;
    username: string;
    pageId?: string;
    status: AiChatStatus;
    currentStep: number;
    answers: Record<string, string>;
    profile?: Record<string, unknown>;
    styleOptions?: AiChatStyleOption[];
    selectedStyleId?: string;
    baseUx?: Record<string, unknown>;
    backgroundImageUrl?: string;
    messages: AiChatMessage[];
    createdAt: string;
    updatedAt: string;
};
export declare class AiChatRepository {
    private readonly databaseService;
    constructor(databaseService: DatabaseService);
    private mapRow;
    private writeSession;
    create(userId: string, username: string, firstMessages: string[], pageId?: string): Promise<AiChatSessionRecord>;
    get(sessionId: string): Promise<AiChatSessionRecord | null>;
    save(session: AiChatSessionRecord): Promise<AiChatSessionRecord>;
}
