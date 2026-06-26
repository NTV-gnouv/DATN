import { Injectable } from '@nestjs/common';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

import { DatabaseService } from '@/core/database/database.service';
import { normalizeJsonPayload } from '@/core/database/json-payload.util';
import { OnboardingSession, OnboardingStep } from '@/shared/types/onboarding.types';

import { OnboardingSessionEntity } from './onboarding.entity';

type OnboardingRow = RowDataPacket & {
  id: string;
  user_id: string;
  page_id: string | null;
  status: string;
  current_step: number;
  session_data: unknown;
  started_at: Date;
  completed_at: Date | null;
  updated_at: Date;
};

@Injectable()
export class OnboardingRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  private mapRow(row: OnboardingRow): OnboardingSession {
    const sessionData = normalizeJsonPayload(row.session_data);
    return {
      id: row.id,
      userId: row.user_id,
      ...(row.page_id ? { pageId: row.page_id } : {}),
      status: row.status as OnboardingSession['status'],
      currentStep: row.current_step as OnboardingStep,
      startedAt: row.started_at,
      ...(row.completed_at ? { completedAt: row.completed_at } : {}),
      updatedAt: row.updated_at,
      ...sessionData,
    } as OnboardingSession;
  }

  private async writeSession(session: OnboardingSession): Promise<void> {
    const {
      id,
      userId,
      pageId,
      status,
      currentStep,
      startedAt,
      completedAt,
      updatedAt,
      ...sessionData
    } = session as OnboardingSession & Record<string, unknown>;

    await this.databaseService.execute(
      `INSERT INTO onboarding_sessions (id, user_id, page_id, status, current_step, session_data, started_at, completed_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         user_id = VALUES(user_id),
         page_id = VALUES(page_id),
         status = VALUES(status),
         current_step = VALUES(current_step),
         session_data = VALUES(session_data),
         completed_at = VALUES(completed_at),
         updated_at = VALUES(updated_at)`,
      [
        id,
        userId,
        pageId ?? null,
        status,
        currentStep,
        JSON.stringify(sessionData),
        startedAt,
        completedAt ?? null,
        updatedAt,
      ],
    );
  }

  async create(data: Omit<OnboardingSession, 'id' | 'startedAt' | 'updatedAt'>): Promise<OnboardingSession> {
    const entity = OnboardingSessionEntity.create(data);
    await this.writeSession(entity as OnboardingSession);
    return entity as OnboardingSession;
  }

  async findById(id: string): Promise<OnboardingSession | null> {
    const [rows] = await this.databaseService.execute<OnboardingRow[]>(
      `SELECT id, user_id, page_id, status, current_step, session_data, started_at, completed_at, updated_at
       FROM onboarding_sessions WHERE id = ? LIMIT 1`,
      [id],
    );
    const row = rows[0];
    return row ? this.mapRow(row) : null;
  }

  async findByUserId(userId: string): Promise<OnboardingSession[]> {
    const [rows] = await this.databaseService.execute<OnboardingRow[]>(
      `SELECT id, user_id, page_id, status, current_step, session_data, started_at, completed_at, updated_at
       FROM onboarding_sessions WHERE user_id = ? ORDER BY updated_at DESC`,
      [userId],
    );
    return rows.map((row) => this.mapRow(row));
  }

  async findActiveSession(userId: string): Promise<OnboardingSession | null> {
    const [rows] = await this.databaseService.execute<OnboardingRow[]>(
      `SELECT id, user_id, page_id, status, current_step, session_data, started_at, completed_at, updated_at
       FROM onboarding_sessions WHERE user_id = ? AND status = 'in_progress' LIMIT 1`,
      [userId],
    );
    const row = rows[0];
    return row ? this.mapRow(row) : null;
  }

  async update(id: string, data: Partial<OnboardingSession>): Promise<OnboardingSession> {
    const existing = await this.findById(id);
    if (!existing) throw new Error(`Session ${id} not found`);

    const updated: OnboardingSession = { ...existing, ...data, updatedAt: new Date() };
    await this.writeSession(updated);
    return updated;
  }

  async updateStep(id: string, step: OnboardingStep, stepData: unknown): Promise<OnboardingSession> {
    const existing = await this.findById(id);
    if (!existing) throw new Error(`Session ${id} not found`);

    const stepKey = `step${step}` as const;
    const existingRecord = existing as unknown as Record<string, unknown>;
    existingRecord[stepKey] = {
      ...(existingRecord[stepKey] as Record<string, unknown> | undefined),
      ...(stepData as Record<string, unknown>),
    };
    existing.currentStep = (step < 4 ? step + 1 : 4) as OnboardingStep;
    existing.updatedAt = new Date();

    await this.writeSession(existing);
    return existing;
  }

  async completeSession(id: string): Promise<OnboardingSession> {
    const existing = await this.findById(id);
    if (!existing) throw new Error(`Session ${id} not found`);

    existing.status = 'completed';
    existing.completedAt = new Date();
    existing.updatedAt = new Date();

    await this.writeSession(existing);
    return existing;
  }

  async abandonSession(id: string): Promise<OnboardingSession> {
    const existing = await this.findById(id);
    if (!existing) throw new Error(`Session ${id} not found`);

    existing.status = 'abandoned';
    existing.updatedAt = new Date();

    await this.writeSession(existing);
    return existing;
  }

  async delete(id: string): Promise<boolean> {
    const [result] = await this.databaseService.execute<ResultSetHeader>(
      `DELETE FROM onboarding_sessions WHERE id = ?`,
      [id],
    );
    return result.affectedRows > 0;
  }
}
