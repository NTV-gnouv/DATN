import { DatabaseService } from '@/core/database/database.service';
import { OnboardingSession, OnboardingStep } from '@/shared/types/onboarding.types';
export declare class OnboardingRepository {
    private readonly databaseService;
    constructor(databaseService: DatabaseService);
    private mapRow;
    private writeSession;
    create(data: Omit<OnboardingSession, 'id' | 'startedAt' | 'updatedAt'>): Promise<OnboardingSession>;
    findById(id: string): Promise<OnboardingSession | null>;
    findByUserId(userId: string): Promise<OnboardingSession[]>;
    findActiveSession(userId: string): Promise<OnboardingSession | null>;
    update(id: string, data: Partial<OnboardingSession>): Promise<OnboardingSession>;
    updateStep(id: string, step: OnboardingStep, stepData: unknown): Promise<OnboardingSession>;
    completeSession(id: string): Promise<OnboardingSession>;
    abandonSession(id: string): Promise<OnboardingSession>;
    delete(id: string): Promise<boolean>;
}
