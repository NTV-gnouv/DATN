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
var ThemeEngineService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeEngineService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const pages_service_1 = require("../pages/pages.service");
const theme_customizer_service_1 = require("./theme-customizer.service");
const theme_engine_mapping_1 = require("./theme-engine.mapping");
let ThemeEngineService = ThemeEngineService_1 = class ThemeEngineService {
    constructor(configService, pagesService, themeCustomizerService) {
        this.configService = configService;
        this.pagesService = pagesService;
        this.themeCustomizerService = themeCustomizerService;
        this.logger = new common_1.Logger(ThemeEngineService_1.name);
    }
    async analyzeProfile(profile) {
        const normalized = this.normalizeProfile(profile);
        const geminiResponse = await this.requestGeminiDesignProfile(normalized);
        const designProfile = geminiResponse?.designProfile ?? this.buildFallbackDesignProfile(normalized);
        return {
            step: 'analyze-profile',
            source: geminiResponse ? 'gemini' : 'fallback',
            warnings: geminiResponse ? [] : ['Gemini unavailable or invalid response. Fallback profile used.'],
            profile: normalized,
            designProfile,
        };
    }
    mapToDesignSystem(payload) {
        const normalized = this.normalizeProfile(payload.profile);
        const designProfile = this.normalizeDesignProfile(payload.designProfile);
        const mapped = this.buildDesignSystemMapping(normalized, designProfile);
        return {
            step: 'map-design-system',
            profile: normalized,
            designProfile,
            ...mapped,
        };
    }
    async applyDesignSystem(payload) {
        const mapped = this.mapToDesignSystem(payload);
        const pageConfig = await this.pagesService.getEditorConfig(payload.pageId);
        const mergedHeaderBlock = this.deepMerge(pageConfig.headerBlock ?? {}, mapped.headerBlockPatch);
        const themeId = `custom-theme-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const themeRecord = await this.themeCustomizerService.saveTheme(payload.pageId, this.buildThemeConfig(themeId, payload.pageId, mapped, payload.profile, payload.designProfile));
        const updatedEditorConfig = await this.pagesService.updateEditorConfig(payload.pageId, {
            themeId: themeRecord.id,
            headerBlockId: pageConfig.headerBlockId,
            headerBlock: mergedHeaderBlock,
            themeTokens: mapped.themeTokens,
        });
        return {
            step: 'render-landing-page',
            pageId: payload.pageId,
            themeId: themeRecord.id,
            animationCode: mapped.animationCode,
            editorConfig: updatedEditorConfig,
        };
    }
    async runPipeline(payload) {
        const analyzed = await this.analyzeProfile(payload.profile);
        const mapped = this.mapToDesignSystem({
            profile: analyzed.profile,
            designProfile: analyzed.designProfile,
        });
        const applied = await this.applyDesignSystem({
            pageId: payload.pageId,
            profile: analyzed.profile,
            designProfile: analyzed.designProfile,
        });
        return {
            steps: [
                { name: 'analyze-profile', status: 'completed' },
                { name: 'map-design-system', status: 'completed' },
                { name: 'render-landing-page', status: 'completed' },
            ],
            source: analyzed.source,
            warnings: analyzed.warnings,
            profile: analyzed.profile,
            designProfile: analyzed.designProfile,
            designSystem: mapped.designSystem,
            result: applied,
        };
    }
    normalizeProfile(profile) {
        return {
            username: String(profile.username ?? '').trim() || this.slugify(profile.displayName),
            displayName: String(profile.displayName ?? '').trim(),
            description: String(profile.description ?? '').trim(),
            industry: String(profile.industry ?? '').trim() || this.detectIndustry(profile.description, profile.socialLinks ?? []),
            tone: String(profile.tone ?? '').trim() || 'balanced',
            socialLinks: (profile.socialLinks ?? []).map((item) => ({
                platform: String(item.platform ?? '').trim(),
                username: String(item.username ?? '').trim(),
                url: String(item.url ?? '').trim(),
            })),
            customizations: {
                mainBackgroundColor: String(profile.customizations?.mainBackgroundColor ?? '').trim(),
                mainTextColor: String(profile.customizations?.mainTextColor ?? '').trim(),
                reviewFontSize: Number(profile.customizations?.reviewFontSize ?? 0),
            },
        };
    }
    normalizeDesignProfile(input) {
        return {
            industry: input.industry || 'general',
            tone: input.tone || 'balanced',
            colorMood: this.pickEnum(input.colorMood, ['clean', 'vibrant', 'dark', 'warm', 'pastel'], 'clean'),
            backgroundStyle: this.pickEnum(input.backgroundStyle, ['solid', 'gradient', 'image'], 'gradient'),
            typographyStyle: this.pickEnum(input.typographyStyle, ['modern', 'editorial', 'friendly', 'minimal', 'bold'], 'modern'),
            borderStyle: this.pickEnum(input.borderStyle, ['none', 'soft', 'sharp'], 'soft'),
            shadowStyle: this.pickEnum(input.shadowStyle, ['none', 'soft', 'strong'], 'soft'),
            animationStyle: this.pickEnum(input.animationStyle, ['none', 'fade', 'float', 'pulse', 'gradient-shift'], 'fade'),
            layoutStyle: this.pickEnum(input.layoutStyle, ['centered', 'compact', 'split'], 'centered'),
            reasoning: input.reasoning || 'Generated from profile context.',
        };
    }
    buildDesignSystemMapping(profile, designProfile) {
        const palette = theme_engine_mapping_1.THEME_ENGINE_MAPPING.palettes[designProfile.colorMood];
        const typography = theme_engine_mapping_1.THEME_ENGINE_MAPPING.typography[designProfile.typographyStyle];
        const border = theme_engine_mapping_1.THEME_ENGINE_MAPPING.borders[designProfile.borderStyle];
        const shadow = theme_engine_mapping_1.THEME_ENGINE_MAPPING.shadows[designProfile.shadowStyle];
        const layout = theme_engine_mapping_1.THEME_ENGINE_MAPPING.layout[designProfile.layoutStyle];
        const animation = this.buildAnimation(designProfile.animationStyle, profile.username);
        const customizedPalette = {
            ...palette,
            background: this.resolveHexOrFallback(profile.customizations.mainBackgroundColor, palette.background),
            text: this.resolveHexOrFallback(profile.customizations.mainTextColor, palette.text),
            textLight: this.resolveHexOrFallback(profile.customizations.mainTextColor, palette.textLight),
        };
        const reviewFontSize = profile.customizations.reviewFontSize >= 12 && profile.customizations.reviewFontSize <= 48
            ? profile.customizations.reviewFontSize
            : typography.bodySize;
        const pageBackground = designProfile.backgroundStyle === 'solid'
            ? {
                mode: 'solid',
                solid: customizedPalette.background,
                gradient: { start: customizedPalette.background, end: customizedPalette.secondary, type: 'linear' },
                imageUrl: '',
                overlayColor: '#000000',
                overlayOpacity: 0,
            }
            : designProfile.backgroundStyle === 'gradient'
                ? {
                    mode: 'gradient',
                    solid: customizedPalette.background,
                    gradient: { start: customizedPalette.background, end: customizedPalette.secondary, type: 'linear' },
                    imageUrl: '',
                    overlayColor: '#000000',
                    overlayOpacity: 0,
                }
                : {
                    mode: 'image',
                    solid: customizedPalette.background,
                    gradient: { start: customizedPalette.background, end: customizedPalette.secondary, type: 'linear' },
                    imageUrl: '',
                    overlayColor: '#000000',
                    overlayOpacity: 25,
                };
        const themeTokens = {
            designProfile,
            colors: customizedPalette,
            typography: {
                ...typography,
                bodySize: reviewFontSize,
            },
            border,
            shadow,
            layout,
            review: {
                fontSize: reviewFontSize,
            },
            effects: {
                animationStyle: designProfile.animationStyle,
                animationClassName: animation.className,
                animationCss: animation.css,
            },
        };
        const headerBlockPatch = {
            fields: {
                profile: {
                    displayName: profile.displayName,
                    bio: profile.description,
                },
                colors: {
                    pageBackground,
                    headerTextAndIcon: customizedPalette.text,
                    socialBlockBackground: customizedPalette.secondary,
                    socialBlockText: customizedPalette.text,
                    contentBlockBackground: customizedPalette.background,
                    contentBlockText: customizedPalette.text,
                    contentBlockButton: customizedPalette.primary,
                },
                typography: {
                    fontFamily: typography.fontFamily,
                    fontSize: reviewFontSize,
                    fontWeight: typography.bodyWeight,
                },
                socials: {
                    items: profile.socialLinks.map((item) => ({
                        platform: item.platform,
                        url: item.url || '',
                        iconUrl: '',
                    })),
                },
                divLayout: {
                    widthPercent: layout.widthPercent,
                    border: {
                        width: border.width,
                        style: border.style,
                        color: customizedPalette.border,
                        radius: border.radius,
                    },
                    boxShadow: {
                        enabled: shadow.enabled,
                        x: shadow.x,
                        y: shadow.y,
                        blur: shadow.blur,
                        spread: shadow.spread,
                        color: shadow.color,
                    },
                },
            },
        };
        return {
            designSystem: {
                palette,
                customizedPalette,
                typography,
                border,
                shadow,
                layout,
                animation: { style: designProfile.animationStyle, className: animation.className },
            },
            themeTokens,
            headerBlockPatch,
            animationCode: animation.css,
            animationClassName: animation.className,
        };
    }
    buildThemeConfig(themeId, pageId, mapped, profile, designProfile) {
        const tokens = mapped.themeTokens;
        const colors = tokens.colors;
        const typography = tokens.typography;
        const border = tokens.border;
        const shadow = tokens.shadow;
        const rawBorderStyle = String(border.style ?? 'solid');
        const borderStyle = rawBorderStyle === 'dashed' || rawBorderStyle === 'dotted' ? rawBorderStyle : 'solid';
        const socialLinks = (profile.socialLinks ?? []).map((item) => ({
            platform: String(item.platform ?? ''),
            url: String(item.url ?? item.username ?? ''),
        }));
        return {
            id: themeId,
            pageId,
            name: `${profile.displayName || profile.username} AI Theme`,
            description: `AI-generated theme profile for ${profile.displayName || profile.username}`,
            version: '1.0.0',
            createdAt: new Date(),
            updatedAt: new Date(),
            isDefault: false,
            isActive: true,
            profileData: {
                username: String(profile.username ?? ''),
                displayName: String(profile.displayName ?? ''),
                description: String(profile.description ?? ''),
                industry: designProfile.industry,
                socialLinks,
            },
            theme: {
                colors: {
                    primary: colors.primary,
                    secondary: colors.secondary,
                    accent: colors.accent,
                    background: colors.background,
                    text: colors.text,
                    textLight: colors.textLight,
                    border: colors.border,
                },
                typography: {
                    fontFamily: String(typography.fontFamily ?? 'Inter'),
                    headingSize: Number(typography.headingSize ?? 34),
                    bodySize: Number(typography.bodySize ?? 16),
                    headingWeight: Number(typography.headingWeight ?? 700),
                    bodyWeight: Number(typography.bodyWeight ?? 400),
                    lineHeight: Number(typography.lineHeight ?? 1.5),
                },
                layout: {
                    maxWidth: 1100,
                    padding: 24,
                    gap: 16,
                    alignment: 'center',
                },
                borders: {
                    radius: Number(border.radius ?? 12),
                    width: Number(border.width ?? 1),
                    style: borderStyle,
                    color: colors.border,
                },
                effects: {
                    shadowEnabled: Boolean(shadow.enabled),
                    shadowIntensity: Boolean(shadow.enabled) ? 'medium' : 'light',
                    transitionDuration: 320,
                    hoverScale: 1.02,
                    fadeInOnLoad: designProfile.animationStyle === 'fade',
                },
                components: {
                    cardStyle: Boolean(shadow.enabled) ? 'elevated' : 'outlined',
                    buttonStyle: 'elevated',
                    avatarShape: 'circle',
                },
            },
            customCss: mapped.animationCode,
            metadata: {
                designProfile,
                animationClassName: mapped.animationClassName,
                savedBy: 'theme-engine',
            },
        };
    }
    async requestGeminiDesignProfile(profile) {
        const apiKey = this.configService.get('GEMINI_API_KEY') ?? '';
        if (!apiKey) {
            return null;
        }
        const model = this.configService.get('GEMINI_MODEL') ?? 'gemini-2.5-flash';
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const prompt = [
            'You are a senior brand designer.',
            'Analyze this creator profile and generate ONLY valid JSON.',
            'Return JSON with fields:',
            'industry, tone, colorMood(clean|vibrant|dark|warm|pastel),',
            'backgroundStyle(solid|gradient|image), typographyStyle(modern|editorial|friendly|minimal|bold),',
            'borderStyle(none|soft|sharp), shadowStyle(none|soft|strong),',
            'animationStyle(none|fade|float|pulse|gradient-shift), layoutStyle(centered|compact|split), reasoning.',
            `Profile: ${JSON.stringify(profile)}`,
        ].join('\n');
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.4,
                    responseMimeType: 'application/json',
                },
            }),
        });
        if (!response.ok) {
            this.logger.warn(`Gemini returned ${response.status} during profile analysis`);
            return null;
        }
        const data = (await response.json());
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (!rawText) {
            return null;
        }
        try {
            const parsed = JSON.parse(rawText);
            return { designProfile: this.normalizeDesignProfile(parsed) };
        }
        catch (error) {
            this.logger.warn(`Gemini JSON parse failed: ${error.message}`);
            return null;
        }
    }
    buildFallbackDesignProfile(profile) {
        const lower = `${profile.displayName} ${profile.description} ${profile.industry}`.toLowerCase();
        const colorMood = /dark|night|gaming|devops/.test(lower)
            ? 'dark'
            : /artist|creative|design|fashion/.test(lower)
                ? 'vibrant'
                : /food|travel|life/.test(lower)
                    ? 'warm'
                    : /cute|kids|soft/.test(lower)
                        ? 'pastel'
                        : 'clean';
        return {
            industry: profile.industry,
            tone: profile.tone,
            colorMood,
            backgroundStyle: colorMood === 'dark' ? 'solid' : 'gradient',
            typographyStyle: /writer|blog|editor/.test(lower) ? 'editorial' : colorMood === 'vibrant' ? 'bold' : 'modern',
            borderStyle: colorMood === 'dark' ? 'soft' : 'sharp',
            shadowStyle: colorMood === 'dark' ? 'strong' : 'soft',
            animationStyle: /music|dance|video|creative/.test(lower) ? 'float' : 'fade',
            layoutStyle: /minimal|clean/.test(lower) ? 'compact' : 'centered',
            reasoning: 'Fallback heuristics based on profile keywords.',
        };
    }
    detectIndustry(description, socialLinks) {
        const base = `${description} ${socialLinks.map((item) => item.platform ?? '').join(' ')}`.toLowerCase();
        if (/design|creative|art|illustration/.test(base))
            return 'creative';
        if (/health|fitness|wellness|doctor/.test(base))
            return 'health';
        if (/business|startup|ceo|marketing/.test(base))
            return 'business';
        if (/travel|lifestyle|food|beauty/.test(base))
            return 'lifestyle';
        if (/dev|developer|software|ai|tech/.test(base))
            return 'technology';
        return 'general';
    }
    buildAnimation(style, profileKey) {
        const safeKey = this.slugify(profileKey || `profile-${Date.now()}`);
        const className = `theme-anim-${safeKey}`;
        const keyframeName = `anim-${safeKey}`;
        if (style === 'none') {
            return { className, css: '' };
        }
        if (style === 'fade') {
            return {
                className,
                css: `.${className}{animation:${keyframeName} 600ms ease-out both;}@keyframes ${keyframeName}{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`,
            };
        }
        if (style === 'float') {
            return {
                className,
                css: `.${className}{animation:${keyframeName} 4s ease-in-out infinite;}@keyframes ${keyframeName}{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}`,
            };
        }
        if (style === 'pulse') {
            return {
                className,
                css: `.${className}{animation:${keyframeName} 2.2s ease-in-out infinite;}@keyframes ${keyframeName}{0%,100%{transform:scale(1)}50%{transform:scale(1.015)}}`,
            };
        }
        return {
            className,
            css: `.${className}{background-size:200% 200%;animation:${keyframeName} 8s ease infinite;}@keyframes ${keyframeName}{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}`,
        };
    }
    deepMerge(base, patch) {
        const output = { ...base };
        for (const [key, value] of Object.entries(patch)) {
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                const current = output[key];
                const currentObject = current && typeof current === 'object' && !Array.isArray(current) ? current : {};
                output[key] = this.deepMerge(currentObject, value);
            }
            else {
                output[key] = value;
            }
        }
        return output;
    }
    slugify(value) {
        return value
            .toLowerCase()
            .normalize('NFD')
            .replace(/\p{Diacritic}/gu, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 40) || 'profile';
    }
    pickEnum(value, allowed, fallback) {
        return allowed.includes(value) ? value : fallback;
    }
    resolveHexOrFallback(value, fallback) {
        return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value) ? value : fallback;
    }
};
exports.ThemeEngineService = ThemeEngineService;
exports.ThemeEngineService = ThemeEngineService = ThemeEngineService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        pages_service_1.PagesService,
        theme_customizer_service_1.ThemeCustomizerService])
], ThemeEngineService);
