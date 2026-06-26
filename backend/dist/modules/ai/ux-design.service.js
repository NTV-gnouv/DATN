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
var UxDesignService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UxDesignService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ux_design_prompt_1 = require("./prompts/ux-design.prompt");
const ux_design_mapper_1 = require("./ux-design.mapper");
const ux_style_options_builder_1 = require("./ux-style-options.builder");
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
    throw new Error('Invalid JSON from Gemini UX design response.');
}
function brandProfileToUxInput(profile) {
    return {
        name: profile.name,
        occupation: profile.occupation,
        description: profile.long_bio || profile.short_bio,
        brand_style: profile.brand_style,
        personality_traits: profile.personality_traits,
        color_palette: profile.color_palette,
    };
}
let UxDesignService = UxDesignService_1 = class UxDesignService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(UxDesignService_1.name);
    }
    async generateUxDesign(profile) {
        const input = brandProfileToUxInput(profile);
        const apiKey = this.configService.get('GEMINI_API_KEY') ?? '';
        if (!apiKey) {
            return {
                ux: (0, ux_design_mapper_1.buildFallbackUxDesign)(input),
                source: 'fallback',
                warnings: ['GEMINI_API_KEY chưa được cấu hình. Dùng UX fallback.'],
            };
        }
        const model = this.configService.get('GEMINI_MODEL') ?? 'gemini-2.5-flash';
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const prompt = (0, ux_design_prompt_1.buildUxDesignPrompt)(input);
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.5,
                        responseMimeType: 'application/json',
                    },
                }),
            });
            const data = (await response.json());
            if (!response.ok) {
                const message = data.error?.message ?? `Gemini UX trả về lỗi ${response.status}`;
                this.logger.warn(`UX design generation failed: ${message}`);
                return {
                    ux: (0, ux_design_mapper_1.buildFallbackUxDesign)(input),
                    source: 'fallback',
                    warnings: [message],
                };
            }
            const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('') ?? '';
            if (!text.trim()) {
                return {
                    ux: (0, ux_design_mapper_1.buildFallbackUxDesign)(input),
                    source: 'fallback',
                    warnings: ['Gemini không trả về nội dung UX design.'],
                };
            }
            return {
                ux: (0, ux_design_mapper_1.normalizeUxDesignProfile)(extractJsonPayload(text), input),
                source: 'gemini',
                warnings: [],
            };
        }
        catch (error) {
            this.logger.warn(`UX design generation error: ${String(error)}`);
            return {
                ux: (0, ux_design_mapper_1.buildFallbackUxDesign)(input),
                source: 'fallback',
                warnings: [error instanceof Error ? error.message : 'Lỗi không xác định khi gen UX.'],
            };
        }
    }
    generateStyleOptions(profile, options) {
        return (0, ux_style_options_builder_1.buildStyleOptionsFromProfile)(profile, options);
    }
};
exports.UxDesignService = UxDesignService;
exports.UxDesignService = UxDesignService = UxDesignService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], UxDesignService);
