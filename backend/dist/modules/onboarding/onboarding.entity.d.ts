import { OnboardingSession, Step1Data, Step2Data, Step3Data, Step4Data, OnboardingStatus, OnboardingStep } from '@/shared/types/onboarding.types';
export type OnboardingSessionRecord = OnboardingSession & {
    createdAt: Date;
};
export declare class OnboardingSessionEntity implements OnboardingSessionRecord {
    id: string;
    pageId?: string;
    userId: string;
    currentStep: OnboardingStep;
    status: OnboardingStatus;
    step1: Step1Data;
    step2: Step2Data;
    step3: Step3Data;
    step4: Step4Data;
    startedAt: Date;
    completedAt?: Date;
    updatedAt: Date;
    createdAt: Date;
    static create(data: Omit<OnboardingSession, 'id' | 'startedAt' | 'updatedAt'>): OnboardingSessionEntity;
}
