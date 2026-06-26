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
var AiChatService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiChatService = void 0;
const common_1 = require("@nestjs/common");
const media_service_1 = require("../media/media.service");
const pages_service_1 = require("../pages/pages.service");
const social_profiles_service_1 = require("../social-profiles/social-profiles.service");
const brand_profile_service_1 = require("./brand-profile.service");
const ai_chat_repository_1 = require("./ai-chat.repository");
const landing_builder_service_1 = require("./landing-builder.service");
const ux_design_service_1 = require("./ux-design.service");
const normalize_chat_input_1 = require("./utils/normalize-chat-input");
const ux_style_presets_1 = require("../../shared/style-presets/ux-style-presets");
const ux_style_options_builder_1 = require("./ux-style-options.builder");
const SOCIAL_PLATFORMS = ['tiktok', 'instagram', 'youtube', 'x'];
const AVATAR_PRIORITY = ['tiktok', 'instagram', 'youtube', 'x'];
const CHAT_STEPS = [
    {
        key: 'socials',
        inputType: 'socials',
        getMessages: () => [
            'Xin chào 👋',
            'Mình sẽ giúp bạn tạo landing page cá nhân.',
            'Hãy thêm ít nhất một tài khoản mạng xã hội',
        ],
        validate: () => true,
        invalidMessage: '',
    },
    {
        key: 'occupation',
        inputType: 'text',
        getMessages: (answers) => [
            answers.name
                ? `Rất vui được gặp bạn ${answers.name}, bạn đang làm công việc gì?`
                : 'Bạn đang làm công việc gì?',
        ],
        validate: (value) => value.trim().length >= 2,
        invalidMessage: 'Bạn mô tả ngắn công việc của mình nhé.',
    },
    {
        key: 'description',
        inputType: 'text',
        getMessages: () => [
            'Tuyệt! Hãy mô tả thêm về bản thân bạn.',
            'Ví dụ: Tôi thích thiên nhiên, tôi thích phượt, và yêu màu sắc sặc sỡ của ánh bình minh.',
        ],
        validate: (value) => value.trim().length >= 15,
        invalidMessage: 'Bạn mô tả chi tiết hơn về sở thích và phong cách của mình nhé.',
    },
];
function buildSocialHandles(answers) {
    return {
        tiktok: answers.social_tiktok || '',
        instagram: answers.social_instagram || '',
        youtube: answers.social_youtube || '',
        x: answers.social_x || '',
    };
}
function normalizeSocialHandle(raw) {
    const trimmed = String(raw ?? '').trim();
    if (!trimmed) {
        return '';
    }
    const withoutAt = trimmed.replace(/^@+/, '');
    return withoutAt ? `@${withoutAt}` : '';
}
function formatSocialSummary(answers) {
    const labels = {
        tiktok: 'TikTok',
        instagram: 'Instagram',
        youtube: 'YouTube',
        x: 'X',
    };
    const parts = SOCIAL_PLATFORMS.map((platform) => {
        const handle = answers[`social_${platform}`];
        return handle ? `${labels[platform]}: ${handle}` : '';
    }).filter(Boolean);
    return parts.length > 0 ? parts.join('\n') : 'Bỏ qua mạng xã hội';
}
function normalizeStepAnswer(key, value, answers = {}) {
    if (key === 'name') {
        return (0, normalize_chat_input_1.normalizePersonName)(value);
    }
    if (key === 'occupation') {
        return (0, normalize_chat_input_1.normalizeOccupation)(value);
    }
    if (key === 'description') {
        return (0, normalize_chat_input_1.normalizeDescription)(value, answers.name);
    }
    return value.trim();
}
function clearSocialAnswers(answers) {
    for (const platform of SOCIAL_PLATFORMS) {
        delete answers[`social_${platform}`];
    }
    delete answers.social_avatar_url;
}
function buildSocialPrefill(answers) {
    return {
        tiktok: answers.social_tiktok || '',
        instagram: answers.social_instagram || '',
        youtube: answers.social_youtube || '',
        x: answers.social_x || '',
    };
}
function cleanSocialDisplayName(raw) {
    return (0, normalize_chat_input_1.normalizePersonName)(String(raw ?? '')
        .replace(/\s*\(@[^)]+\)\s*on\s+X\s*$/i, '')
        .replace(/\s*\(@[^)]+\)\s*$/g, '')
        .replace(/\s*on Instagram.*$/i, '')
        .replace(/\s*•\s*Instagram.*$/i, '')
        .replace(/\s*\|\s*TikTok.*$/i, '')
        .replace(/\s*-\s*YouTube.*$/i, '')
        .trim());
}
function extractProfileFromLookups(lookupResults, handles) {
    let avatarUrl = '';
    let displayName = '';
    for (const platform of AVATAR_PRIORITY) {
        const match = lookupResults.find((item) => item.platform === platform && item.result.exists);
        if (!match) {
            continue;
        }
        if (!avatarUrl && match.result.avatarUrl) {
            avatarUrl = match.result.avatarUrl;
        }
        if (!displayName && match.result.displayName) {
            displayName = cleanSocialDisplayName(match.result.displayName);
        }
        if (avatarUrl && displayName) {
            break;
        }
    }
    if (!displayName) {
        for (const platform of AVATAR_PRIORITY) {
            const handle = handles[platform];
            if (handle) {
                displayName = (0, normalize_chat_input_1.normalizePersonName)(handle.replace(/^@+/, ''));
                break;
            }
        }
    }
    return {
        avatarUrl: avatarUrl || undefined,
        displayName: displayName || undefined,
    };
}
let AiChatService = AiChatService_1 = class AiChatService {
    constructor(aiChatRepository, brandProfileService, landingBuilderService, uxDesignService, mediaService, socialProfilesService, pagesService) {
        this.aiChatRepository = aiChatRepository;
        this.brandProfileService = brandProfileService;
        this.landingBuilderService = landingBuilderService;
        this.uxDesignService = uxDesignService;
        this.mediaService = mediaService;
        this.socialProfilesService = socialProfilesService;
        this.pagesService = pagesService;
        this.logger = new common_1.Logger(AiChatService_1.name);
    }
    getCurrentInputType(currentStep) {
        const step = CHAT_STEPS[currentStep];
        if (!step) {
            return 'none';
        }
        return step.inputType;
    }
    buildSessionPayload(session, extras = {}) {
        return {
            session,
            inputType: this.getCurrentInputType(session.currentStep),
            ...extras,
        };
    }
    async startChat(userId, username, pageId) {
        let linkedPageId;
        if (pageId?.trim()) {
            try {
                const ownedPage = await this.pagesService.getOwned(pageId.trim(), userId);
                linkedPageId = String(ownedPage.id);
            }
            catch {
                linkedPageId = undefined;
            }
        }
        const firstMessages = CHAT_STEPS[0].getMessages({});
        const session = await this.aiChatRepository.create(userId, username, firstMessages, linkedPageId);
        return {
            ...this.buildSessionPayload(session),
            newMessages: firstMessages.map((content) => this.toAssistantMessage(content)),
            awaitingInput: true,
            canGenerate: false,
        };
    }
    async getChatSession(sessionId) {
        const session = await this.requireSession(sessionId);
        return {
            ...this.buildSessionPayload(session),
            canGenerate: session.status === 'ready',
            styleOptions: (session.styleOptions ?? []).map(({ uxDesign: _uxDesign, ...option }) => option),
            awaitingStyleChoice: session.status === 'choosing_style',
        };
    }
    async sendChatMessage(sessionId, message) {
        const trimmedMessage = message.trim();
        if (!trimmedMessage) {
            throw new common_1.BadRequestException('Tin nhắn không được để trống.');
        }
        let session = await this.requireSession(sessionId);
        if (session.status === 'completed' || session.status === 'applied') {
            return {
                ...this.buildSessionPayload(session),
                newMessages: [this.toAssistantMessage('Landing page của bạn đã được tạo. Bạn có thể mở editor để chỉnh sửa thêm.')],
                awaitingInput: false,
                canGenerate: false,
            };
        }
        if (session.status === 'choosing_style') {
            return {
                ...this.buildSessionPayload(session),
                newMessages: [this.toAssistantMessage('Hãy chọn 1 trong 3 phong cách giao diện bên dưới nhé.')],
                awaitingInput: false,
                canGenerate: false,
                styleOptions: (session.styleOptions ?? []).map(({ uxDesign: _uxDesign, ...option }) => option),
                awaitingStyleChoice: true,
            };
        }
        if (session.status === 'ready') {
            return {
                ...this.buildSessionPayload(session),
                newMessages: [this.toAssistantMessage('Mình đã có đủ thông tin. Hãy bấm "Tạo trang" để mình bắt đầu nhé!')],
                awaitingInput: false,
                canGenerate: true,
            };
        }
        const step = CHAT_STEPS[session.currentStep];
        if (!step) {
            session.status = 'ready';
            session = await this.aiChatRepository.save(session);
            return {
                ...this.buildSessionPayload(session),
                newMessages: [this.toAssistantMessage('Cảm ơn bạn! Mình đã có đủ thông tin để tạo trang.')],
                awaitingInput: false,
                canGenerate: true,
            };
        }
        if (step.inputType === 'socials') {
            return {
                ...this.buildSessionPayload(session),
                newMessages: [this.toAssistantMessage('Hãy điền username mạng xã hội ở form bên dưới nhé.')],
                awaitingInput: true,
                canGenerate: false,
            };
        }
        session = await this.appendMessage(session, 'user', trimmedMessage);
        const normalizedValue = normalizeStepAnswer(step.key, trimmedMessage, session.answers);
        if (!step.validate(normalizedValue)) {
            const retryMessages = [step.invalidMessage, ...step.getMessages(session.answers)];
            session = await this.appendMessages(session, retryMessages);
            return {
                ...this.buildSessionPayload(session),
                newMessages: retryMessages.map((content) => this.toAssistantMessage(content)),
                awaitingInput: true,
                canGenerate: false,
            };
        }
        session.answers = {
            ...session.answers,
            [step.key]: normalizedValue,
        };
        session.currentStep += 1;
        const nextStep = CHAT_STEPS[session.currentStep];
        if (!nextStep) {
            session.status = 'ready';
            const readyMessages = [
                'Cảm ơn bạn! Mình đã hiểu rõ phong cách của bạn.',
                'Bấm "Tạo trang" để mình phân tích, chọn ảnh và hoàn thiện landing page cho bạn nhé ✨',
            ];
            session = await this.appendMessages(session, readyMessages);
            session = await this.aiChatRepository.save(session);
            return {
                ...this.buildSessionPayload(session),
                newMessages: readyMessages.map((content) => this.toAssistantMessage(content)),
                awaitingInput: false,
                canGenerate: true,
            };
        }
        const nextMessages = nextStep.getMessages(session.answers);
        session = await this.appendMessages(session, nextMessages);
        session = await this.aiChatRepository.save(session);
        return {
            ...this.buildSessionPayload(session),
            newMessages: nextMessages.map((content) => this.toAssistantMessage(content)),
            awaitingInput: true,
            canGenerate: false,
        };
    }
    async submitSocials(sessionId, payload) {
        let session = await this.requireSession(sessionId);
        const step = CHAT_STEPS[session.currentStep];
        if (session.status !== 'collecting' || step?.key !== 'socials') {
            throw new common_1.BadRequestException('Phiên chat hiện không ở bước nhập mạng xã hội.');
        }
        const handles = {
            tiktok: normalizeSocialHandle(payload.tiktok ?? ''),
            instagram: normalizeSocialHandle(payload.instagram ?? ''),
            youtube: normalizeSocialHandle(payload.youtube ?? ''),
            x: normalizeSocialHandle(payload.x ?? ''),
        };
        const providedPlatforms = SOCIAL_PLATFORMS.filter((platform) => Boolean(handles[platform]));
        if (providedPlatforms.length === 0) {
            return {
                ...this.buildSessionPayload(session),
                newMessages: [],
                awaitingInput: true,
                canGenerate: false,
                formError: 'Vui lòng điền ít nhất một nền tảng mạng xã hội.',
            };
        }
        const lookupResults = await Promise.all(providedPlatforms.map(async (platform) => ({
            platform,
            handle: handles[platform],
            result: await this.socialProfilesService.lookup(platform, handles[platform]),
        })));
        const socialErrors = {};
        for (const item of lookupResults) {
            if (!item.result.exists) {
                socialErrors[item.platform] = `Tài khoản ${item.handle} không tồn tại trên ${item.platform}.`;
            }
        }
        if (Object.keys(socialErrors).length > 0) {
            return {
                ...this.buildSessionPayload(session),
                newMessages: [],
                awaitingInput: true,
                canGenerate: false,
                socialErrors,
            };
        }
        const socialAnswers = {};
        for (const platform of SOCIAL_PLATFORMS) {
            socialAnswers[`social_${platform}`] = handles[platform] ?? '';
        }
        const profile = extractProfileFromLookups(lookupResults, handles);
        if (profile.avatarUrl) {
            profile.avatarUrl = await this.persistSocialAvatar(profile.avatarUrl, session.userId);
            socialAnswers.social_avatar_url = profile.avatarUrl;
        }
        session = await this.appendMessage(session, 'user', formatSocialSummary(socialAnswers));
        return this.completeSocialStep(session, socialAnswers, profile);
    }
    async goBack(sessionId) {
        const session = await this.requireSession(sessionId);
        if (session.status === 'completed' ||
            session.status === 'applied' ||
            session.status === 'generating' ||
            session.status === 'choosing_style') {
            throw new common_1.BadRequestException('Không thể quay lại ở trạng thái hiện tại.');
        }
        let targetStep;
        if (session.status === 'ready') {
            targetStep = CHAT_STEPS.length - 1;
        }
        else if (session.currentStep <= 0) {
            throw new common_1.BadRequestException('Bạn đang ở bước đầu tiên.');
        }
        else {
            targetStep = session.currentStep - 1;
        }
        const step = CHAT_STEPS[targetStep];
        if (!step) {
            throw new common_1.BadRequestException('Không thể quay lại.');
        }
        const prefillValue = session.answers[step.key] || '';
        const socialPrefill = step.inputType === 'socials' ? buildSocialPrefill(session.answers) : undefined;
        const nextAnswers = { ...session.answers };
        for (let index = targetStep; index < CHAT_STEPS.length; index += 1) {
            delete nextAnswers[CHAT_STEPS[index].key];
        }
        if (targetStep === 0) {
            clearSocialAnswers(nextAnswers);
            delete nextAnswers.name;
        }
        const nextSession = await this.aiChatRepository.save({
            ...session,
            answers: nextAnswers,
            currentStep: targetStep,
            status: 'collecting',
        });
        const backMessages = ['Bạn có thể chỉnh sửa lại thông tin nhé.', ...step.getMessages(nextSession.answers)];
        return {
            ...this.buildSessionPayload(nextSession),
            newMessages: backMessages.map((content) => this.toAssistantMessage(content)),
            awaitingInput: true,
            canGenerate: false,
            prefillValue: step.inputType === 'text' ? prefillValue : undefined,
            socialPrefill,
        };
    }
    async completeSocialStep(session, socialAnswers, profile) {
        const name = profile.displayName ? (0, normalize_chat_input_1.normalizePersonName)(profile.displayName) : '';
        session.answers = {
            ...session.answers,
            ...socialAnswers,
            ...(name ? { name } : {}),
        };
        session.currentStep += 1;
        const nextStep = CHAT_STEPS[session.currentStep];
        if (!nextStep) {
            session.status = 'ready';
            session = await this.aiChatRepository.save(session);
            return {
                ...this.buildSessionPayload(session),
                newMessages: [this.toAssistantMessage('Mình đã có đủ thông tin để tạo trang.')],
                awaitingInput: false,
                canGenerate: true,
                avatarUrl: profile.avatarUrl,
                displayName: name || undefined,
            };
        }
        session.status = 'collecting';
        const nextMessages = nextStep.getMessages(session.answers);
        session = await this.appendMessages(session, nextMessages);
        session = await this.aiChatRepository.save(session);
        return {
            ...this.buildSessionPayload(session),
            newMessages: nextMessages.map((content) => this.toAssistantMessage(content)),
            awaitingInput: true,
            canGenerate: false,
            avatarUrl: profile.avatarUrl,
            displayName: name || undefined,
        };
    }
    async generateLandingPage(sessionId) {
        let session = await this.requireSession(sessionId);
        if (session.status === 'choosing_style') {
            const styleOptions = (session.styleOptions ?? []).map(({ uxDesign: _uxDesign, ...option }) => option);
            return {
                session,
                styleOptions,
                awaitingStyleChoice: true,
                newMessages: [this.toAssistantMessage('Hãy chọn 1 trong 3 phong cách giao diện bên dưới nhé.')],
            };
        }
        if (session.status !== 'ready' && session.status !== 'collecting') {
            if (session.pageId) {
                return {
                    session,
                    pageId: session.pageId,
                    profile: session.profile ?? null,
                    newMessages: [this.toAssistantMessage('Trang của bạn đã sẵn sàng!')],
                };
            }
        }
        const { name, occupation, description } = session.answers;
        if (!name || !occupation || !description) {
            throw new common_1.BadRequestException('Chưa đủ thông tin để tạo trang.');
        }
        session.status = 'generating';
        session = await this.appendMessage(session, 'assistant', 'Mình đang phân tích thông tin và xây dựng hồ sơ thương hiệu cho bạn...');
        session = await this.aiChatRepository.save(session);
        const profile = await this.brandProfileService.generateProfile({ name, occupation, description });
        session.profile = profile;
        session = await this.appendMessage(session, 'assistant', 'Đang thiết kế giao diện landing page với AI...');
        session = await this.aiChatRepository.save(session);
        const socialHandles = buildSocialHandles(session.answers);
        const images = await this.landingBuilderService.resolveBrandImages(profile, session.userId, socialHandles);
        session.backgroundImageUrl = images.backgroundUrl;
        const { ux: baseUx, warnings: uxWarnings } = await this.uxDesignService.generateUxDesign(profile);
        session.baseUx = baseUx;
        if (uxWarnings.length) {
            this.logger.warn(`UX design warnings for session ${sessionId}: ${uxWarnings.join('; ')}`);
        }
        session = await this.appendMessage(session, 'assistant', 'Đang hoàn thiện landing page theo phong cách AI đã thiết kế...');
        session = await this.aiChatRepository.save(session);
        const profileInput = {
            name: profile.name,
            occupation: profile.occupation,
            description: profile.long_bio || profile.short_bio,
            brand_style: profile.brand_style,
            personality_traits: profile.personality_traits,
            color_palette: profile.color_palette,
        };
        const presets = (0, ux_style_presets_1.selectDiverseStylePresetsForProfile)(profileInput);
        const imagePresetCount = presets.filter((preset) => preset.overrides.background_style === 'image').length;
        const backgroundVariants = await this.landingBuilderService.resolveStyleBackgroundUrls(profile, session.userId, Math.max(imagePresetCount, 2));
        const builtOptions = (0, ux_style_options_builder_1.buildStyleOptionsForPresets)(profile, presets, {
            backgroundImageUrl: images.backgroundUrl,
            backgroundImageUrls: backgroundVariants.length > 0 ? backgroundVariants : [images.backgroundUrl],
            pageKey: session.id,
            baseUx,
        });
        const styleOptions = builtOptions.map((option) => ({
            id: option.id,
            label: option.label,
            description: option.description,
            uxDesign: option.uxDesign,
            backgroundImageUrl: option.backgroundImageUrl,
            preview: option.preview,
        }));
        session.styleOptions = styleOptions;
        session.status = 'choosing_style';
        const styleMessages = [
            'Mình đã chuẩn bị 3 phương án giao diện khác nhau cho bạn.',
            'Mỗi phương án có nền và phong cách riêng — hãy chọn 1 phương án bạn thích nhất nhé ✨',
        ];
        session = await this.appendMessages(session, styleMessages);
        session = await this.aiChatRepository.save(session);
        return {
            session,
            styleOptions: styleOptions.map(({ uxDesign: _uxDesign, ...clientOption }) => clientOption),
            awaitingStyleChoice: true,
            newMessages: styleMessages.map((content) => this.toAssistantMessage(content)),
        };
    }
    async applyStyleChoice(sessionId, styleOptionId) {
        let session = await this.requireSession(sessionId);
        const profile = session.profile;
        if (!profile?.name) {
            throw new common_1.BadRequestException('Không tìm thấy hồ sơ thương hiệu để tạo trang.');
        }
        const baseUx = session.baseUx;
        if (!baseUx) {
            throw new common_1.BadRequestException('Không tìm thấy thiết kế giao diện AI để tạo trang.');
        }
        const selectedOption = (session.styleOptions ?? []).find((option) => option.id === styleOptionId);
        if (!selectedOption) {
            throw new common_1.BadRequestException('Phương án giao diện không hợp lệ.');
        }
        const selectedUx = selectedOption.uxDesign ?? baseUx;
        session.status = 'generating';
        session.selectedStyleId = styleOptionId;
        session = await this.appendMessage(session, 'assistant', `Đang hoàn thiện landing page theo phong cách "${selectedOption.label}"...`);
        session = await this.aiChatRepository.save(session);
        const socialHandles = buildSocialHandles(session.answers);
        const images = await this.landingBuilderService.resolveBrandImages(profile, session.userId, socialHandles);
        if (selectedOption.backgroundImageUrl) {
            images.backgroundUrl = selectedOption.backgroundImageUrl;
        }
        return this.completeLandingBuild(session, profile, selectedUx, images);
    }
    async completeLandingBuild(session, profile, uxDesign, images) {
        const built = await this.landingBuilderService.buildFromProfile(profile, session.userId, session.username, {
            ownerId: session.userId,
            pageId: session.pageId,
            avatarUrl: session.answers.social_avatar_url || undefined,
            socialHandles: buildSocialHandles(session.answers),
            socialDisplayMode: 'both',
            uxDesign,
            images,
        });
        let nextSession = session;
        nextSession.pageId = built.pageId;
        nextSession.status = 'completed';
        const successMessages = built.updatedExisting
            ? [
                `Xong rồi! Landing page "${profile.name}" đã được cập nhật với giao diện do AI thiết kế.`,
                'Bạn có thể mở editor để tinh chỉnh thêm nhé 🎉',
            ]
            : [
                `Xong rồi! Landing page "${profile.name}" đã được tạo với giao diện do AI thiết kế.`,
                'Bạn có thể mở editor để tinh chỉnh thêm nhé 🎉',
            ];
        nextSession = await this.appendMessages(nextSession, successMessages);
        nextSession = await this.aiChatRepository.save(nextSession);
        return {
            session: nextSession,
            pageId: built.pageId,
            slug: built.slug,
            profile,
            uxDesign,
            images: images ?? built.images,
            newMessages: successMessages.map((content) => this.toAssistantMessage(content)),
            awaitingStyleChoice: false,
        };
    }
    async persistSocialAvatar(sourceUrl, ownerId) {
        if (this.mediaService.isHostedPublicUrl(sourceUrl)) {
            return sourceUrl;
        }
        try {
            return await this.mediaService.uploadFromUrl(sourceUrl, ownerId, 'avatar', 'social-avatar');
        }
        catch (error) {
            this.logger.warn(`Failed to upload social avatar for ${ownerId}: ${String(error)}`);
            return sourceUrl;
        }
    }
    async requireSession(sessionId) {
        const session = await this.aiChatRepository.get(sessionId);
        if (!session) {
            throw new common_1.NotFoundException('Phiên chat AI không tồn tại.');
        }
        return session;
    }
    toAssistantMessage(content) {
        return {
            role: 'assistant',
            content,
            createdAt: new Date().toISOString(),
        };
    }
    async appendMessage(session, role, content) {
        const nextSession = {
            ...session,
            messages: [
                ...session.messages,
                {
                    role,
                    content,
                    createdAt: new Date().toISOString(),
                },
            ],
        };
        return this.aiChatRepository.save(nextSession);
    }
    async appendMessages(session, contents) {
        let nextSession = session;
        for (const content of contents) {
            nextSession = await this.appendMessage(nextSession, 'assistant', content);
        }
        return nextSession;
    }
};
exports.AiChatService = AiChatService;
exports.AiChatService = AiChatService = AiChatService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ai_chat_repository_1.AiChatRepository,
        brand_profile_service_1.BrandProfileService,
        landing_builder_service_1.LandingBuilderService,
        ux_design_service_1.UxDesignService,
        media_service_1.MediaService,
        social_profiles_service_1.SocialProfilesService,
        pages_service_1.PagesService])
], AiChatService);
