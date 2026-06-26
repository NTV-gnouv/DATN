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
var BrandProfileService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrandProfileService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const brand_profile_prompt_1 = require("./prompts/brand-profile.prompt");
const normalize_chat_input_1 = require("./utils/normalize-chat-input");
function truncateText(value, maxLength, fallback = '') {
    const text = String(value ?? fallback).trim();
    if (text.length <= maxLength) {
        return text;
    }
    const sliced = text.slice(0, maxLength);
    const lastSpace = sliced.lastIndexOf(' ');
    if (lastSpace > Math.floor(maxLength * 0.6)) {
        return sliced.slice(0, lastSpace).trim();
    }
    return sliced.trim();
}
function isHexColor(value) {
    return /^#([0-9a-fA-F]{6})$/.test(value.trim());
}
function normalizeHex(value, fallback) {
    if (typeof value !== 'string' || !isHexColor(value)) {
        return fallback;
    }
    return value.trim().toLowerCase();
}
function extractJsonPayload(value) {
    const trimmed = value.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        return JSON.parse(trimmed);
    }
    const fenced = trimmed.match(/```json\s*([\s\S]*?)```/i) ?? trimmed.match(/```\s*([\s\S]*?)```/i);
    if (fenced?.[1]) {
        return JSON.parse(fenced[1].trim());
    }
    const firstBrace = trimmed.indexOf('{');
    const lastBrace = trimmed.lastIndexOf('}');
    if (firstBrace >= 0 && lastBrace > firstBrace) {
        return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
    }
    throw new common_1.BadRequestException('Gemini không trả về JSON hợp lệ.');
}
let BrandProfileService = BrandProfileService_1 = class BrandProfileService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(BrandProfileService_1.name);
    }
    async generateProfile(input) {
        const normalizedInput = (0, normalize_chat_input_1.normalizeBrandProfileInput)(input);
        const apiKey = this.configService.get('GEMINI_API_KEY') ?? '';
        if (!apiKey) {
            throw new common_1.BadRequestException('GEMINI_API_KEY chưa được cấu hình trên server.');
        }
        const model = this.configService.get('GEMINI_MODEL') ?? 'gemini-2.5-flash';
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const prompt = (0, brand_profile_prompt_1.buildBrandProfilePrompt)(normalizedInput);
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.8,
                    responseMimeType: 'application/json',
                },
            }),
        });
        const data = (await response.json());
        if (!response.ok) {
            const message = data.error?.message ?? `Gemini trả về lỗi ${response.status}`;
            this.logger.warn(`Brand profile generation failed: ${message}`);
            throw new common_1.BadRequestException(message);
        }
        const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('') ?? '';
        if (!text.trim()) {
            throw new common_1.BadRequestException('Gemini không trả về nội dung hồ sơ.');
        }
        return this.normalizeProfile(extractJsonPayload(text), normalizedInput);
    }
    normalizeProfile(raw, input) {
        const payload = (raw ?? {});
        const palette = (payload.color_palette ?? {});
        const swatch = (value, fallbackName, fallbackHex) => {
            const item = (value ?? {});
            return {
                name: String(item.name ?? fallbackName).slice(0, 40),
                hex: normalizeHex(item.hex, fallbackHex),
            };
        };
        const galleryRaw = Array.isArray(payload.gallery) ? payload.gallery : [];
        const gallery = [0, 1, 2].map((index) => {
            const item = (galleryRaw[index] ?? {});
            return {
                title: truncateText(item.title, brand_profile_prompt_1.BRAND_PROFILE_LIMITS.galleryTitle, `Ảnh thương hiệu ${index + 1}`),
                description: truncateText(item.description, brand_profile_prompt_1.BRAND_PROFILE_LIMITS.galleryDescription, input.description),
            };
        });
        const keywordsRaw = Array.isArray(payload.image_keywords) ? payload.image_keywords : [];
        const image_keywords = keywordsRaw
            .map((item) => String(item ?? '').trim())
            .filter((item) => item.length > 0)
            .slice(0, 8);
        while (image_keywords.length < 4) {
            image_keywords.push(`${input.occupation} lifestyle`.trim());
        }
        const traitsRaw = Array.isArray(payload.personality_traits)
            ? payload.personality_traits.map((item) => String(item).trim()).filter(Boolean)
            : [];
        return {
            name: String(payload.name ?? input.name).trim() || input.name,
            occupation: String(payload.occupation ?? input.occupation).trim() || input.occupation,
            personality_traits: (0, normalize_chat_input_1.sanitizePersonalityTraits)(traitsRaw),
            brand_style: truncateText(payload.brand_style, brand_profile_prompt_1.BRAND_PROFILE_LIMITS.brandStyle, 'Hiện đại và cá nhân hóa'),
            short_bio: truncateText(payload.short_bio, brand_profile_prompt_1.BRAND_PROFILE_LIMITS.shortBio, input.description),
            long_bio: truncateText(payload.long_bio, brand_profile_prompt_1.BRAND_PROFILE_LIMITS.longBio, input.description),
            color_palette: {
                primary: swatch(palette.primary, 'Primary', '#1d4ed8'),
                secondary_1: swatch(palette.secondary_1, 'Secondary', '#2563eb'),
                secondary_2: swatch(palette.secondary_2, 'Accent', '#22c55e'),
                contrast: swatch(palette.contrast, 'Contrast', '#0f172a'),
            },
            image_keywords,
            gallery,
        };
    }
};
exports.BrandProfileService = BrandProfileService;
exports.BrandProfileService = BrandProfileService = BrandProfileService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], BrandProfileService);
