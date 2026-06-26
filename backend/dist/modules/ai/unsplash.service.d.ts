import { ConfigService } from '@nestjs/config';
import { MediaService } from '@/modules/media/media.service';
export type UnsplashImageResult = {
    query: string;
    sourceUrl: string;
    publicUrl: string;
    alt: string;
};
export declare class UnsplashService {
    private readonly configService;
    private readonly mediaService;
    private readonly logger;
    constructor(configService: ConfigService, mediaService: MediaService);
    private getAccessKey;
    searchPhoto(query: string): Promise<{
        sourceUrl: string;
        alt: string;
    } | null>;
    private uploadFromUrl;
    fetchBrandImages(keywords: string[], gallery: Array<{
        title: string;
        description: string;
    }>, ownerId: string): Promise<{
        backgroundUrl: string;
        avatarUrl: string;
        galleryUrls: string[];
    }>;
    fetchBackgroundVariants(keywords: string[], ownerId: string, count?: number): Promise<string[]>;
}
