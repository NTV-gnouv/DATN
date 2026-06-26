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
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const pages_service_1 = require("../pages/pages.service");
const ai_repository_1 = require("./ai.repository");
const CHAT_STEPS = [
    {
        key: 'social_links',
        prompt: 'Bước 1/3: Hãy điền các liên kết mạng xã hội của bạn.\nVí dụ:\nInstagram: https://instagram.com/tenban\nTikTok: @tenban\nYouTube: https://youtube.com/@tenban\n(Bạn có thể nhập nhiều dòng, không có thì nhập "bỏ qua").',
        parse: (message) => message.trim(),
        validate: (value) => typeof value === 'string' && value.length >= 2,
        invalidMessage: 'Bạn nhập social links theo dạng URL hoặc @username, hoặc gõ "bỏ qua".',
    },
    {
        key: 'profile_brief',
        prompt: 'Bước 2/3: Hãy cung cấp tên, sở thích và công việc của bạn trong 1 tin nhắn.\nVí dụ: "Tôi tên Ngô Thanh Vương, là developer, đam mê gaming và công nghệ web."',
        parse: (message) => message.trim(),
        validate: (value) => typeof value === 'string' && value.length >= 12,
        invalidMessage: 'Bạn mô tả rõ hơn tên + nghề nghiệp + sở thích để AI tạo prompt chính xác.',
    },
    {
        key: 'prompt_template_review',
        prompt: (answers) => {
            const generatedPrompt = String(answers.generated_prompt_template ?? '').trim();
            const fallbackPrompt = 'Bước 3/3: AI đã tạo prompt mẫu. Bạn có thể chỉnh sửa prompt rồi gửi lại, hoặc gõ "dùng prompt mẫu".';
            if (!generatedPrompt) {
                return fallbackPrompt;
            }
            return [
                'Bước 3/3: Đây là prompt mẫu AI đã tự động điền cho bạn.',
                'Bạn có thể sửa nội dung prompt rồi gửi lại, hoặc gõ "dùng prompt mẫu" để giữ nguyên.',
                '',
                generatedPrompt,
            ].join('\n');
        },
        parse: (message) => message.trim(),
        validate: (value) => typeof value === 'string' && value.length >= 2,
        invalidMessage: 'Bạn gửi prompt chỉnh sửa hoặc gõ "dùng prompt mẫu".',
    },
];
function isHexColor(value) {
    return /^#([0-9a-fA-F]{6})$/.test(value.trim());
}
function clampNumber(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
function normalizeHexColor(value, fallback = '#000000') {
    if (!value || typeof value !== 'string') {
        return fallback;
    }
    const trimmed = value.trim().toLowerCase();
    return isHexColor(trimmed) ? trimmed : fallback;
}
function hexToRgb(hex) {
    const normalized = normalizeHexColor(hex);
    return {
        r: Number.parseInt(normalized.slice(1, 3), 16),
        g: Number.parseInt(normalized.slice(3, 5), 16),
        b: Number.parseInt(normalized.slice(5, 7), 16),
    };
}
function rgbToHex(color) {
    const toHex = (value) => clampNumber(Math.round(value), 0, 255).toString(16).padStart(2, '0');
    return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
}
function mixHex(colorA, colorB, ratio) {
    const weight = clampNumber(ratio, 0, 1);
    const rgbA = hexToRgb(colorA);
    const rgbB = hexToRgb(colorB);
    return rgbToHex({
        r: rgbA.r * (1 - weight) + rgbB.r * weight,
        g: rgbA.g * (1 - weight) + rgbB.g * weight,
        b: rgbA.b * (1 - weight) + rgbB.b * weight,
    });
}
function tintHex(hex, amount) {
    return mixHex(hex, '#ffffff', amount);
}
function shadeHex(hex, amount) {
    return mixHex(hex, '#000000', amount);
}
function relativeLuminance(hex) {
    const { r, g, b } = hexToRgb(hex);
    const toLinear = (channel) => {
        const srgb = channel / 255;
        return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}
function readableTextColor(backgroundHex) {
    return relativeLuminance(backgroundHex) > 0.45 ? '#111111' : '#ffffff';
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
    throw new common_1.BadRequestException('Gemini response is not a valid JSON payload.');
}
let AiService = class AiService {
    constructor(configService, pagesService, aiRepository) {
        this.configService = configService;
        this.pagesService = pagesService;
        this.aiRepository = aiRepository;
    }
    async startChat(pageId) {
        if (!pageId) {
            throw new common_1.BadRequestException('pageId is required.');
        }
        const firstPrompt = this.resolveStepPrompt(CHAT_STEPS[0], {});
        const session = await this.aiRepository.create(pageId, firstPrompt);
        return {
            session,
            assistantMessage: firstPrompt,
            nextPrompt: firstPrompt,
            canApply: false,
        };
    }
    async getChatSession(sessionId) {
        const session = await this.aiRepository.get(sessionId);
        if (!session) {
            throw new common_1.NotFoundException('AI chat session not found.');
        }
        return {
            session,
            canApply: session.status === 'ready',
        };
    }
    async sendChatMessage(sessionId, message) {
        if (!message.trim()) {
            throw new common_1.BadRequestException('message is required.');
        }
        const session = await this.aiRepository.get(sessionId);
        if (!session) {
            throw new common_1.NotFoundException('AI chat session not found.');
        }
        if (session.status === 'applied') {
            const assistantMessage = 'AI Theme đã được áp dụng cho session này. Bạn có thể tạo session mới nếu muốn chỉnh lại.';
            const nextSession = await this.appendAssistantMessage(session, assistantMessage);
            return {
                session: nextSession,
                assistantMessage,
                nextPrompt: null,
                canApply: false,
            };
        }
        let nextSession = await this.appendUserMessage(session, message);
        const activeStepIndex = this.findNextStepIndex(nextSession.currentStep, nextSession.answers);
        if (activeStepIndex >= CHAT_STEPS.length) {
            nextSession.status = 'ready';
            const readyMessage = this.buildReadyMessage(nextSession.answers);
            nextSession = await this.appendAssistantMessage(nextSession, readyMessage);
            nextSession = await this.aiRepository.save(nextSession);
            return {
                session: nextSession,
                assistantMessage: readyMessage,
                nextPrompt: null,
                canApply: true,
            };
        }
        const activeStep = CHAT_STEPS[activeStepIndex];
        const parsedValue = activeStep.parse(message);
        if (!activeStep.validate(parsedValue)) {
            const activePrompt = this.resolveStepPrompt(activeStep, nextSession.answers);
            const assistantMessage = `${activeStep.invalidMessage}\n\n${activePrompt}`;
            nextSession = await this.appendAssistantMessage(nextSession, assistantMessage);
            nextSession.currentStep = activeStepIndex;
            nextSession = await this.aiRepository.save(nextSession);
            return {
                session: nextSession,
                assistantMessage,
                nextPrompt: activePrompt,
                canApply: false,
            };
        }
        nextSession.answers = this.buildStepAnswers(activeStep.key, parsedValue, nextSession.answers);
        nextSession.currentStep = activeStepIndex + 1;
        const upcomingStepIndex = this.findNextStepIndex(nextSession.currentStep, nextSession.answers);
        if (upcomingStepIndex >= CHAT_STEPS.length) {
            nextSession.status = 'ready';
            const readyMessage = this.buildReadyMessage(nextSession.answers);
            nextSession = await this.appendAssistantMessage(nextSession, readyMessage);
            nextSession = await this.aiRepository.save(nextSession);
            return {
                session: nextSession,
                assistantMessage: readyMessage,
                nextPrompt: null,
                canApply: true,
            };
        }
        const nextPrompt = this.resolveStepPrompt(CHAT_STEPS[upcomingStepIndex], nextSession.answers);
        nextSession = await this.appendAssistantMessage(nextSession, nextPrompt);
        nextSession = await this.aiRepository.save(nextSession);
        return {
            session: nextSession,
            assistantMessage: nextPrompt,
            nextPrompt,
            canApply: false,
        };
    }
    async applyChatSession(sessionId) {
        const session = await this.aiRepository.get(sessionId);
        if (!session) {
            throw new common_1.NotFoundException('AI chat session not found.');
        }
        const normalizedAnswers = this.buildAnswersFromSession(session.answers);
        const result = await this.applyAiTheme({
            pageId: session.pageId,
            answers: normalizedAnswers,
        });
        const nextSession = {
            ...session,
            status: 'applied',
        };
        const assistantMessage = 'Đã áp dụng AI Theme thành công vào Header block và cấu hình theme của trang.';
        const saved = await this.appendAssistantMessage(nextSession, assistantMessage);
        await this.aiRepository.save(saved);
        return {
            ...result,
            session: saved,
            assistantMessage,
        };
    }
    async applyAiTheme(payload) {
        if (!payload?.pageId) {
            throw new common_1.BadRequestException('pageId is required.');
        }
        if (!payload.answers?.displayName || !payload.answers?.bio) {
            throw new common_1.BadRequestException('displayName and bio are required.');
        }
        const existingConfig = await this.pagesService.getEditorConfig(payload.pageId);
        if (!existingConfig?.headerBlock || typeof existingConfig.headerBlock !== 'object') {
            throw new common_1.BadRequestException('Current header block configuration is missing.');
        }
        const normalizedAnswers = this.normalizeAnswers(payload.answers);
        const suggestion = await this.generateThemeSuggestion(normalizedAnswers);
        const pexelsImage = suggestion.colors.pageBackgroundMode === 'image'
            ? await this.searchPexelsImageWithFallbacks(suggestion.backgroundSearchQuery || normalizedAnswers.backgroundQuery || `${normalizedAnswers.category} portrait`, normalizedAnswers.category, normalizedAnswers.tone)
            : '';
        const scopedThemeId = `ai-theme-${payload.pageId}`;
        const mergedHeaderBlock = this.buildNextHeaderBlock(existingConfig.headerBlock, normalizedAnswers, suggestion, pexelsImage, scopedThemeId);
        const themeTokens = {
            ownerPageId: payload.pageId,
            generatedAt: new Date().toISOString(),
            sourcePrompt: normalizedAnswers.notes ?? '',
            sourceProfile: {
                displayName: normalizedAnswers.displayName,
                category: normalizedAnswers.category,
                tone: normalizedAnswers.tone,
            },
        };
        const updatedConfig = await this.pagesService.updateEditorConfig(payload.pageId, {
            themeId: scopedThemeId,
            headerBlockId: String(existingConfig.headerBlockId ?? 'block-header-default'),
            headerBlock: mergedHeaderBlock,
            themeTokens,
        });
        return {
            pageId: payload.pageId,
            themeId: scopedThemeId,
            suggestedTagline: suggestion.suggestedTagline,
            pexelsImageUrl: pexelsImage || null,
            editorConfig: updatedConfig,
        };
    }
    async autoApplyAiTheme(payload) {
        if (!payload?.pageId) {
            throw new common_1.BadRequestException('pageId is required.');
        }
        if (!payload?.username?.trim()) {
            throw new common_1.BadRequestException('username is required.');
        }
        if (!payload?.description?.trim()) {
            throw new common_1.BadRequestException('description is required.');
        }
        if (!payload?.industry?.trim()) {
            throw new common_1.BadRequestException('industry is required.');
        }
        const baseDisplayName = payload.displayName?.trim() || payload.username.trim();
        const cleanedDescription = payload.description.trim();
        const cleanedIndustry = payload.industry.trim();
        const inferred = this.inferAnswersFromBrief(`${baseDisplayName}. Industry: ${cleanedIndustry}. ${cleanedDescription}`.trim());
        const socials = (payload.socialLinks ?? [])
            .map((item) => ({
            platform: String(item.platform ?? '').trim(),
            url: String(item.url ?? '').trim(),
        }))
            .filter((item) => item.platform.length > 0 && item.url.length > 0);
        const includeBackgroundImage = true;
        const backgroundQuery = this.inferBackgroundQueryFromBrief(cleanedDescription, cleanedIndustry || inferred.category, inferred.tone);
        return this.applyAiTheme({
            pageId: payload.pageId,
            answers: this.normalizeAnswers({
                displayName: baseDisplayName,
                bio: cleanedDescription.slice(0, 280),
                category: cleanedIndustry || inferred.category,
                targetAudience: inferred.targetAudience,
                tone: inferred.tone,
                preferredFont: inferred.preferredFont,
                colorStyle: `${cleanedIndustry} ${cleanedDescription}`.trim(),
                primaryColor: inferred.primaryColor,
                accentColor: inferred.accentColor,
                includeSocials: socials.length > 0,
                socials,
                includeBackgroundImage,
                backgroundQuery,
                notes: `username: ${payload.username.trim()}\nindustry: ${cleanedIndustry}\ndescription: ${cleanedDescription}`,
            }),
        });
    }
    normalizeAnswers(answers) {
        return {
            displayName: answers.displayName.trim(),
            bio: answers.bio.trim(),
            category: answers.category.trim(),
            targetAudience: answers.targetAudience.trim(),
            tone: answers.tone.trim(),
            preferredFont: answers.preferredFont.trim() || 'Inter',
            colorStyle: answers.colorStyle.trim(),
            primaryColor: isHexColor(answers.primaryColor) ? answers.primaryColor : '#d4a800',
            accentColor: isHexColor(answers.accentColor) ? answers.accentColor : '#876200',
            includeSocials: Boolean(answers.includeSocials),
            socials: Array.isArray(answers.socials) ? answers.socials : [],
            includeBackgroundImage: Boolean(answers.includeBackgroundImage),
            backgroundQuery: answers.backgroundQuery?.trim() ?? '',
            notes: answers.notes?.trim() ?? '',
        };
    }
    resolveStepPrompt(step, answers) {
        return typeof step.prompt === 'function' ? step.prompt(answers) : step.prompt;
    }
    parseSocialLinksFromText(rawInput) {
        const raw = rawInput.trim();
        if (!raw || /^(bo qua|bỏ qua|skip|none|khong co|không có)$/i.test(raw)) {
            return [];
        }
        const lines = raw
            .split(/\n|,/)
            .map((item) => item.trim())
            .filter(Boolean);
        const knownPlatforms = [
            { token: /instagram|ig/i, platform: 'Instagram', baseUrl: 'https://instagram.com/' },
            { token: /tiktok|tik tok/i, platform: 'TikTok', baseUrl: 'https://www.tiktok.com/@' },
            { token: /youtube|yt/i, platform: 'YouTube', baseUrl: 'https://www.youtube.com/@' },
            { token: /twitch/i, platform: 'Twitch', baseUrl: 'https://www.twitch.tv/' },
            { token: /x\b|twitter/i, platform: 'X', baseUrl: 'https://x.com/' },
            { token: /linkedin/i, platform: 'LinkedIn', baseUrl: 'https://www.linkedin.com/in/' },
            { token: /facebook|fb/i, platform: 'Facebook', baseUrl: 'https://www.facebook.com/' },
        ];
        const socials = [];
        for (const line of lines) {
            const platformRule = knownPlatforms.find((item) => item.token.test(line));
            const urlMatch = line.match(/https?:\/\/[^\s]+/i);
            const usernameMatch = line.match(/@([a-zA-Z0-9._-]+)/);
            if (!platformRule && !urlMatch) {
                continue;
            }
            let url = urlMatch?.[0]?.trim() ?? '';
            if (!url && platformRule && usernameMatch?.[1]) {
                const username = usernameMatch[1].trim();
                url = platformRule.baseUrl + username;
            }
            if (!url) {
                continue;
            }
            const platform = platformRule?.platform ?? 'Website';
            if (!socials.some((item) => item.platform === platform)) {
                socials.push({ platform, url });
            }
        }
        return socials;
    }
    readSocialLinks(value) {
        if (!Array.isArray(value)) {
            return [];
        }
        return value
            .map((item) => ({
            platform: typeof item?.platform === 'string' ? item.platform.trim() : '',
            url: typeof item?.url === 'string' ? item.url.trim() : '',
        }))
            .filter((item) => item.platform.length > 0 && item.url.length > 0);
    }
    buildCustomerPromptTemplate(analysis, inferred, socials) {
        const majorField = inferred.category === 'Developer' ? 'công nghệ và sản phẩm số' : inferred.category.toLowerCase();
        const hobby = analysis.passions.filter((item) => item !== inferred.category).join(', ') || 'chuyên môn cá nhân';
        const contentStyle = inferred.tone === 'Creative' ? 'năng động, sáng tạo' : inferred.tone === 'Professional' ? 'chuyên nghiệp, rõ ràng' : 'hiện đại, thân thiện';
        const designStyle = inferred.tone === 'Creative' ? 'hiện đại, có điểm nhấn gradient' : 'tối giản, dễ đọc';
        const emotion = inferred.tone === 'Creative' ? 'truyền cảm hứng và nổi bật' : 'tin cậy và chuyên nghiệp';
        const favoriteColors = `${inferred.primaryColor} và ${inferred.accentColor}`;
        const personality = analysis.profession === 'Developer' ? 'tư duy logic, hiện đại và yêu công nghệ' : 'cá tính riêng, thân thiện và chuyên nghiệp';
        const goal = socials.length ? 'xây dựng profile cá nhân và tăng chuyển đổi từ social' : 'xây dựng profile cá nhân nổi bật';
        const highlight = socials.length
            ? 'mạng xã hội, dự án, portfolio'
            : 'dự án, bài viết, sản phẩm, dịch vụ hoặc portfolio';
        return [
            `Tạo một landing page cá nhân một vài thông tin của tôi : Tên : ${analysis.cleanName} dành cho một ${analysis.suggestedTitle} tập trung vào ${majorField}, ${hobby} và ${contentStyle}.`,
            '',
            `Trang nên phản ánh rõ cá tính của người dùng với phong cách ${designStyle}, mang lại cảm giác ${emotion}.`,
            '',
            `Bảng màu nên lấy cảm hứng từ ${favoriteColors}, kết hợp hài hòa với hình ảnh và nội dung để thể hiện ${personality}.`,
            '',
            `Bố cục cần phù hợp với mục tiêu ${goal}, ưu tiên làm nổi bật ${highlight}.`,
        ].join('\n');
    }
    resolveFinalPrompt(userInput, generatedPrompt) {
        const normalized = userInput.trim().toLowerCase();
        if (!generatedPrompt) {
            return userInput.trim();
        }
        if (/^((dùng|dung|giu|giữ|ok|okay|yes).*(prompt|mẫu)|auto|mac dinh|mặc định)$/i.test(normalized)) {
            return generatedPrompt;
        }
        return userInput.trim();
    }
    buildStepAnswers(stepKey, parsedValue, answers) {
        if (stepKey === 'social_links') {
            const socialRaw = String(parsedValue ?? '').trim();
            const socials = this.parseSocialLinksFromText(socialRaw);
            return {
                ...answers,
                social_links_raw: socialRaw,
                social_links: socials,
            };
        }
        if (stepKey === 'profile_brief') {
            const brief = String(parsedValue ?? '').trim();
            const inferred = this.inferAnswersFromBrief(brief);
            const analysis = this.buildProfileAnalysis(inferred, brief);
            const socials = this.readSocialLinks(answers.social_links);
            const generatedPrompt = this.buildCustomerPromptTemplate(analysis, inferred, socials);
            return {
                ...answers,
                profile_brief: brief,
                profile_analysis: analysis,
                generated_prompt_template: generatedPrompt,
            };
        }
        if (stepKey === 'prompt_template_review') {
            const rawMessage = String(parsedValue ?? '').trim();
            const generatedPrompt = String(answers.generated_prompt_template ?? '').trim();
            return {
                ...answers,
                final_prompt_template: this.resolveFinalPrompt(rawMessage, generatedPrompt),
            };
        }
        return {
            ...answers,
            [stepKey]: parsedValue,
        };
    }
    findNextStepIndex(startIndex, answers) {
        for (let index = startIndex; index < CHAT_STEPS.length; index += 1) {
            const step = CHAT_STEPS[index];
            if (step.shouldAsk && !step.shouldAsk(answers)) {
                continue;
            }
            return index;
        }
        return CHAT_STEPS.length;
    }
    buildReadyMessage(answers) {
        const analysis = this.readProfileAnalysis(answers.profile_analysis);
        const inferred = this.inferAnswersFromBrief(String(answers.profile_brief ?? ''));
        const socials = this.readSocialLinks(answers.social_links);
        const finalPrompt = String(answers.final_prompt_template ?? answers.generated_prompt_template ?? '').trim();
        const socialLines = socials.length
            ? socials.map((social) => `- ${social.platform}: ${social.url}`).join('\n')
            : '- Chưa cung cấp';
        return [
            'Hồ sơ hoàn chỉnh đề xuất:',
            '',
            `Tên hiển thị: ${analysis.suggestedDisplayName}`,
            `Chức danh: ${analysis.suggestedTitle}`,
            `Lĩnh vực chính: ${inferred.category}`,
            '',
            `Giới thiệu: ${analysis.shortIntro}`,
            '',
            `Mô tả: ${analysis.longDescription}`,
            '',
            'Liên kết mạng xã hội:',
            socialLines,
            '',
            'Prompt mẫu cuối cùng:',
            finalPrompt || 'Chưa có prompt mẫu',
            'Bây giờ bạn bấm nút **Áp dụng AI Theme** để tạo và áp dụng vào trang.',
        ].join('\n');
    }
    buildAnswersFromSession(answers) {
        const brief = String(answers.profile_brief ?? '').trim();
        if (!brief) {
            throw new common_1.BadRequestException('Session data is incomplete. Continue chat before applying theme.');
        }
        const inferred = this.inferAnswersFromBrief(brief);
        const analysis = this.readProfileAnalysis(answers.profile_analysis);
        const socials = this.readSocialLinks(answers.social_links);
        const finalPrompt = String(answers.final_prompt_template ?? answers.generated_prompt_template ?? '').trim();
        const includeBackgroundImage = !/(không ảnh|khong anh|nền trơn|nen tron|solid)/i.test(`${brief} ${finalPrompt}`);
        const backgroundQuery = includeBackgroundImage
            ? this.inferBackgroundQueryFromBrief(finalPrompt || brief, inferred.category, inferred.tone)
            : '';
        return this.normalizeAnswers({
            displayName: analysis.suggestedDisplayName || inferred.displayName,
            bio: analysis.shortIntro || inferred.bio,
            category: inferred.category,
            targetAudience: inferred.targetAudience,
            tone: inferred.tone,
            preferredFont: inferred.preferredFont,
            colorStyle: finalPrompt || inferred.colorStyle,
            primaryColor: inferred.primaryColor,
            accentColor: inferred.accentColor,
            includeSocials: socials.length > 0,
            socials,
            includeBackgroundImage,
            backgroundQuery: includeBackgroundImage ? backgroundQuery : '',
            notes: [brief, finalPrompt, analysis.longDescription].filter(Boolean).join('\n'),
        });
    }
    buildProfileAnalysis(inferred, brief) {
        const cleanName = inferred.displayName;
        const firstName = cleanName.split(/\s+/).filter(Boolean).at(-1) ?? cleanName;
        const profession = inferred.category === 'Developer' ? 'Developer' : inferred.category;
        const lowerBrief = brief.toLowerCase();
        const passions = [
            profession,
            /gaming|game|esports/i.test(lowerBrief) ? 'Gaming' : '',
            /công nghệ|cong nghe|tech|ai|web/i.test(lowerBrief) ? 'Công nghệ' : '',
        ].filter(Boolean);
        const characteristics = profession === 'Developer'
            ? [
                'Giao diện tối (Dark Mode)',
                'Hiệu ứng ánh sáng nhẹ',
                'Gradient hiện đại',
                'Bo góc vừa phải',
                'Typography mạnh mẽ',
                'Cảm hứng từ dashboard công nghệ và gaming',
            ]
            : [
                'Bố cục gọn gàng, hiện đại',
                'Màu sắc nhấn có chủ đích',
                'Typography rõ ràng, dễ đọc',
                'Thẻ nội dung bo góc mềm',
                'Tương phản tốt cho mobile',
                'Tập trung vào nhận diện cá nhân',
            ];
        const suggestedDisplayName = profession === 'Developer' ? `${firstName}.Dev` : cleanName;
        const suggestedTitle = profession === 'Developer'
            ? 'Full Stack Developer & Product Builder'
            : `${profession} & Creator`;
        const shortIntro = profession === 'Developer'
            ? 'Developer đam mê công nghệ, gaming và xây dựng các sản phẩm số hiện đại.'
            : `${cleanName} tập trung xây dựng nội dung chất lượng và trải nghiệm số hiện đại.`;
        const longDescription = profession === 'Developer'
            ? 'Tôi là một Full Stack Developer yêu thích phát triển ứng dụng web, nghiên cứu công nghệ mới và khám phá thế giới gaming. Tôi luôn hướng đến việc tạo ra những sản phẩm có trải nghiệm tốt, hiệu năng cao và mang lại giá trị thực tế cho người dùng.'
            : `Tôi tập trung xây dựng trải nghiệm nội dung chuyên nghiệp, hiện đại và mang lại giá trị thực tế cho cộng đồng mục tiêu của mình.`;
        return {
            cleanName,
            profession,
            passions,
            designDirection: inferred.tone || 'Modern',
            characteristics,
            suggestedDisplayName,
            suggestedTitle,
            shortIntro,
            longDescription,
        };
    }
    buildPaletteOptions(inferred, brief) {
        const lowerBrief = brief.toLowerCase();
        const isGaming = /gaming|game|esports/i.test(lowerBrief);
        const isDeveloper = inferred.category === 'Developer';
        const primaryBase = normalizeHexColor(inferred.primaryColor, '#4f46e5');
        const accentBase = normalizeHexColor(inferred.accentColor, '#06b6d4');
        const darkSurface = '#0b1020';
        const darkAccent = mixHex('#7c3aed', accentBase, 0.45);
        const neonAccent = mixHex('#22d3ee', primaryBase, 0.3);
        return [
            {
                id: 'palette-1',
                name: isGaming || isDeveloper ? 'Cyber Dark Neon' : 'Modern Dark Pulse',
                primary: isGaming || isDeveloper ? darkAccent : shadeHex(primaryBase, 0.2),
                accent: isGaming || isDeveloper ? neonAccent : accentBase,
                description: 'Nền tối hiện đại, điểm nhấn neon nhẹ, phù hợp công nghệ/gaming.',
                recommendedBackgroundMode: 'gradient',
                backgroundQueryHint: 'dark gaming setup neon',
            },
            {
                id: 'palette-2',
                name: 'Indigo Aurora',
                primary: primaryBase,
                accent: mixHex(accentBase, '#a78bfa', 0.5),
                description: 'Gradient cân bằng giữa chuyên nghiệp và sáng tạo.',
                recommendedBackgroundMode: 'gradient',
                backgroundQueryHint: 'modern tech workspace portrait',
            },
            {
                id: 'palette-3',
                name: 'Slate Clean Pro',
                primary: mixHex(darkSurface, '#334155', 0.4),
                accent: tintHex(accentBase, 0.2),
                description: 'Phong cách tối giản, tương phản rõ, phù hợp hồ sơ chuyên nghiệp.',
                recommendedBackgroundMode: 'solid',
                backgroundQueryHint: '',
            },
        ];
    }
    buildThemeChoicePrompt(analysis, paletteOptions) {
        const characteristics = analysis.characteristics.map((item) => `- ${item}`).join('\n');
        const paletteLines = paletteOptions
            .map((option, index) => `${index + 1}. ${option.name}: ${option.primary} / ${option.accent} — ${option.description}`)
            .join('\n');
        return [
            'Dựa trên thông tin cung cấp:',
            '',
            `Tên: ${analysis.cleanName}`,
            `Nghề nghiệp: ${analysis.profession}`,
            `Phong cách thiết kế phù hợp: ${analysis.designDirection}`,
            'Đặc trưng:',
            characteristics,
            '',
            'Phương án màu sắc đề xuất:',
            paletteLines,
            '',
            'Bạn xác nhận giúp mình theo mẫu:',
            '- Chọn bộ màu: 1 / 2 / 3',
            '- Nền: màu đơn / gradient / ảnh / tự động',
            '',
            `Preview hồ sơ đề xuất: ${analysis.suggestedDisplayName} — ${analysis.suggestedTitle}`,
        ].join('\n');
    }
    parseThemeChoice(message, answers) {
        const normalized = message.toLowerCase();
        const paletteOptions = this.readPaletteOptions(answers.palette_options);
        const defaultPalette = paletteOptions[0]?.id ?? 'palette-1';
        const numberMatch = normalized.match(/\b([123])\b/);
        const selectedByNumber = numberMatch ? Number.parseInt(numberMatch[1], 10) - 1 : -1;
        const selectedPalette = selectedByNumber >= 0 && selectedByNumber < paletteOptions.length
            ? paletteOptions[selectedByNumber].id
            : defaultPalette;
        const backgroundMode = /hình|hinh|ảnh|anh|image|photo/.test(normalized)
            ? 'image'
            : /gradient|chuyển sắc|chuyen sac/.test(normalized)
                ? 'gradient'
                : /màu đơn|mau don|solid|nền trơn|nen tron/.test(normalized)
                    ? 'solid'
                    : /tự động|tu dong|auto|mặc định|mac dinh/.test(normalized)
                        ? 'auto'
                        : 'auto';
        return {
            paletteId: selectedPalette,
            backgroundMode,
            rawMessage: message.trim(),
        };
    }
    readProfileAnalysis(value) {
        const fallback = {
            cleanName: 'Creator',
            profession: 'Creator',
            passions: [],
            designDirection: 'Modern',
            characteristics: ['Giao diện hiện đại', 'Dễ đọc trên mobile'],
            suggestedDisplayName: 'Creator',
            suggestedTitle: 'Creator',
            shortIntro: 'Creator tập trung xây dựng nội dung chất lượng.',
            longDescription: 'Tôi xây dựng nội dung hiện đại, rõ ràng và hướng đến giá trị thực tế cho người dùng.',
        };
        if (!value || typeof value !== 'object') {
            return fallback;
        }
        return {
            ...fallback,
            ...value,
        };
    }
    readPaletteOptions(value) {
        if (!Array.isArray(value)) {
            return [];
        }
        return value.filter((item) => {
            return Boolean(item && typeof item === 'object' && typeof item.id === 'string');
        });
    }
    readThemeChoice(value) {
        if (!value || typeof value !== 'object') {
            return null;
        }
        const parsed = value;
        if (!parsed.paletteId || typeof parsed.paletteId !== 'string') {
            return null;
        }
        return {
            paletteId: parsed.paletteId,
            backgroundMode: parsed.backgroundMode === 'solid' || parsed.backgroundMode === 'gradient' || parsed.backgroundMode === 'image'
                ? parsed.backgroundMode
                : 'auto',
            rawMessage: typeof parsed.rawMessage === 'string' ? parsed.rawMessage : '',
        };
    }
    resolveSelectedPalette(paletteOptions, choice) {
        const fallback = paletteOptions[0] ?? {
            id: 'palette-1',
            name: 'Modern Default',
            primary: '#4f46e5',
            accent: '#06b6d4',
            description: 'Bộ màu mặc định hiện đại',
            recommendedBackgroundMode: 'gradient',
            backgroundQueryHint: 'modern portrait aesthetic',
        };
        if (!choice) {
            return fallback;
        }
        return paletteOptions.find((item) => item.id === choice.paletteId) ?? fallback;
    }
    resolveBackgroundMode(value, fallback) {
        const resolved = value && value !== 'auto' ? value : fallback;
        if (resolved === 'image') {
            return 'ảnh';
        }
        if (resolved === 'solid') {
            return 'màu đơn';
        }
        return 'gradient';
    }
    inferBackgroundQueryFromBrief(brief, category, tone) {
        const lower = brief.toLowerCase();
        const mood = tone === 'Luxury'
            ? 'elegant premium'
            : tone === 'Professional'
                ? 'clean modern corporate'
                : tone === 'Creative'
                    ? 'artistic vibrant'
                    : tone === 'Friendly'
                        ? 'warm soft'
                        : 'minimal modern';
        const hobbyKeywords = [
            { token: /(du lich|du lịch|travel)/i, query: 'travel lifestyle portrait' },
            { token: /(ca phe|cà phê|coffee)/i, query: 'coffee shop aesthetic portrait' },
            { token: /(gym|fitness|workout)/i, query: 'fitness studio portrait' },
            { token: /(thien nhien|thiên nhiên|nature|outdoor)/i, query: 'nature outdoor portrait' },
            { token: /(cong nghe|công nghệ|tech|developer|lap trinh|lập trình)/i, query: 'tech desk cinematic portrait' },
            { token: /(thoi trang|thời trang|fashion)/i, query: 'fashion editorial portrait' },
            { token: /(lam dep|làm đẹp|beauty|makeup)/i, query: 'beauty studio portrait' },
            { token: /(am nhac|âm nhạc|music)/i, query: 'music artist portrait' },
        ];
        const hobbyMatch = hobbyKeywords.find((item) => item.token.test(lower));
        if (hobbyMatch) {
            return `${hobbyMatch.query} ${mood}`;
        }
        return `${category.toLowerCase()} creator portrait ${mood}`;
    }
    inferAnswersFromBrief(brief) {
        const normalizedBrief = brief.trim();
        const lower = normalizedBrief.toLowerCase();
        const hexMatches = normalizedBrief.match(/#[0-9a-fA-F]{6}/g) ?? [];
        const uniqueHex = [...new Set(hexMatches.map((item) => item.toLowerCase()))];
        const extractedName = this.extractNameFromBrief(normalizedBrief);
        const displayName = extractedName.slice(0, 60) || 'Creator';
        const bio = lower.includes('developer')
            ? 'Developer đam mê công nghệ, gaming và xây dựng các sản phẩm số hiện đại.'
            : `${displayName} tập trung xây dựng nội dung chất lượng với phong cách hiện đại.`.slice(0, 120);
        const category = lower.includes('developer') || lower.includes('lap trinh') || lower.includes('lập trình')
            ? 'Developer'
            : lower.includes('fitness') || lower.includes('gym')
                ? 'Fitness'
                : lower.includes('beauty') || lower.includes('lam dep') || lower.includes('làm đẹp')
                    ? 'Beauty'
                    : lower.includes('business') || lower.includes('kinh doanh')
                        ? 'Business'
                        : 'Creator';
        const targetAudienceMatch = normalizedBrief.match(/(khan gia|khán giả|doi tuong|đối tượng|target audience)\s*(?:la|là|:)\s*([^\n.]+)/i);
        const targetAudience = targetAudienceMatch?.[2]?.trim() || 'Người theo dõi tiềm năng của tôi';
        const tone = lower.includes('luxury') || lower.includes('sang trong') || lower.includes('sang trọng')
            ? 'Luxury'
            : lower.includes('gaming') || lower.includes('game')
                ? 'Creative'
                : lower.includes('professional') || lower.includes('chuyen nghiep') || lower.includes('chuyên nghiệp')
                    ? 'Professional'
                    : lower.includes('creative') || lower.includes('sang tao') || lower.includes('sáng tạo')
                        ? 'Creative'
                        : lower.includes('friendly') || lower.includes('than thien') || lower.includes('thân thiện')
                            ? 'Friendly'
                            : 'Modern';
        const preferredFont = lower.includes('poppins')
            ? 'Poppins'
            : lower.includes('montserrat')
                ? 'Montserrat'
                : lower.includes('roboto')
                    ? 'Roboto'
                    : lower.includes('lora')
                        ? 'Lora'
                        : lower.includes('playfair')
                            ? 'Playfair Display'
                            : lower.includes('noto sans')
                                ? 'Noto Sans'
                                : 'Inter';
        const primaryColor = uniqueHex[0] ?? '#d4a800';
        const accentColor = uniqueHex[1] ?? '#876200';
        return {
            displayName,
            bio,
            category,
            targetAudience,
            tone,
            preferredFont,
            colorStyle: normalizedBrief,
            primaryColor,
            accentColor,
            includeSocials: false,
            socials: [],
            includeBackgroundImage: false,
            backgroundQuery: '',
            notes: normalizedBrief,
        };
    }
    extractNameFromBrief(brief) {
        const normalizeWhitespace = (value) => value.replace(/\s+/g, ' ').trim();
        const toTitleCase = (value) => normalizeWhitespace(value)
            .split(' ')
            .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''))
            .join(' ')
            .trim();
        const cutByMarkers = (value) => {
            const markers = [
                ' tôi là ',
                ' toi la ',
                ' mình là ',
                ' minh la ',
                ' i am ',
                " i'm ",
                ' nghề ',
                ' nghe ',
                ' làm ',
                ' lam ',
                ' đam mê ',
                ' dam me ',
                ' thích ',
                ' thich ',
                ' sở thích ',
                ' so thich ',
                ' developer',
                ' dev ',
                ' designer',
            ];
            const lowered = ` ${value.toLowerCase()} `;
            let cutIndex = value.length;
            for (const marker of markers) {
                const markerIndex = lowered.indexOf(marker);
                if (markerIndex > 0) {
                    cutIndex = Math.min(cutIndex, markerIndex - 1);
                }
            }
            return value.slice(0, cutIndex).trim();
        };
        const removeLeadingNoise = (value) => value
            .replace(/^(tôi|toi|mình|minh)\s+(tên|ten)\s*/i, '')
            .replace(/^(tên tôi là|ten toi la)\s*/i, '')
            .replace(/^(tôi là|toi la|mình là|minh la)\s*/i, '')
            .trim();
        const patterns = [
            /(?:tôi tên|toi ten|tên tôi là|ten toi la|my name is)\s+([^,\n.!]+)/i,
            /(?:tôi là|toi la|i am|i'm)\s+([^,\n.!]+)/i,
        ];
        for (const pattern of patterns) {
            const match = brief.match(pattern);
            if (!match?.[1]) {
                continue;
            }
            let candidate = removeLeadingNoise(match[1]);
            candidate = cutByMarkers(candidate);
            candidate = candidate.replace(/\s+(tôi|toi|là|la)$/i, '').trim();
            const cleaned = toTitleCase(candidate);
            if (cleaned.length >= 2) {
                return cleaned;
            }
        }
        const firstPart = toTitleCase(cutByMarkers(removeLeadingNoise(brief.split(/[\n,.!]/)[0] ?? '')));
        return firstPart || 'Creator';
    }
    async appendUserMessage(session, content) {
        return {
            ...session,
            messages: [
                ...(session.messages ?? []),
                {
                    role: 'user',
                    content,
                    createdAt: new Date().toISOString(),
                },
            ],
        };
    }
    async appendAssistantMessage(session, content) {
        return {
            ...session,
            messages: [
                ...(session.messages ?? []),
                {
                    role: 'assistant',
                    content,
                    createdAt: new Date().toISOString(),
                },
            ],
        };
    }
    async generateThemeSuggestion(answers) {
        const geminiApiKey = this.configService.get('GEMINI_API_KEY') ?? '';
        if (!geminiApiKey) {
            throw new common_1.BadRequestException('Missing GEMINI_API_KEY environment variable.');
        }
        const configuredModel = this.configService.get('GEMINI_MODEL') ?? 'gemini-2.5-flash';
        const fallbackModels = ['gemini-2.0-flash-lite', 'gemini-2.0-flash'];
        const geminiModels = [configuredModel, ...fallbackModels].filter(Boolean);
        const uniqueModels = [...new Set(geminiModels)];
        const prompt = this.buildGeminiThemePrompt(answers);
        let lastError = null;
        for (const geminiModel of uniqueModels) {
            try {
                const rawText = await this.requestGeminiRawText(geminiApiKey, geminiModel, prompt);
                const parsed = extractJsonPayload(rawText);
                return this.normalizeGeminiSuggestion(parsed, answers);
            }
            catch (error) {
                const requestError = error;
                lastError = requestError;
            }
        }
        if (lastError) {
            const fallbackSuggestion = this.buildDeterministicThemeSuggestion(answers);
            return this.normalizeGeminiSuggestion(fallbackSuggestion, answers);
        }
        return this.normalizeGeminiSuggestion(this.buildDeterministicThemeSuggestion(answers), answers);
    }
    buildGeminiThemePrompt(answers) {
        const designInput = {
            creator: {
                brief: answers.notes,
                displayName: answers.displayName,
                bio: answers.bio,
                category: answers.category,
                targetAudience: answers.targetAudience,
                tone: answers.tone,
                preferredFont: answers.preferredFont,
                colorStyle: answers.colorStyle,
                referencePrimaryColor: answers.primaryColor,
                referenceAccentColor: answers.accentColor,
                includeBackgroundImage: answers.includeBackgroundImage,
                backgroundQueryHint: answers.backgroundQuery,
            },
            designModes: {
                background: [
                    { mode: 'solid', when: 'minimal, professional, clean, calm personality' },
                    { mode: 'gradient', when: 'creative, energetic, modern, youthful personality' },
                    { mode: 'image', when: 'lifestyle, travel, beauty, fitness, fashion, food, music, nature personality' },
                ],
                avatarSizeGuide: [
                    { style: 'minimal-professional', sizeRange: '80-96' },
                    { style: 'expressive-bold-creative', sizeRange: '100-128' },
                ],
            },
            goal: 'auto-personalized modern theme, not rigid templates',
        };
        return `
You are a senior UI/UX art director for creator landing pages.
Return ONLY valid minified JSON with the exact output schema. No markdown, no explanation text.

OBJECTIVE:
- Auto-generate a theme from creator personality and context.
- Improve profile bio/tagline quality to sound professional and compelling.
- Build a modern color system with strong contrast and visual harmony.
- Do NOT mechanically copy the input colors; reinterpret them into a better modern palette.

HARD RULES:
1) profile.displayName: polished creator name, <= 50 chars.
2) profile.bio and suggestedTagline: high-quality marketing copy, natural tone, same language as creator input.
3) typography.fontFamily must be one of [Inter, Roboto, Poppins, Montserrat, Lora, Playfair Display, Noto Sans, System].
4) typography.fontWeight:
   - 400: light/minimal,
   - 500: modern/professional,
   - 600: luxury/bold.
5) colors must look contemporary (2026 style), avoid dull generic white/black only combinations.
6) colors.pageBackgroundMode MUST be exactly one of ["solid","gradient","image"] and chosen by personality.
7) If pageBackgroundMode = "image", backgroundSearchQuery is REQUIRED and must be an English Pexels query with 3-6 words.
8) If mode is not "image", backgroundSearchQuery must be "".
9) avatar.shape: circle or square; avatar.size between 80 and 128.
10) divLayout.borderRadius between 8 and 28, borderWidth 1-2, widthPercent 88-100.

INPUT SAMPLE DATA (for reasoning context):
${JSON.stringify(designInput, null, 2)}

OUTPUT JSON SCHEMA (fill all fields):
{
  "profile":{"displayName":"string","bio":"string"},
  "typography":{"fontFamily":"Inter","fontWeight":500},
  "colors":{
    "headerTextAndIcon":"#111111",
    "socialBlockBackground":"#f5f5f5",
    "socialBlockText":"#333333",
    "contentBlockBackground":"#ffffff",
    "contentBlockText":"#222222",
    "contentBlockButton":"#0066ff",
    "pageBackgroundMode":"gradient",
    "pageBackgroundSolid":"#ffffff",
    "pageBackgroundGradientStart":"#0066ff",
    "pageBackgroundGradientEnd":"#00c9ff",
    "pageBackgroundGradientType":"linear"
  },
  "avatar":{"shape":"circle","size":96},
  "divLayout":{"widthPercent":96,"borderRadius":16,"borderColor":"#e0e0e0","borderWidth":1,"enableShadow":true},
  "backgroundSearchQuery":"",
  "suggestedTagline":"string"
}
`;
    }
    buildDeterministicThemeSuggestion(answers) {
        const fallbackPrimary = normalizeHexColor(answers.primaryColor, '#4f46e5');
        const fallbackAccent = normalizeHexColor(answers.accentColor, '#06b6d4');
        const isLuxury = answers.tone.toLowerCase().includes('luxury');
        const isCreative = answers.tone.toLowerCase().includes('creative');
        const isProfessional = answers.tone.toLowerCase().includes('professional');
        const isFriendly = answers.tone.toLowerCase().includes('friendly');
        const personaSignal = `${answers.category} ${answers.tone} ${answers.notes ?? ''}`.toLowerCase();
        const requestsSolid = /(solid|màu đơn|mau don|minimal|professional|corporate|clean)/i.test(personaSignal);
        const requestsGradient = /(gradient|chuyển sắc|chuyen sac|energetic|vibrant|creative|neon)/i.test(personaSignal);
        const isLifestyle = /travel|fitness|beauty|fashion|music|food|nature|lifestyle/i.test(personaSignal);
        const backgroundMode = (answers.includeBackgroundImage && !requestsSolid) || isLifestyle
            ? 'image'
            : requestsSolid || isProfessional
                ? 'solid'
                : requestsGradient || isCreative || isLuxury
                    ? 'gradient'
                    : 'gradient';
        const backgroundSearchQuery = backgroundMode === 'image'
            ? this.inferBackgroundQueryFromBrief(answers.notes ?? '', answers.category, answers.tone)
            : '';
        const solidBackground = isProfessional ? tintHex(fallbackPrimary, 0.95) : tintHex(fallbackAccent, 0.92);
        const gradientStart = isLuxury ? shadeHex(fallbackPrimary, 0.15) : fallbackPrimary;
        const gradientEnd = isLuxury ? tintHex(fallbackAccent, 0.12) : mixHex(fallbackPrimary, fallbackAccent, 0.55);
        const socialBackground = isFriendly ? tintHex(fallbackAccent, 0.85) : tintHex(fallbackPrimary, 0.88);
        const contentBackground = tintHex(fallbackPrimary, 0.97);
        const contentText = readableTextColor(contentBackground);
        const socialText = readableTextColor(socialBackground);
        const buttonColor = isLuxury ? shadeHex(fallbackPrimary, 0.1) : mixHex(fallbackPrimary, fallbackAccent, 0.2);
        const borderColor = mixHex(fallbackPrimary, '#ffffff', 0.72);
        return {
            profile: {
                displayName: answers.displayName.trim(),
                bio: answers.bio.trim(),
            },
            typography: {
                fontFamily: answers.preferredFont || 'Inter',
                fontWeight: isLuxury ? 600 : isProfessional ? 500 : 400,
            },
            colors: {
                headerTextAndIcon: backgroundMode === 'image' ? '#ffffff' : readableTextColor(solidBackground),
                socialBlockBackground: socialBackground,
                socialBlockText: socialText,
                contentBlockBackground: contentBackground,
                contentBlockText: contentText,
                contentBlockButton: buttonColor,
                pageBackgroundMode: backgroundMode,
                pageBackgroundSolid: solidBackground,
                pageBackgroundGradientStart: gradientStart,
                pageBackgroundGradientEnd: gradientEnd,
                pageBackgroundGradientType: isLuxury ? 'radial' : isCreative ? 'diagonal' : 'linear',
            },
            avatar: {
                shape: isCreative || isProfessional ? 'square' : 'circle',
                size: isLuxury || isCreative ? 112 : isFriendly ? 104 : 96,
            },
            divLayout: {
                widthPercent: isCreative ? 92 : isLuxury ? 94 : 100,
                borderRadius: isLuxury ? 24 : isCreative ? 20 : isProfessional ? 10 : 16,
                borderColor,
                borderWidth: isLuxury ? 2 : 1,
                enableShadow: true,
            },
            backgroundSearchQuery,
            suggestedTagline: `${answers.displayName.trim()} • ${answers.category.trim()}`,
        };
    }
    async requestGeminiRawText(apiKey, model, prompt) {
        const maxAttempts = 3;
        for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.7,
                        topP: 0.9,
                        maxOutputTokens: 1500,
                        responseMimeType: 'application/json',
                    },
                }),
            });
            if (!response.ok) {
                const responseBody = await response.text();
                const error = new Error(`Gemini API request failed: ${response.status} ${responseBody}`);
                error.status = response.status;
                error.model = model;
                error.responseBody = responseBody;
                if (this.isTransientGeminiError(error) && attempt < maxAttempts) {
                    await this.delay(200 * attempt);
                    continue;
                }
                throw error;
            }
            const payload = (await response.json());
            const rawText = payload.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
            if (!rawText.trim()) {
                const error = new Error('Gemini returned an empty response.');
                error.status = 502;
                error.model = model;
                if (attempt < maxAttempts) {
                    await this.delay(200 * attempt);
                    continue;
                }
                throw error;
            }
            return rawText;
        }
        throw new common_1.InternalServerErrorException(`Gemini API request failed (${model}): exhausted retries.`);
    }
    delay(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }
    isTransientGeminiError(error) {
        const status = error?.status ?? 0;
        return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
    }
    normalizeGeminiSuggestion(parsed, answers) {
        const fallback = this.buildDeterministicThemeSuggestion(answers);
        const rawMode = parsed?.colors?.pageBackgroundMode;
        const pageBackgroundMode = rawMode === 'gradient' ? 'gradient' : rawMode === 'image' ? 'image' : 'solid';
        const fallbackSearchQuery = pageBackgroundMode === 'image' ? fallback.backgroundSearchQuery : '';
        const parsedSearchQuery = typeof parsed?.backgroundSearchQuery === 'string' ? parsed.backgroundSearchQuery.trim() : '';
        return {
            profile: {
                displayName: parsed?.profile?.displayName?.trim() || fallback.profile.displayName,
                bio: parsed?.profile?.bio?.trim() || fallback.profile.bio,
            },
            typography: {
                fontFamily: parsed?.typography?.fontFamily || fallback.typography.fontFamily,
                fontWeight: clampNumber(Number(parsed?.typography?.fontWeight ?? fallback.typography.fontWeight), 300, 800),
            },
            colors: {
                headerTextAndIcon: isHexColor(parsed?.colors?.headerTextAndIcon || '') ? parsed.colors.headerTextAndIcon : '#111111',
                socialBlockBackground: isHexColor(parsed?.colors?.socialBlockBackground || '')
                    ? parsed.colors.socialBlockBackground
                    : fallback.colors.socialBlockBackground,
                socialBlockText: isHexColor(parsed?.colors?.socialBlockText || '')
                    ? parsed.colors.socialBlockText
                    : fallback.colors.socialBlockText,
                contentBlockBackground: isHexColor(parsed?.colors?.contentBlockBackground || '')
                    ? parsed.colors.contentBlockBackground
                    : fallback.colors.contentBlockBackground,
                contentBlockText: isHexColor(parsed?.colors?.contentBlockText || '')
                    ? parsed.colors.contentBlockText
                    : fallback.colors.contentBlockText,
                contentBlockButton: isHexColor(parsed?.colors?.contentBlockButton || '')
                    ? parsed.colors.contentBlockButton
                    : fallback.colors.contentBlockButton,
                pageBackgroundMode,
                pageBackgroundSolid: isHexColor(parsed?.colors?.pageBackgroundSolid || '')
                    ? parsed.colors.pageBackgroundSolid
                    : fallback.colors.pageBackgroundSolid,
                pageBackgroundGradientStart: isHexColor(parsed?.colors?.pageBackgroundGradientStart || '')
                    ? parsed.colors.pageBackgroundGradientStart
                    : fallback.colors.pageBackgroundGradientStart,
                pageBackgroundGradientEnd: isHexColor(parsed?.colors?.pageBackgroundGradientEnd || '')
                    ? parsed.colors.pageBackgroundGradientEnd
                    : fallback.colors.pageBackgroundGradientEnd,
                pageBackgroundGradientType: ['linear', 'radial', 'diagonal'].includes(parsed?.colors?.pageBackgroundGradientType)
                    ? parsed.colors.pageBackgroundGradientType
                    : fallback.colors.pageBackgroundGradientType,
            },
            avatar: {
                shape: parsed?.avatar?.shape === 'square' ? 'square' : 'circle',
                size: clampNumber(Number(parsed?.avatar?.size ?? fallback.avatar.size), 80, 128),
            },
            divLayout: {
                widthPercent: clampNumber(Number(parsed?.divLayout?.widthPercent ?? fallback.divLayout.widthPercent), 88, 100),
                borderRadius: clampNumber(Number(parsed?.divLayout?.borderRadius ?? fallback.divLayout.borderRadius), 8, 28),
                borderColor: isHexColor(parsed?.divLayout?.borderColor || '') ? parsed.divLayout.borderColor : fallback.divLayout.borderColor,
                borderWidth: clampNumber(Number(parsed?.divLayout?.borderWidth ?? fallback.divLayout.borderWidth), 1, 2),
                enableShadow: parsed?.divLayout?.enableShadow ?? fallback.divLayout.enableShadow,
            },
            backgroundSearchQuery: pageBackgroundMode === 'image' ? parsedSearchQuery || fallbackSearchQuery : '',
            suggestedTagline: parsed?.suggestedTagline?.trim() || fallback.suggestedTagline,
        };
    }
    async searchPexelsImage(query) {
        const pexelsApiKey = this.configService.get('PEXELS_API_KEY') ?? '';
        if (!pexelsApiKey) {
            throw new common_1.BadRequestException('Missing PEXELS_API_KEY environment variable.');
        }
        const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=portrait`, {
            method: 'GET',
            headers: {
                Authorization: pexelsApiKey,
            },
        });
        if (!response.ok) {
            const responseBody = await response.text();
            throw new common_1.InternalServerErrorException(`Pexels API request failed: ${response.status} ${responseBody}`);
        }
        const payload = (await response.json());
        const image = payload.photos?.[0]?.src?.large2x ?? payload.photos?.[0]?.src?.large ?? payload.photos?.[0]?.src?.original ?? '';
        if (!image) {
            throw new common_1.InternalServerErrorException('Pexels did not return a usable image.');
        }
        return image;
    }
    async searchPexelsImageWithFallbacks(query, category, tone) {
        const fallbackQueries = [
            query,
            `${category.toLowerCase()} portrait ${tone.toLowerCase()}`,
            `${category.toLowerCase()} creator lifestyle`,
            'creative portrait aesthetic',
        ];
        const uniqueQueries = [...new Set(fallbackQueries.map((item) => item.trim()).filter(Boolean))];
        for (const item of uniqueQueries) {
            try {
                const image = await this.searchPexelsImage(item);
                if (image) {
                    return image;
                }
            }
            catch {
            }
        }
        return '';
    }
    buildNextHeaderBlock(baseHeaderBlock, answers, suggestion, pexelsImage, themeId) {
        const block = { ...baseHeaderBlock };
        const currentFields = (block.fields && typeof block.fields === 'object' ? block.fields : {});
        const currentColors = (currentFields.colors && typeof currentFields.colors === 'object' ? currentFields.colors : {});
        const currentSocials = currentFields.socials && typeof currentFields.socials === 'object' ? currentFields.socials : { items: [] };
        const socialItems = Array.isArray(currentSocials.items) ? [...currentSocials.items] : [];
        const nextSocials = answers.includeSocials && Array.isArray(answers.socials)
            ? socialItems.map((item) => {
                const platform = String(item.platform ?? '');
                const matched = answers.socials?.find((social) => social.platform.trim().toLowerCase() === platform.trim().toLowerCase());
                return matched ? { ...item, url: matched.url.trim(), iconUrl: '' } : item;
            })
            : socialItems;
        const pageBackground = pexelsImage
            ? {
                mode: 'image',
                solid: '#ffffff',
                gradient: {
                    start: suggestion.colors.pageBackgroundGradientStart,
                    end: suggestion.colors.pageBackgroundGradientEnd,
                    type: suggestion.colors.pageBackgroundGradientType,
                },
                imageUrl: pexelsImage,
                overlayColor: '#000000',
                overlayOpacity: 28,
            }
            : {
                mode: suggestion.colors.pageBackgroundMode,
                solid: suggestion.colors.pageBackgroundSolid,
                gradient: {
                    start: suggestion.colors.pageBackgroundGradientStart,
                    end: suggestion.colors.pageBackgroundGradientEnd,
                    type: suggestion.colors.pageBackgroundGradientType,
                },
                imageUrl: '',
                overlayColor: '#000000',
                overlayOpacity: 0,
            };
        return {
            ...block,
            fields: {
                ...currentFields,
                profile: {
                    ...(currentFields.profile ?? {}),
                    displayName: suggestion.profile.displayName,
                    bio: suggestion.profile.bio,
                    avatarShape: suggestion.avatar.shape,
                    avatarSize: suggestion.avatar.size,
                },
                theme: {
                    ...(currentFields.theme ?? {}),
                    defaultThemeId: themeId,
                },
                typography: {
                    ...(currentFields.typography ?? {}),
                    fontFamily: suggestion.typography.fontFamily,
                    fontWeight: suggestion.typography.fontWeight,
                },
                colors: {
                    ...currentColors,
                    pageBackground,
                    headerTextAndIcon: suggestion.colors.headerTextAndIcon,
                    socialBlockBackground: suggestion.colors.socialBlockBackground,
                    socialBlockText: suggestion.colors.socialBlockText,
                    contentBlockBackground: suggestion.colors.contentBlockBackground,
                    contentBlockText: suggestion.colors.contentBlockText,
                    contentBlockButton: suggestion.colors.contentBlockButton,
                },
                socials: {
                    ...currentSocials,
                    items: nextSocials,
                },
                divLayout: {
                    ...(currentFields.divLayout ?? {}),
                    widthPercent: suggestion.divLayout.widthPercent,
                    border: {
                        ...(currentFields.divLayout?.border ?? {}),
                        width: suggestion.divLayout.borderWidth,
                        color: suggestion.divLayout.borderColor,
                        radius: suggestion.divLayout.borderRadius,
                        style: 'solid',
                    },
                    boxShadow: {
                        ...(currentFields.divLayout?.boxShadow ?? {}),
                        enabled: suggestion.divLayout.enableShadow,
                    },
                },
            },
        };
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        pages_service_1.PagesService,
        ai_repository_1.AiRepository])
], AiService);
