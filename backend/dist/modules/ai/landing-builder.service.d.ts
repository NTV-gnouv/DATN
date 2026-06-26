import { BlocksRepository } from '@/modules/blocks/blocks.repository';
import { ContactFormsService } from '@/modules/contact-forms/contact-forms.service';
import { MediaService } from '@/modules/media/media.service';
import { PagesService } from '@/modules/pages/pages.service';
import { SocialProfilesService } from '@/modules/social-profiles/social-profiles.service';
import type { BrandProfile } from '@/shared/types/brand-profile.types';
import type { UxDesignProfile } from '@/shared/types/ux-design.types';
import { UnsplashService } from './unsplash.service';
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
export declare class LandingBuilderService {
    private readonly pagesService;
    private readonly contactFormsService;
    private readonly blocksRepository;
    private readonly mediaService;
    private readonly unsplashService;
    private readonly socialProfilesService;
    constructor(pagesService: PagesService, contactFormsService: ContactFormsService, blocksRepository: BlocksRepository, mediaService: MediaService, unsplashService: UnsplashService, socialProfilesService: SocialProfilesService);
    private readonly galleryPlatformPriority;
    private uploadGalleryImage;
    private fetchSocialGalleryImages;
    resolveBrandImages(profile: BrandProfile, ownerId: string, socialHandles?: SocialHandles): Promise<{
        galleryUrls: string[];
        backgroundUrl: string;
        avatarUrl: string;
    }>;
    resolveStyleBackgroundUrls(profile: BrandProfile, ownerId: string, count?: number): Promise<string[]>;
    buildFromProfile(profile: BrandProfile, ownerId: string, username: string, options?: BuildFromProfileOptions): Promise<{
        pageId: string;
        slug: string;
        profile: BrandProfile;
        images: {
            galleryUrls: string[];
            backgroundUrl: string;
            avatarUrl: string;
        };
        uxDesign: UxDesignProfile | null;
        updatedExisting: boolean;
    }>;
    private resolveAvatarUrl;
    private resolveTargetPage;
    private toResolvedPage;
    private upsertContactForm;
}
export {};
