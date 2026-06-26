import { Injectable } from '@nestjs/common';

import { BlocksRepository } from '@/modules/blocks/blocks.repository';
import { ContactFormsService } from '@/modules/contact-forms/contact-forms.service';
import { MediaService } from '@/modules/media/media.service';
import { PagesService } from '@/modules/pages/pages.service';
import { SocialProfilesService } from '@/modules/social-profiles/social-profiles.service';
import type { SupportedSocialPlatform } from '@/modules/social-profiles/social-profiles.types';
import type { BrandProfile } from '@/shared/types/brand-profile.types';
import type { UxDesignProfile } from '@/shared/types/ux-design.types';

import { UnsplashService } from './unsplash.service';
import { mapUxDesignToPage } from './ux-design.mapper';

function normalizeSlug(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'landing-page';
}

function readableTextColor(backgroundHex: string): string {
  const hex = backgroundHex.replace('#', '');
  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.55 ? '#111111' : '#ffffff';
}

type ResolvedPage = {
  id: string;
  slug: string;
  blocks: Array<Record<string, unknown>>;
  updatedExisting: boolean;
};

type SocialHandles = {
  tiktok?: string;
  instagram?: string;
  youtube?: string;
  x?: string;
};

type BuildFromProfileOptions = {
  ownerId?: string;
  pageId?: string;
  avatarUrl?: string;
  socialHandles?: SocialHandles;
  socialDisplayMode?: 'icons' | 'buttons' | 'both';
  uxDesign?: UxDesignProfile;
  images?: Awaited<ReturnType<LandingBuilderService['resolveBrandImages']>>;
};

const SOCIAL_PLATFORM_ENTRIES: Array<{ platform: string; key: keyof SocialHandles }> = [
  { platform: 'TikTok', key: 'tiktok' },
  { platform: 'Instagram', key: 'instagram' },
  { platform: 'YouTube', key: 'youtube' },
  { platform: 'X', key: 'x' },
];

function buildSocialItemsFromHandles(
  socialItems: Array<Record<string, unknown>>,
  socialHandles: SocialHandles,
): Array<Record<string, unknown>> {
  const templateByPlatform = new Map(
    socialItems.map((item) => [String(item.platform ?? '').toLowerCase(), item]),
  );

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

function normalizeSocialHandle(raw: string): string {
  return String(raw ?? '')
    .trim()
    .replace(/^@+/, '');
}

function buildSocialProfileUrl(platform: string, handle: string): string {
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

@Injectable()
export class LandingBuilderService {
  constructor(
    private readonly pagesService: PagesService,
    private readonly contactFormsService: ContactFormsService,
    private readonly blocksRepository: BlocksRepository,
    private readonly mediaService: MediaService,
    private readonly unsplashService: UnsplashService,
    private readonly socialProfilesService: SocialProfilesService,
  ) {}

  private readonly galleryPlatformPriority: Array<{ platform: SupportedSocialPlatform; key: keyof SocialHandles }> = [
    { platform: 'instagram', key: 'instagram' },
    { platform: 'tiktok', key: 'tiktok' },
    { platform: 'youtube', key: 'youtube' },
    { platform: 'x', key: 'x' },
  ];

  private async uploadGalleryImage(sourceUrl: string, ownerId: string, label: string): Promise<string> {
    const candidate = sourceUrl.trim();
    if (!candidate) {
      return '';
    }

    if (this.mediaService.isHostedPublicUrl(candidate)) {
      return candidate;
    }

    try {
      return await this.mediaService.uploadFromUrl(candidate, ownerId, 'background', label);
    } catch {
      return candidate;
    }
  }

  private async fetchSocialGalleryImages(handles: SocialHandles, ownerId: string, targetCount = 2): Promise<string[]> {
    const collected: string[] = [];
    const seen = new Set<string>();

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

        const hostedUrl = await this.uploadGalleryImage(
          sourceUrl,
          ownerId,
          `social-gallery-${item.platform}-${index + 1}`,
        );
        if (!hostedUrl || seen.has(hostedUrl)) {
          continue;
        }

        seen.add(hostedUrl);
        collected.push(hostedUrl);
      }
    }

    return collected;
  }

  async resolveBrandImages(profile: BrandProfile, ownerId: string, socialHandles: SocialHandles = {}) {
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

  async resolveStyleBackgroundUrls(profile: BrandProfile, ownerId: string, count = 3) {
    const keywords =
      profile.image_keywords?.length > 0
        ? profile.image_keywords
        : [profile.occupation, profile.name, profile.brand_style].filter(Boolean);
    return this.unsplashService.fetchBackgroundVariants(keywords, ownerId, count);
  }

  async buildFromProfile(profile: BrandProfile, ownerId: string, username: string, options: BuildFromProfileOptions = {}) {
    const socialHandles = options.socialHandles ?? {};
    const images = options.images ?? (await this.resolveBrandImages(profile, ownerId, socialHandles));
    const galleryUrls = images.galleryUrls;
    const page = await this.resolveTargetPage(profile, username, options.ownerId ?? ownerId, options.pageId);
    const pageId = String(page.id);

    const defaultHeader = await this.blocksRepository.getDefaultHeaderBlock();
    const headerBase = (defaultHeader ?? {}) as Record<string, unknown>;
    const fields = (headerBase.fields ?? {}) as Record<string, unknown>;
    const colors = (fields.colors ?? {}) as Record<string, unknown>;
    const profileFields = (fields.profile ?? {}) as Record<string, unknown>;
    const typography = (fields.typography ?? {}) as Record<string, unknown>;
    const socials = (fields.socials ?? {}) as Record<string, unknown>;
    const defaultSocialItems = Array.isArray(socials.items)
      ? [...(socials.items as Array<Record<string, unknown>>)]
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
      ? mapUxDesignToPage(options.uxDesign, {
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

    const uxHeaderPatch = (uxMapping?.headerPatch ?? {}) as Record<string, unknown>;
    const uxProfilePatch = (uxHeaderPatch.profile ?? {}) as Record<string, unknown>;
    const uxColorsPatch = (uxHeaderPatch.colors ?? {}) as Record<string, unknown>;
    const uxTypographyPatch = (uxHeaderPatch.typography ?? {}) as Record<string, unknown>;
    const uxDivLayoutPatch = (uxHeaderPatch.divLayout ?? {}) as Record<string, unknown>;

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
          ...((fields.divLayout ?? {}) as Record<string, unknown>),
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

  private async resolveAvatarUrl(
    socialAvatarUrl: string | undefined,
    fallbackAvatarUrl: string,
    ownerId: string,
  ): Promise<string> {
    const candidate = socialAvatarUrl?.trim();
    if (!candidate) {
      return fallbackAvatarUrl;
    }
    if (this.mediaService.isHostedPublicUrl(candidate)) {
      return candidate;
    }

    try {
      return await this.mediaService.uploadFromUrl(candidate, ownerId, 'avatar', 'social-avatar');
    } catch {
      return fallbackAvatarUrl || candidate;
    }
  }

  private async resolveTargetPage(
    profile: BrandProfile,
    username: string,
    ownerId?: string,
    pageId?: string,
  ): Promise<ResolvedPage> {
    if (pageId && ownerId) {
      try {
        const owned = (await this.pagesService.getOwned(pageId, ownerId)) as Record<string, unknown>;
        if (owned?.id) {
          return this.toResolvedPage(owned, true);
        }
      } catch {
        // Fall through to owner lookup / create new page.
      }
    }

    if (ownerId) {
      const byOwner = (await this.pagesService.findByOwnerId(ownerId)) as Record<string, unknown> | null;
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
    })) as Record<string, unknown>;

    return this.toResolvedPage(created, false);
  }

  private toResolvedPage(page: Record<string, unknown>, updatedExisting: boolean): ResolvedPage {
    const blocks = Array.isArray(page.blocks) ? (page.blocks as Array<Record<string, unknown>>) : [];
    return {
      id: String(page.id),
      slug: String(page.slug ?? ''),
      blocks,
      updatedExisting,
    };
  }

  private async upsertContactForm(
    pageId: string,
    profile: BrandProfile,
    existingBlocks: Array<Record<string, unknown>>,
  ) {
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
    } catch {
      return this.contactFormsService.createForm(payload);
    }
  }
}
