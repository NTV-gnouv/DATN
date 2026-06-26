"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnboardingSessionEntity = void 0;
class OnboardingSessionEntity {
    static create(data) {
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
exports.OnboardingSessionEntity = OnboardingSessionEntity;
