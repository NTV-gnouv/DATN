import { Injectable } from '@nestjs/common';

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

@Injectable()
export class AiChatRepository {
  private readonly entityName = 'ai-chat-sessions';

  constructor(private readonly databaseService: DatabaseService) {}

  async create(userId: string, username: string, firstMessages: string[]): Promise<AiChatSessionRecord> {
    const now = new Date().toISOString();
    const id = `ai-chat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const session: AiChatSessionRecord = {
      id,
      userId,
      username,
      status: 'collecting',
      currentStep: 0,
      answers: {},
      messages: firstMessages.map((content) => ({
        role: 'assistant',
        content,
        createdAt: now,
      })),
      createdAt: now,
      updatedAt: now,
    };

    await this.databaseService.writeRecord(this.entityName, id, session as unknown as Record<string, unknown>);
    return session;
  }

  async get(sessionId: string): Promise<AiChatSessionRecord | null> {
    const record = await this.databaseService.readRecord(this.entityName, sessionId);
    if (!record) {
      return null;
    }
    return record as unknown as AiChatSessionRecord;
  }

  async save(session: AiChatSessionRecord): Promise<AiChatSessionRecord> {
    const nextSession = {
      ...session,
      updatedAt: new Date().toISOString(),
    };
    await this.databaseService.writeRecord(this.entityName, nextSession.id, nextSession as unknown as Record<string, unknown>);
    return nextSession;
  }
}
