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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnboardingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const onboarding_service_1 = require("./onboarding.service");
const onboarding_dto_1 = require("./dto/onboarding.dto");
const public_decorator_1 = require("../../shared/decorators/public.decorator");
let OnboardingController = class OnboardingController {
    constructor(onboardingService) {
        this.onboardingService = onboardingService;
    }
    async startSession(dto) {
        const userId = dto.userId || `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        return this.onboardingService.startSession(userId, dto.pageId);
    }
    async getSession(sessionId) {
        return this.onboardingService.getSession(sessionId);
    }
    async getProgress(sessionId) {
        return this.onboardingService.getSessionProgress(sessionId);
    }
    async submitStep1(sessionId, dto) {
        return this.onboardingService.submitStep1(sessionId, dto);
    }
    async submitStep2(sessionId, dto) {
        return this.onboardingService.submitStep2(sessionId, dto);
    }
    async submitStep3(sessionId, dto) {
        return this.onboardingService.submitStep3(sessionId, dto);
    }
    async submitStep4(sessionId, dto) {
        const landingPageId = 'page-' + Date.now();
        return this.onboardingService.submitStep4(sessionId, dto, landingPageId);
    }
    async regeneratePrompt(sessionId) {
        const prompt = await this.onboardingService.regenerateStep3Prompt(sessionId);
        return { prompt };
    }
    async cancelSession(sessionId) {
        await this.onboardingService.cancelSession(sessionId);
        return { message: 'Onboarding session cancelled' };
    }
    async getUserSessions(req) {
        const userId = req.user.id;
        return this.onboardingService.getUserSessions(userId);
    }
};
exports.OnboardingController = OnboardingController;
__decorate([
    (0, common_1.Post)('start'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Start new onboarding session' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Session started', type: Object }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [onboarding_dto_1.StartOnboardingDto]),
    __metadata("design:returntype", Promise)
], OnboardingController.prototype, "startSession", null);
__decorate([
    (0, common_1.Get)(':sessionId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get onboarding session details' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Session details', type: Object }),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OnboardingController.prototype, "getSession", null);
__decorate([
    (0, common_1.Get)(':sessionId/progress'),
    (0, swagger_1.ApiOperation)({ summary: 'Get progress (Step 1/4, 2/4, etc)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Progress info' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OnboardingController.prototype, "getProgress", null);
__decorate([
    (0, common_1.Post)(':sessionId/step/1'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Submit step 1: social media links' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Step 1 submitted' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, onboarding_dto_1.SubmitStep1Dto]),
    __metadata("design:returntype", Promise)
], OnboardingController.prototype, "submitStep1", null);
__decorate([
    (0, common_1.Post)(':sessionId/step/2'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Submit step 2: profile confirmation' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Step 2 submitted' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, onboarding_dto_1.SubmitStep2Dto]),
    __metadata("design:returntype", Promise)
], OnboardingController.prototype, "submitStep2", null);
__decorate([
    (0, common_1.Post)(':sessionId/step/3'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Submit step 3: prompt review' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Step 3 submitted' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, onboarding_dto_1.SubmitStep3Dto]),
    __metadata("design:returntype", Promise)
], OnboardingController.prototype, "submitStep3", null);
__decorate([
    (0, common_1.Post)(':sessionId/step/4'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Submit step 4: finalize and create landing page' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Landing page created' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, onboarding_dto_1.SubmitStep4Dto]),
    __metadata("design:returntype", Promise)
], OnboardingController.prototype, "submitStep4", null);
__decorate([
    (0, common_1.Patch)(':sessionId/regenerate-prompt'),
    (0, swagger_1.ApiOperation)({ summary: 'Regenerate AI prompt' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'New prompt generated' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OnboardingController.prototype, "regeneratePrompt", null);
__decorate([
    (0, common_1.Post)(':sessionId/cancel'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel onboarding session' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Session cancelled' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OnboardingController.prototype, "cancelSession", null);
__decorate([
    (0, common_1.Get)('user/sessions'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all user sessions' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of sessions' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OnboardingController.prototype, "getUserSessions", null);
exports.OnboardingController = OnboardingController = __decorate([
    (0, swagger_1.ApiTags)('Onboarding'),
    (0, common_1.Controller)('onboarding'),
    (0, public_decorator_1.Public)(),
    __metadata("design:paramtypes", [onboarding_service_1.OnboardingService])
], OnboardingController);
