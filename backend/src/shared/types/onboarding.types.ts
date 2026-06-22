/**
 * Onboarding step-by-step types
 * Replaces the old chat-based AI flow
 */

export type SocialPlatform = 'instagram' | 'tiktok' | 'youtube' | 'behance' | 'x' | 'snapchat' | 'linkedin';

export type SocialLink = {
  platform: SocialPlatform;
  username: string;
  url?: string;
  profileData?: {
    displayName?: string;
    bio?: string;
    followers?: number;
    avatar?: string;
  };
};

export type OnboardingStep = 1 | 2 | 3 | 4;

export type OnboardingStatus = 'in_progress' | 'completed' | 'abandoned';

export type Step1Data = {
  socialLinks: SocialLink[];
};

export type Step2Data = {
  confirmedAt?: Date;
  avatar?: string;
  bio?: string;
  displayName?: string;
  interests?: string[];
  isConfirmed?: boolean;
};

export type Step3Data = {
  generatedPrompt?: string;
  editedPrompt?: string;
  tags?: string[];
  selectedTemplate?: string;
};

export type Step4Data = {
  landingPageId?: string;
  themeId?: string;
  completedAt?: Date;
};

export interface OnboardingSession {
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
}

export type OnboardingSessionInput = Omit<OnboardingSession, 'id' | 'startedAt' | 'updatedAt'>;

export type OnboardingStepInput<T extends OnboardingStep> = T extends 1
  ? Step1Data
  : T extends 2
    ? Step2Data
    : T extends 3
      ? Step3Data
      : Step4Data;

export type StepValidationError = {
  step: OnboardingStep;
  message: string;
  code: string;
};

/**
 * DTO for API requests
 */
export class SubmitStep1Dto {
  socialLinks!: SocialLink[];
}

export class SubmitStep2Dto {
  isConfirmed!: boolean;
  avatar?: string;
  bio?: string;
  displayName?: string;
  interests?: string[];
}

export class SubmitStep3Dto {
  editedPrompt?: string;
  tags?: string[];
  selectedTemplate?: string;
}

export class SubmitStep4Dto {
  confirmFinal!: boolean;
}
