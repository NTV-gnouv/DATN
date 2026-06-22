import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { OnboardingRepository } from './onboarding.repository';
import { OnboardingSession, OnboardingStep, Step1Data, Step2Data, Step3Data, Step4Data, SocialLink } from '@/shared/types/onboarding.types';
import { SubmitStep1Dto, SubmitStep2Dto, SubmitStep3Dto, SubmitStep4Dto } from './dto/onboarding.dto';

@Injectable()
export class OnboardingService {
  constructor(private readonly repository: OnboardingRepository) {}

  async startSession(userId: string, pageId?: string): Promise<OnboardingSession> {
    try {
      console.log('[Onboarding] startSession called:', { userId, pageId });
      
      // Check if there's an active session
      const activeSession = await this.repository.findActiveSession(userId);
      if (activeSession) {
        console.log('[Onboarding] Active session found:', activeSession.id);
        return activeSession;
      }

      console.log('[Onboarding] Creating new session...');
      const newSession = await this.repository.create({
        userId,
        pageId,
        currentStep: 1,
        status: 'in_progress',
        step1: { socialLinks: [] },
        step2: {},
        step3: {},
        step4: {},
      });
      console.log('[Onboarding] Session created:', newSession.id);
      return newSession;
    } catch (error) {
      console.error('[Onboarding] Error in startSession:', error);
      throw error;
    }
  }

  async getSession(sessionId: string): Promise<OnboardingSession> {
    const session = await this.repository.findById(sessionId);
    if (!session) throw new NotFoundException(`Onboarding session ${sessionId} not found`);
    return session;
  }

  async submitStep1(sessionId: string, data: SubmitStep1Dto): Promise<OnboardingSession> {
    const session = await this.getSession(sessionId);
    if (session.currentStep > 1) throw new BadRequestException('Cannot go back to step 1');

    const stepData: Step1Data = {
      socialLinks: data.socialLinks,
    };

    return this.repository.updateStep(sessionId, 1, stepData);
  }

  async submitStep2(sessionId: string, data: SubmitStep2Dto): Promise<OnboardingSession> {
    const session = await this.getSession(sessionId);
    if (!data.isConfirmed) throw new BadRequestException('User must confirm profile before proceeding');
    if (session.step1.socialLinks.length === 0) {
      throw new BadRequestException('Cannot proceed without step 1 data');
    }

    const stepData: Step2Data = {
      isConfirmed: data.isConfirmed,
      avatar: data.avatar,
      bio: data.bio,
      displayName: data.displayName,
      interests: data.interests,
      confirmedAt: new Date(),
    };

    return this.repository.updateStep(sessionId, 2, stepData);
  }

  async submitStep3(sessionId: string, data: SubmitStep3Dto): Promise<OnboardingSession> {
    const session = await this.getSession(sessionId);
    if (!session.step2.isConfirmed) {
      throw new BadRequestException('Cannot proceed without step 2 confirmation');
    }

    const stepData: Step3Data = {
      editedPrompt: data.editedPrompt,
      tags: data.tags || [],
      selectedTemplate: data.selectedTemplate,
    };

    return this.repository.updateStep(sessionId, 3, stepData);
  }

  async submitStep4(sessionId: string, data: SubmitStep4Dto, landingPageId: string): Promise<OnboardingSession> {
    const session = await this.getSession(sessionId);
    if (!data.confirmFinal) throw new BadRequestException('User must confirm final landing page');

    const stepData: Step4Data = {
      landingPageId,
      completedAt: new Date(),
    };

    const updated = await this.repository.updateStep(sessionId, 4, stepData);
    return this.repository.completeSession(updated.id);
  }

  async getUserSessions(userId: string): Promise<OnboardingSession[]> {
    return this.repository.findByUserId(userId);
  }

  async getSessionProgress(sessionId: string): Promise<{
    sessionId: string;
    currentStep: OnboardingStep;
    status: string;
    stepsCompleted: number;
    progress: number;
  }> {
    const session = await this.getSession(sessionId);
    const stepsCompleted = session.status === 'completed' ? 4 : session.currentStep - 1;
    const progress = (stepsCompleted / 4) * 100;

    return {
      sessionId,
      currentStep: session.currentStep,
      status: session.status,
      stepsCompleted,
      progress: Math.round(progress),
    };
  }

  async regenerateStep3Prompt(sessionId: string): Promise<string> {
    const session = await this.getSession(sessionId);
    if (session.currentStep < 3) {
      throw new BadRequestException('Cannot generate prompt before step 3');
    }

    // TODO: Integrate with AI service to generate prompt from social data
    const generatedPrompt = this.generatePromptFromProfile(session);
    await this.repository.updateStep(sessionId, 3, { generatedPrompt });

    return generatedPrompt;
  }

  private generatePromptFromProfile(session: OnboardingSession): string {
    const { step1, step2 } = session;
    const displayName = step2.displayName || 'User';
    const bio = step2.bio || '';
    const platforms = step1.socialLinks.map(link => `${link.platform}: ${link.username}`).join(', ');

    return `Create a professional landing page for ${displayName}. Bio: ${bio}. Social media: ${platforms}. The page should be modern, clean, and reflect their professional presence.`;
  }

  async cancelSession(sessionId: string): Promise<void> {
    await this.repository.abandonSession(sessionId);
  }
}
