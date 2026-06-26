import { OnboardingService } from './onboarding.service';
import { SubmitStep1Dto, SubmitStep2Dto, SubmitStep3Dto, SubmitStep4Dto, StartOnboardingDto } from './dto/onboarding.dto';
import { OnboardingSession } from '@/shared/types/onboarding.types';
export declare class OnboardingController {
    private readonly onboardingService;
    constructor(onboardingService: OnboardingService);
    startSession(dto: StartOnboardingDto): Promise<OnboardingSession>;
    getSession(sessionId: string): Promise<OnboardingSession>;
    getProgress(sessionId: string): Promise<{
        sessionId: string;
        currentStep: import("@/shared/types/onboarding.types").OnboardingStep;
        status: string;
        stepsCompleted: number;
        progress: number;
    }>;
    submitStep1(sessionId: string, dto: SubmitStep1Dto): Promise<OnboardingSession>;
    submitStep2(sessionId: string, dto: SubmitStep2Dto): Promise<OnboardingSession>;
    submitStep3(sessionId: string, dto: SubmitStep3Dto): Promise<OnboardingSession>;
    submitStep4(sessionId: string, dto: SubmitStep4Dto): Promise<OnboardingSession>;
    regeneratePrompt(sessionId: string): Promise<{
        prompt: string;
    }>;
    cancelSession(sessionId: string): Promise<{
        message: string;
    }>;
    getUserSessions(req: any): Promise<OnboardingSession[]>;
}
