import { Injectable } from '@nestjs/common';
import { RowDataPacket } from 'mysql2/promise';

import { DatabaseService } from '@/core/database/database.service';
import { normalizeJsonPayload } from '@/core/database/json-payload.util';

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

type AiChatRow = RowDataPacket & {
  id: string;
  user_id: string;
  username: string;
  page_id: string | null;
  status: string;
  current_step: number;
  session_data: unknown;
  created_at: Date;
  updated_at: Date;
};

@Injectable()
export class AiChatRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  private mapRow(row: AiChatRow): AiChatSessionRecord {
    const sessionData = normalizeJsonPayload(row.session_data);
    return {
      id: row.id,
      userId: row.user_id,
      username: row.username,
      ...(row.page_id ? { pageId: row.page_id } : {}),
      status: row.status as AiChatStatus,
      currentStep: row.current_step,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
      ...sessionData,
    } as AiChatSessionRecord;
  }

  private async writeSession(session: AiChatSessionRecord): Promise<void> {
    const {
      id,
      userId,
      username,
      pageId,
      status,
      currentStep,
      ...sessionData
    } = session;

    await this.databaseService.execute(
      `INSERT INTO ai_chat_sessions (id, user_id, username, page_id, status, current_step, session_data)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         user_id = VALUES(user_id),
         username = VALUES(username),
         page_id = VALUES(page_id),
         status = VALUES(status),
         current_step = VALUES(current_step),
         session_data = VALUES(session_data),
         updated_at = CURRENT_TIMESTAMP`,
      [
        id,
        userId,
        username,
        pageId ?? null,
        status,
        currentStep,
        JSON.stringify(sessionData),
      ],
    );
  }

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

    await this.writeSession(session);
    return session;
  }

  async get(sessionId: string): Promise<AiChatSessionRecord | null> {
    const [rows] = await this.databaseService.execute<AiChatRow[]>(
      `SELECT id, user_id, username, page_id, status, current_step, session_data, created_at, updated_at
       FROM ai_chat_sessions WHERE id = ? LIMIT 1`,
      [sessionId],
    );
    const row = rows[0];
    return row ? this.mapRow(row) : null;
  }

  async save(session: AiChatSessionRecord): Promise<AiChatSessionRecord> {
    const nextSession = {
      ...session,
      updatedAt: new Date().toISOString(),
    };
    await this.writeSession(nextSession);
    return nextSession;
  }
}
