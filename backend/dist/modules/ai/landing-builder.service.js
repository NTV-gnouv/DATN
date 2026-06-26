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
exports.LandingBuilderService = void 0;
const common_1 = require("@nestjs/common");
const blocks_repository_1 = require("../blocks/blocks.repository");
const contact_forms_service_1 = require("../contact-forms/contact-forms.service");
const media_service_1 = require("../media/media.service");
const pages_service_1 = require("../pages/pages.service");
const social_profiles_service_1 = require("../social-profiles/social-profiles.service");
const unsplash_service_1 = require("./unsplash.service");
const ux_design_mapper_1 = require("./ux-design.mapper");
function normalizeSlug(value) {
    return value
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80) || 'landing-page';
}
function readableTextColor(backgroundHex) {
    const hex = backgroundHex.replace('#', '');
    const r = Number.parseInt(hex.slice(0, 2), 16);
    const g = Number.parseInt(hex.slice(2, 4), 16);
    const b = Number.parseInt(hex.slice(4, 6), 16);
    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return luminance > 0.55 ? '#111111' : '#ffffff';
}
const SOCIAL_PLATFORM_ENTRIES = [
    { platform: 'TikTok', key: 'tiktok' },
    { platform: 'Instagram', key: 'instagram' },
    { platform: 'YouTube', key: 'youtube' },
    { platform: 'X', key: 'x' },
];
function buildSocialItemsFromHandles(socialItems, socialHandles) {
    const templateByPlatform = new Map(socialItems.map((item) => [String(item.platform ?? '').toLowerCase(), item]));
    return SOCIAL_PLATFORM_ENTRIES.map(({ platform, key }) => {
        const handle = socialHandles[key] ?? '';
        const url = buildSocialProfileUrl(platform, handle);
        const template = templateByPlatform.get(platform.toLowerCase());
        return {
            platform,
            url,
            iconUrl: String(template?.iconUrl ?? ''),
        };
    }).filter((item) => Boolean(String(item.url ?? '').trim()));
}
function normalizeSocialHandle(raw) {
    return String(raw ?? '')
        .trim()
        .replace(/^@+/, '');
}
function buildSocialProfileUrl(platform, handle) {
    const username = normalizeSocialHandle(handle);
    if (!username) {
        return '';
    }
    switch (platform.toLowerCase()) {
        case 'tiktok':
            return `https://www.tiktok.com/@${username}`;
        case 'instagram':
            return `https://www.instagram.com/${username}/`;
        case 'youtube':
            return `https://www.youtube.com/@${username}`;
        case 'x':
            return `https://x.com/${username}`;
        default:
            return '';
    }
}
let LandingBuilderService = class LandingBuilderService {
    constructor(pagesService, contactFormsService, blocksRepository, mediaService, unsplashService, socialProfilesService) {
        this.pagesService = pagesService;
        this.contactFormsService = contactFormsService;
        this.blocksRepository = blocksRepository;
        this.mediaService = mediaService;
        this.unsplashService = unsplashService;
        this.socialProfilesService = socialProfilesService;
        this.galleryPlatformPriority = [
            { platform: 'instagram', key: 'instagram' },
            { platform: 'tiktok', key: 'tiktok' },
            { platform: 'youtube', key: 'youtube' },
            { platform: 'x', key: 'x' },
        ];
    }
    async uploadGalleryImage(sourceUrl, ownerId, label) {
        const candidate = sourceUrl.trim();
        if (!candidate) {
            return '';
        }
        if (this.mediaService.isHostedPublicUrl(candidate)) {
            return candidate;
        }
        try {
            return await this.mediaService.uploadFromUrl(candidate, ownerId, 'background', label);
        }
        catch {
            return candidate;
        }
    }
    async fetchSocialGalleryImages(handles, ownerId, targetCount = 2) {
        const collected = [];
        const seen = new Set();
        for (const item of this.galleryPlatformPriority) {
            if (collected.length >= targetCount) {
                break;
            }
            const handle = normalizeSocialHandle(handles[item.key] ?? '');
            if (!handle) {
                continue;
            }
            const postImages = await this.socialProfilesService.fetchPostImages(item.platform, handle, 2);
            for (const [index, sourceUrl] of postImages.entries()) {
                if (collected.length >= targetCount) {
                    break;
                }
                if (seen.has(sourceUrl)) {
                    continue;
                }
                const hostedUrl = await this.uploadGalleryImage(sourceUrl, ownerId, `social-gallery-${item.platform}-${index + 1}`);
                if (!hostedUrl || seen.has(hostedUrl)) {
                    continue;
                }
                seen.add(hostedUrl);
                collected.push(hostedUrl);
            }
        }
        return collected;
    }
    async resolveBrandImages(profile, ownerId, socialHandles = {}) {
        const images = await this.unsplashService.fetchBrandImages(profile.image_keywords, profile.gallery, ownerId);
        const socialGalleryUrls = await this.fetchSocialGalleryImages(socialHandles, ownerId, 2);
        const galleryUrls = [
            socialGalleryUrls[0] || images.galleryUrls[0] || '',
            socialGalleryUrls[1] || images.galleryUrls[1] || images.galleryUrls[0] || '',
        ].filter(Boolean);
        return {
            ...images,
            galleryUrls,
        };
    }
    async resolveStyleBackgroundUrls(profile, ownerId, count = 3) {
        const keywords = profile.image_keywords?.length > 0
            ? profile.image_keywords
            : [profile.occupation, profile.name, profile.brand_style].filter(Boolean);
        return this.unsplashService.fetchBackgroundVariants(keywords, ownerId, count);
    }
    async buildFromProfile(profile, ownerId, username, options = {}) {
        const socialHandles = options.socialHandles ?? {};
        const images = options.images ?? (await this.resolveBrandImages(profile, ownerId, socialHandles));
        const galleryUrls = images.galleryUrls;
        const page = await this.resolveTargetPage(profile, username, options.ownerId ?? ownerId, options.pageId);
        const pageId = String(page.id);
        const defaultHeader = await this.blocksRepository.getDefaultHeaderBlock();
        const headerBase = (defaultHeader ?? {});
        const fields = (headerBase.fields ?? {});
        const colors = (fields.colors ?? {});
        const profileFields = (fields.profile ?? {});
        const typography = (fields.typography ?? {});
        const socials = (fields.socials ?? {});
        const defaultSocialItems = Array.isArray(socials.items)
            ? [...socials.items]
            : [];
        const socialItems = buildSocialItemsFromHandles(defaultSocialItems, socialHandles);
        const socialDisplayMode = options.socialDisplayMode ?? (socialItems.length > 0 ? 'both' : 'icons');
        const primary = profile.color_palette.primary.hex;
        const secondary = profile.color_palette.secondary_1.hex;
        const accent = profile.color_palette.secondary_2.hex;
        const contrast = profile.color_palette.contrast.hex;
        const headerText = readableTextColor(primary);
        const avatarUrl = await this.resolveAvatarUrl(options.avatarUrl, images.avatarUrl, ownerId);
        const uxMapping = options.uxDesign
            ? (0, ux_design_mapper_1.mapUxDesignToPage)(options.uxDesign, {
                name: profile.name,
                occupation: profile.occupation,
                description: profile.long_bio || profile.short_bio,
                brand_style: profile.brand_style,
                personality_traits: profile.personality_traits,
                color_palette: profile.color_palette,
            }, {
                backgroundImageUrl: images.backgroundUrl,
                pageKey: pageId,
            })
            : null;
        const uxHeaderPatch = (uxMapping?.headerPatch ?? {});
        const uxProfilePatch = (uxHeaderPatch.profile ?? {});
        const uxColorsPatch = (uxHeaderPatch.colors ?? {});
        const uxTypographyPatch = (uxHeaderPatch.typography ?? {});
        const uxDivLayoutPatch = (uxHeaderPatch.divLayout ?? {});
        const headerBlock = {
            ...headerBase,
            id: `block-header-${pageId}`,
            fields: {
                ...fields,
                profile: {
                    ...profileFields,
                    displayName: profile.name,
                    bio: profile.short_bio,
                    avatarUrl,
                    avatarShape: uxProfilePatch.avatarShape ?? 'circle',
                    avatarDisplayStyle: uxProfilePatch.avatarDisplayStyle ?? uxProfilePatch.avatarShape ?? 'circle',
                    avatarSize: uxProfilePatch.avatarSize ?? 32,
                    displayNameSize: uxProfilePatch.displayNameSize ?? 100,
                },
                colors: {
                    ...colors,
                    pageBackground: uxColorsPatch.pageBackground ?? {
                        mode: 'image',
                        solid: primary,
                        gradient: {
                            start: primary,
                            end: secondary,
                            type: 'linear',
                        },
                        imageUrl: images.backgroundUrl,
                        overlayColor: '#000000',
                        overlayOpacity: 20,
                    },
                    headerTextAndIcon: uxColorsPatch.headerTextAndIcon ?? headerText,
                    socialBlockBackground: uxColorsPatch.socialBlockBackground ?? secondary,
                    socialBlockText: uxColorsPatch.socialBlockText ?? contrast,
                    contentBlockBackground: uxColorsPatch.contentBlockBackground ?? '#ffffff',
                    contentBlockText: uxColorsPatch.contentBlockText ?? contrast,
                    contentBlockButton: uxColorsPatch.contentBlockButton ?? accent,
                },
                typography: {
                    ...typography,
                    fontFamily: uxTypographyPatch.fontFamily ?? 'Inter',
                    fontSize: uxTypographyPatch.fontSize ?? 16,
                    fontWeight: uxTypographyPatch.fontWeight ?? 400,
                },
                divLayout: {
                    ...(fields.divLayout ?? {}),
                    ...uxDivLayoutPatch,
                },
                socials: {
                    ...socials,
                    displayMode: socialDisplayMode,
                    items: socialItems,
                },
            },
        };
        const form = await this.upsertContactForm(pageId, profile, page.blocks);
        const galleryPatch = uxMapping?.galleryPatch ?? {};
        const galleryBlock = {
            id: `gallery-${pageId}`,
            type: 'gallery',
            visible: true,
            title: 'Thư viện ảnh',
            subtitle: profile.brand_style,
            layout: galleryPatch.layout ?? 'column',
            appearance: galleryPatch.appearance ?? 'exposed',
            aspectRatio: galleryPatch.aspectRatio ?? '16:9',
            imageScale: galleryPatch.imageScale ?? 100,
            visibleCount: 2,
            showMoreLabel: 'Xem thêm',
            images: galleryUrls
                .filter(Boolean)
                .map((url, index) => ({
                id: `gallery-image-${index + 1}`,
                url,
                caption: profile.gallery[index]?.title ?? `Ảnh ${index + 1}`,
                linkUrl: '',
            })),
        };
        const contactFormBlock = {
            id: `contact-form-${pageId}`,
            type: 'contact-form',
            visible: true,
            formId: form.id,
            title: form.name,
            submitLabel: form.submitLabel,
            successMessage: form.successMessage,
            showFieldLabels: false,
            fields: form.fields,
        };
        const textBlock = {
            id: `text-${pageId}`,
            type: 'text',
            visible: true,
            content: profile.long_bio,
        };
        await this.pagesService.updateEditorConfig(pageId, {
            themeId: 'minimal',
            headerBlockId: String(headerBlock.id),
            headerBlock,
            themeTokens: uxMapping?.themeTokens ?? {
                source: 'ai-chat-onboarding',
                profile,
                generatedAt: new Date().toISOString(),
            },
        });
        await this.pagesService.update(pageId, {
            blocks: [headerBlock, textBlock, galleryBlock, contactFormBlock],
            title: profile.name,
            username: normalizeSlug(username) || normalizeSlug(profile.name),
            ownerId: options.ownerId ?? ownerId,
        });
        return {
            pageId,
            slug: String(page.slug ?? normalizeSlug(profile.name)),
            profile,
            images,
            uxDesign: options.uxDesign ?? null,
            updatedExisting: page.updatedExisting,
        };
    }
    async resolveAvatarUrl(socialAvatarUrl, fallbackAvatarUrl, ownerId) {
        const candidate = socialAvatarUrl?.trim();
        if (!candidate) {
            return fallbackAvatarUrl;
        }
        if (this.mediaService.isHostedPublicUrl(candidate)) {
            return candidate;
        }
        try {
            return await this.mediaService.uploadFromUrl(candidate, ownerId, 'avatar', 'social-avatar');
        }
        catch {
            return fallbackAvatarUrl || candidate;
        }
    }
    async resolveTargetPage(profile, username, ownerId, pageId) {
        if (pageId && ownerId) {
            try {
                const owned = (await this.pagesService.getOwned(pageId, ownerId));
                if (owned?.id) {
                    return this.toResolvedPage(owned, true);
                }
            }
            catch {
            }
        }
        if (ownerId) {
            const byOwner = (await this.pagesService.findByOwnerId(ownerId));
            if (byOwner?.id) {
                return this.toResolvedPage(byOwner, true);
            }
        }
        const base = normalizeSlug(profile.name) || normalizeSlug(username) || 'creator';
        const suggested = await this.pagesService.suggestDomain(ownerId ?? 'creator', base);
        const created = (await this.pagesService.createTemplate({
            title: profile.name,
            username: suggested.username,
            slug: suggested.slug,
            ...(ownerId ? { ownerId } : {}),
        }));
        return this.toResolvedPage(created, false);
    }
    toResolvedPage(page, updatedExisting) {
        const blocks = Array.isArray(page.blocks) ? page.blocks : [];
        return {
            id: String(page.id),
            slug: String(page.slug ?? ''),
            blocks,
            updatedExisting,
        };
    }
    async upsertContactForm(pageId, profile, existingBlocks) {
        const existingFormBlock = existingBlocks.find((block) => String(block.type ?? '') === 'contact-form');
        const formId = String(existingFormBlock?.formId ?? `contact-form-${pageId}`);
        const payload = {
            id: formId,
            name: 'Đăng ký nhận tin',
            description: `Form liên hệ cho ${profile.name}`,
            submitLabel: 'Đăng ký',
            successMessage: 'Cảm ơn bạn! Chúng tôi đã nhận được thông tin.',
            status: 'active',
            fields: [
                {
                    id: 'name',
                    type: 'name',
                    label: 'Tên',
                    placeholder: 'Tên',
                    required: true,
                    maxLength: 120,
                    options: [],
                },
                {
                    id: 'email',
                    type: 'email',
                    label: 'Email',
                    placeholder: 'E-mail',
                    required: true,
                    maxLength: 120,
                    options: [],
                },
            ],
        };
        try {
            await this.contactFormsService.getForm(formId);
            return this.contactFormsService.updateForm(formId, payload);
        }
        catch {
            return this.contactFormsService.createForm(payload);
        }
    }
};
exports.LandingBuilderService = LandingBuilderService;
exports.LandingBuilderService = LandingBuilderService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [pages_service_1.PagesService,
        contact_forms_service_1.ContactFormsService,
        blocks_repository_1.BlocksRepository,
        media_service_1.MediaService,
        unsplash_service_1.UnsplashService,
        social_profiles_service_1.SocialProfilesService])
], LandingBuilderService);
