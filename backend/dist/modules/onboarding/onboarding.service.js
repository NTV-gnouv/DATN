"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnboardingService = void 0;
const common_1 = require("@nestjs/common");
const onboarding_repository_1 = require("./onboarding.repository");
let OnboardingService = class OnboardingService {
    constructor(repository) {
        this.repository = repository;
    }
    async startSession(userId, pageId) {
        try {
            console.log('[Onboarding] startSession called:', { userId, pageId });
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
        }
        catch (error) {
            console.error('[Onboarding] Error in startSession:', error);
            throw error;
        }
    }
    async getSession(sessionId) {
        const session = await this.repository.findById(sessionId);
        if (!session)
            throw new common_1.NotFoundException(`Onboarding session ${sessionId} not found`);
        return session;
    }
    async submitStep1(sessionId, data) {
        const session = await this.getSession(sessionId);
        if (session.currentStep > 1)
            throw new common_1.BadRequestException('Cannot go back to step 1');
        const stepData = {
            socialLinks: data.socialLinks,
        };
        return this.repository.updateStep(sessionId, 1, stepData);
    }
    async submitStep2(sessionId, data) {
        const session = await this.getSession(sessionId);
        if (!data.isConfirmed)
            throw new common_1.BadRequestException('User must confirm profile before proceeding');
        if (session.step1.socialLinks.length === 0) {
            throw new common_1.BadRequestException('Cannot proceed without step 1 data');
        }
        const stepData = {
            isConfirmed: data.isConfirmed,
            avatar: data.avatar,
            bio: data.bio,
            displayName: data.displayName,
            interests: data.interests,
            confirmedAt: new Date(),
        };
        return this.repository.updateStep(sessionId, 2, stepData);
    }
    async submitStep3(sessionId, data) {
        const session = await this.getSession(sessionId);
        if (!session.step2.isConfirmed) {
            throw new common_1.BadRequestException('Cannot proceed without step 2 confirmation');
        }
        const stepData = {
            editedPrompt: data.editedPrompt,
            tags: data.tags || [],
            selectedTemplate: data.selectedTemplate,
        };
        return this.repository.updateStep(sessionId, 3, stepData);
    }
    async submitStep4(sessionId, data, landingPageId) {
        const session = await this.getSession(sessionId);
        if (!data.confirmFinal)
            throw new common_1.BadRequestException('User must confirm final landing page');
        const stepData = {
            landingPageId,
            completedAt: new Date(),
        };
        const updated = await this.repository.updateStep(sessionId, 4, stepData);
        return this.repository.completeSession(updated.id);
    }
    async getUserSessions(userId) {
        return this.repository.findByUserId(userId);
    }
    async getSessionProgress(sessionId) {
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
    async regenerateStep3Prompt(sessionId) {
        const session = await this.getSession(sessionId);
        if (session.currentStep < 3) {
            throw new common_1.BadRequestException('Cannot generate prompt before step 3');
        }
        const generatedPrompt = this.generatePromptFromProfile(session);
        await this.repository.updateStep(sessionId, 3, { generatedPrompt });
        return generatedPrompt;
    }
    generatePromptFromProfile(session) {
        const { step1, step2 } = session;
        const displayName = step2.displayName || 'User';
        const bio = step2.bio || '';
        const platforms = step1.socialLinks.map(link => `${link.platform}: ${link.username}`).join(', ');
        return `Create a professional landing page for ${displayName}. Bio: ${bio}. Social media: ${platforms}. The page should be modern, clean, and reflect their professional presence.`;
    }
    async cancelSession(sessionId) {
        await this.repository.abandonSession(sessionId);
    }
};
exports.OnboardingService = OnboardingService;
exports.OnboardingService = OnboardingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [onboarding_repository_1.OnboardingRepository])
], OnboardingService);
