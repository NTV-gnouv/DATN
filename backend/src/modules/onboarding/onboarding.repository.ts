import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@/core/database/database.service';
import { OnboardingSession, OnboardingStep } from '@/shared/types/onboarding.types';
import { OnboardingSessionEntity } from './onboarding.entity';

@Injectable()
export class OnboardingRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  private readonly entityName = 'onboarding_sessions';

  async create(data: Omit<OnboardingSession, 'id' | 'startedAt' | 'updatedAt'>): Promise<OnboardingSession> {
    const entity = OnboardingSessionEntity.create(data);
    await this.databaseService.writeRecord(this.entityName, entity.id, entity as unknown as Record<string, unknown>);
    return entity as OnboardingSession;
  }

  async findById(id: string): Promise<OnboardingSession | null> {
    const record = await this.databaseService.readRecord(this.entityName, id);
    return (record as unknown as OnboardingSession) || null;
  }

  async findByUserId(userId: string): Promise<OnboardingSession[]> {
    const records = await this.databaseService.readEntity(this.entityName);
    return records
      .filter((r: any) => r.data.userId === userId)
      .map((r: any) => r.data as OnboardingSession);
  }

  async findActiveSession(userId: string): Promise<OnboardingSession | null> {
    const records = await this.databaseService.readEntity(this.entityName);
    const active = records.find((r: any) => r.data.userId === userId && r.data.status === 'in_progress');
    return (active?.data as unknown as OnboardingSession) || null;
  }

  async update(id: string, data: Partial<OnboardingSession>): Promise<OnboardingSession> {
    const existing = await this.findById(id);
    if (!existing) throw new Error(`Session ${id} not found`);

    const updated: OnboardingSession = { ...existing, ...data, updatedAt: new Date() };
    await this.databaseService.writeRecord(this.entityName, id, updated as unknown as Record<string, unknown>);
    return updated;
  }

  async updateStep(
    id: string,
    step: OnboardingStep,
    stepData: any,
  ): Promise<OnboardingSession> {
    const existing = await this.findById(id);
    if (!existing) throw new Error(`Session ${id} not found`);

    const stepKey = `step${step}` as const;
    (existing as any)[stepKey] = { ...(existing as any)[stepKey], ...stepData };
    existing.currentStep = (step < 4 ? (step + 1) : 4) as OnboardingStep;
    existing.updatedAt = new Date();

    await this.databaseService.writeRecord(this.entityName, id, existing as unknown as Record<string, unknown>);
    return existing;
  }

  async completeSession(id: string): Promise<OnboardingSession> {
    const existing = await this.findById(id);
    if (!existing) throw new Error(`Session ${id} not found`);

    existing.status = 'completed';
    existing.completedAt = new Date();
    existing.updatedAt = new Date();

    await this.databaseService.writeRecord(this.entityName, id, existing as unknown as Record<string, unknown>);
    return existing;
  }

  async abandonSession(id: string): Promise<OnboardingSession> {
    const existing = await this.findById(id);
    if (!existing) throw new Error(`Session ${id} not found`);

    existing.status = 'abandoned';
    existing.updatedAt = new Date();

    await this.databaseService.writeRecord(this.entityName, id, existing as unknown as Record<string, unknown>);
    return existing;
  }

  async delete(id: string): Promise<boolean> {
    await this.databaseService.deleteRecord(this.entityName, id);
    return true;
  }
}
