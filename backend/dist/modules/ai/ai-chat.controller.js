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
exports.AiChatController = exports.SendAiChatMessageDto = exports.StartAiChatDto = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const public_decorator_1 = require("../../shared/decorators/public.decorator");
const submit_ai_chat_socials_dto_1 = require("./dto/submit-ai-chat-socials.dto");
const apply_ai_chat_style_dto_1 = require("./dto/apply-ai-chat-style.dto");
const ai_chat_service_1 = require("./ai-chat.service");
class StartAiChatDto {
}
exports.StartAiChatDto = StartAiChatDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], StartAiChatDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], StartAiChatDto.prototype, "username", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], StartAiChatDto.prototype, "pageId", void 0);
class SendAiChatMessageDto {
}
exports.SendAiChatMessageDto = SendAiChatMessageDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SendAiChatMessageDto.prototype, "message", void 0);
let AiChatController = class AiChatController {
    constructor(aiChatService) {
        this.aiChatService = aiChatService;
    }
    start(body) {
        return this.aiChatService.startChat(body.userId, body.username?.trim() || body.userId, body.pageId?.trim() || undefined);
    }
    getSession(sessionId) {
        return this.aiChatService.getChatSession(sessionId);
    }
    sendMessage(sessionId, body) {
        return this.aiChatService.sendChatMessage(sessionId, body.message);
    }
    submitSocials(sessionId, body) {
        return this.aiChatService.submitSocials(sessionId, body);
    }
    goBack(sessionId) {
        return this.aiChatService.goBack(sessionId);
    }
    generate(sessionId) {
        return this.aiChatService.generateLandingPage(sessionId);
    }
    applyStyle(sessionId, body) {
        return this.aiChatService.applyStyleChoice(sessionId, body.styleOptionId);
    }
};
exports.AiChatController = AiChatController;
__decorate([
    (0, common_1.Post)('start'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Start AI chat onboarding session' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [StartAiChatDto]),
    __metadata("design:returntype", void 0)
], AiChatController.prototype, "start", null);
__decorate([
    (0, common_1.Get)(':sessionId'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get AI chat session' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AiChatController.prototype, "getSession", null);
__decorate([
    (0, common_1.Post)(':sessionId/message'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Send user message in AI chat onboarding' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, SendAiChatMessageDto]),
    __metadata("design:returntype", void 0)
], AiChatController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Post)(':sessionId/socials'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Submit social media usernames in AI chat onboarding' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, submit_ai_chat_socials_dto_1.SubmitAiChatSocialsDto]),
    __metadata("design:returntype", void 0)
], AiChatController.prototype, "submitSocials", null);
__decorate([
    (0, common_1.Post)(':sessionId/back'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Go back to previous AI chat onboarding step' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AiChatController.prototype, "goBack", null);
__decorate([
    (0, common_1.Post)(':sessionId/generate'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Generate landing page from collected chat answers' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AiChatController.prototype, "generate", null);
__decorate([
    (0, common_1.Post)(':sessionId/style'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Apply selected AI style option and build landing page' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, apply_ai_chat_style_dto_1.ApplyAiChatStyleDto]),
    __metadata("design:returntype", void 0)
], AiChatController.prototype, "applyStyle", null);
exports.AiChatController = AiChatController = __decorate([
    (0, swagger_1.ApiTags)('AI Chat'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('ai/chat'),
    __metadata("design:paramtypes", [ai_chat_service_1.AiChatService])
], AiChatController);
