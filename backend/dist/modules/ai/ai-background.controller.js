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
exports.AiBackgroundController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const public_decorator_1 = require("../../shared/decorators/public.decorator");
const ai_background_service_1 = require("./ai-background.service");
const generate_ai_background_dto_1 = require("./dto/generate-ai-background.dto");
let AiBackgroundController = class AiBackgroundController {
    constructor(aiBackgroundService) {
        this.aiBackgroundService = aiBackgroundService;
    }
    generate(body) {
        return this.aiBackgroundService.generateBackground(body.prompt, body.ownerId);
    }
};
exports.AiBackgroundController = AiBackgroundController;
__decorate([
    (0, common_1.Post)('generate'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Generate AI background',
        description: 'Generate a landing page background image using Gemini image generation.',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_ai_background_dto_1.GenerateAiBackgroundDto]),
    __metadata("design:returntype", void 0)
], AiBackgroundController.prototype, "generate", null);
exports.AiBackgroundController = AiBackgroundController = __decorate([
    (0, swagger_1.ApiTags)('AI'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('ai/background'),
    __metadata("design:paramtypes", [ai_background_service_1.AiBackgroundService])
], AiBackgroundController);
