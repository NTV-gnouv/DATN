import { DatabaseService } from '@/core/database/database.service';
export type AiChatRole = 'assistant' | 'user';
export type AiChatMessage = {
    role: AiChatRole;
    content: string;
    createdAt: string;
};
export type AiChatStatus = 'collecting' | 'ready' | 'applied';
export type AiChatSessionRecord = {
    id: string;
    pageId: string;
    status: AiChatStatus;
    currentStep: number;
    answers: Record<string, unknown>;
    messages: AiChatMessage[];
    createdAt: string;
    updatedAt: string;
};
export declare class AiRepository {
    private readonly databaseService;
    private readonly entityName;
    constructor(databaseService: DatabaseService);
    create(pageId: string, firstAssistantMessage: string): Promise<AiChatSessionRecord>;
    get(sessionId: string): Promise<AiChatSessionRecord | null>;
    save(session: AiChatSessionRecord): Promise<AiChatSessionRecord>;
}
