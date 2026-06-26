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
exports.AiController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const apply_ai_theme_dto_1 = require("./dto/apply-ai-theme.dto");
const auto_ai_theme_dto_1 = require("./dto/auto-ai-theme.dto");
const ai_chat_dto_1 = require("./dto/ai-chat.dto");
const ai_service_1 = require("./ai.service");
let AiController = class AiController {
    constructor(aiService) {
        this.aiService = aiService;
    }
    startChat(body) {
        return this.aiService.startChat(body.pageId);
    }
    getSession(sessionId) {
        return this.aiService.getChatSession(sessionId);
    }
    sendMessage(body) {
        return this.aiService.sendChatMessage(body.sessionId, body.message);
    }
    applyChatTheme(body) {
        return this.aiService.applyChatSession(body.sessionId);
    }
    applyTheme(body) {
        return this.aiService.applyAiTheme(body);
    }
    autoApplyTheme(body) {
        return this.aiService.autoApplyAiTheme(body);
    }
};
exports.AiController = AiController;
__decorate([
    (0, common_1.Post)('chat/start'),
    (0, swagger_1.ApiOperation)({
        summary: 'Start AI chat session',
        description: 'Create a constrained chat session for collecting creator profile/theme data in strict order.',
    }),
    (0, swagger_1.ApiBody)({ type: ai_chat_dto_1.StartAiChatDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ai_chat_dto_1.StartAiChatDto]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "startChat", null);
__decorate([
    (0, common_1.Get)('chat/session/:sessionId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get AI chat session',
        description: 'Return current chat session state, collected answers, and full message history.',
    }),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "getSession", null);
__decorate([
    (0, common_1.Post)('chat/message'),
    (0, swagger_1.ApiOperation)({
        summary: 'Send AI chat message',
        description: 'Send one user message and receive next constrained assistant prompt.',
    }),
    (0, swagger_1.ApiBody)({ type: ai_chat_dto_1.SendAiChatMessageDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ai_chat_dto_1.SendAiChatMessageDto]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Post)('chat/apply'),
    (0, swagger_1.ApiOperation)({
        summary: 'Apply AI theme from chat session',
        description: 'Use collected chat answers to generate and apply AI theme/header config to page.',
    }),
    (0, swagger_1.ApiBody)({ type: ai_chat_dto_1.ApplyAiChatDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ai_chat_dto_1.ApplyAiChatDto]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "applyChatTheme", null);
__decorate([
    (0, common_1.Post)('theme/apply'),
    (0, swagger_1.ApiOperation)({
        summary: 'Generate and apply AI theme',
        description: 'Collect creator profile/style answers, generate AI design suggestions, optionally fetch Pexels image, and apply into page header/theme config.',
    }),
    (0, swagger_1.ApiBody)({ type: apply_ai_theme_dto_1.ApplyAiThemeDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [apply_ai_theme_dto_1.ApplyAiThemeDto]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "applyTheme", null);
__decorate([
    (0, common_1.Post)('theme/auto-apply'),
    (0, swagger_1.ApiOperation)({
        summary: 'Auto-generate and apply AI theme from fixed profile fields',
        description: 'Only requires fixed profile data (username/displayName/description/industry/social links). AI infers colors, typography, layout, borders, effects, and visual components automatically.',
    }),
    (0, swagger_1.ApiBody)({ type: auto_ai_theme_dto_1.AutoAiThemeDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auto_ai_theme_dto_1.AutoAiThemeDto]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "autoApplyTheme", null);
exports.AiController = AiController = __decorate([
    (0, swagger_1.ApiTags)('AI'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('ai'),
    __metadata("design:paramtypes", [ai_service_1.AiService])
], AiController);
