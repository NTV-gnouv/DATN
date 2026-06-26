import { OnboardingRepository } from './onboarding.repository';
import { OnboardingSession, OnboardingStep } from '@/shared/types/onboarding.types';
import { SubmitStep1Dto, SubmitStep2Dto, SubmitStep3Dto, SubmitStep4Dto } from './dto/onboarding.dto';
export declare class OnboardingService {
    private readonly repository;
    constructor(repository: OnboardingRepository);
    startSession(userId: string, pageId?: string): Promise<OnboardingSession>;
    getSession(sessionId: string): Promise<OnboardingSession>;
    submitStep1(sessionId: string, data: SubmitStep1Dto): Promise<OnboardingSession>;
    submitStep2(sessionId: string, data: SubmitStep2Dto): Promise<OnboardingSession>;
    submitStep3(sessionId: string, data: SubmitStep3Dto): Promise<OnboardingSession>;
    submitStep4(sessionId: string, data: SubmitStep4Dto, landingPageId: string): Promise<OnboardingSession>;
    getUserSessions(userId: string): Promise<OnboardingSession[]>;
    getSessionProgress(sessionId: string): Promise<{
        sessionId: string;
        currentStep: OnboardingStep;
        status: string;
        stepsCompleted: number;
        progress: number;
    }>;
    regenerateStep3Prompt(sessionId: string): Promise<string>;
    private generatePromptFromProfile;
    cancelSession(sessionId: string): Promise<void>;
}
