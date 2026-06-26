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
var AiBackgroundService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiBackgroundService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const media_service_1 = require("../media/media.service");
let AiBackgroundService = AiBackgroundService_1 = class AiBackgroundService {
    constructor(configService, mediaService) {
        this.configService = configService;
        this.mediaService = mediaService;
        this.logger = new common_1.Logger(AiBackgroundService_1.name);
    }
    async generateBackground(prompt, ownerId) {
        const trimmedPrompt = prompt.trim();
        if (!trimmedPrompt) {
            throw new common_1.BadRequestException('Prompt không được để trống.');
        }
        const apiKey = this.configService.get('GEMINI_API_KEY') ?? '';
        if (!apiKey) {
            throw new common_1.BadRequestException('GEMINI_API_KEY chưa được cấu hình trên server.');
        }
        const model = this.configService.get('GEMINI_IMAGE_MODEL') ?? 'gemini-2.5-flash-image';
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const enhancedPrompt = this.buildBackgroundPrompt(trimmedPrompt);
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: enhancedPrompt }] }],
                generationConfig: {
                    responseModalities: ['IMAGE'],
                },
            }),
        });
        const data = (await response.json());
        if (!response.ok) {
            const message = data.error?.message ?? `Gemini trả về lỗi ${response.status}`;
            this.logger.warn(`Gemini image generation failed: ${message}`);
            if (/quota|rate.?limit|billing/i.test(message)) {
                throw new common_1.BadRequestException('Đã hết quota tạo ảnh AI trên tài khoản Gemini. Hãy bật billing hoặc thử lại sau.');
            }
            throw new common_1.BadRequestException(message);
        }
        const parts = data.candidates?.[0]?.content?.parts ?? [];
        const imagePart = parts.find((part) => part.inlineData?.data);
        const inlineData = imagePart?.inlineData;
        if (!inlineData?.data) {
            throw new common_1.BadRequestException('AI không trả về hình ảnh. Hãy thử prompt khác.');
        }
        const mimeType = inlineData.mimeType ?? 'image/png';
        const extension = mimeType.includes('jpeg') ? 'jpg' : mimeType.includes('webp') ? 'webp' : 'png';
        const buffer = Buffer.from(inlineData.data, 'base64');
        const uploaded = await this.mediaService.upload({
            originalname: `ai-background-${Date.now()}.${extension}`,
            mimetype: mimeType,
            size: buffer.length,
            buffer,
        }, ownerId, 'background');
        return {
            imageUrl: uploaded.fileUrl,
            prompt: trimmedPrompt,
            model,
        };
    }
    buildBackgroundPrompt(userPrompt) {
        return [
            'Create a high-quality vertical mobile landing page background image.',
            'Aspect ratio 9:16, full-bleed, cinematic, clean composition.',
            'No text, no watermark, no logo, no UI elements.',
            'Optimized for a link-in-bio website background behind profile content.',
            `User request: ${userPrompt}`,
        ].join(' ');
    }
};
exports.AiBackgroundService = AiBackgroundService;
exports.AiBackgroundService = AiBackgroundService = AiBackgroundService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        media_service_1.MediaService])
], AiBackgroundService);
