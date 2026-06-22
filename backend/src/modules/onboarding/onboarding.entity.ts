import { OnboardingSession, Step1Data, Step2Data, Step3Data, Step4Data, OnboardingStatus, OnboardingStep } from '@/shared/types/onboarding.types';

export type OnboardingSessionRecord = OnboardingSession & {
  createdAt: Date;
};

export class OnboardingSessionEntity implements OnboardingSessionRecord {
  id!: string;
  pageId?: string;
  userId!: string;
  currentStep!: OnboardingStep;
  status!: OnboardingStatus;
  step1!: Step1Data;
  step2!: Step2Data;
  step3!: Step3Data;
  step4!: Step4Data;
  startedAt!: Date;
  completedAt?: Date;
  updatedAt!: Date;
  createdAt!: Date;

  static create(data: Omit<OnboardingSession, 'id' | 'startedAt' | 'updatedAt'>): OnboardingSessionEntity {
    const entity = new OnboardingSessionEntity();
    const now = new Date();
    entity.id = `onboarding-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    entity.userId = data.userId;
    entity.pageId = data.pageId;
    entity.currentStep = 1;
    entity.status = 'in_progress';
    entity.step1 = { socialLinks: [] };
    entity.step2 = {};
    entity.step3 = {};
    entity.step4 = {};
    entity.startedAt = now;
    entity.updatedAt = now;
    entity.createdAt = now;
    return entity;
  }
}
