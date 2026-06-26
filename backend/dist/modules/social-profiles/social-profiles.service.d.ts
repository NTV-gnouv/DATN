import type { SocialProfileLookupResult, SupportedSocialPlatform } from './social-profiles.types';
export declare class SocialProfilesService {
    private readonly logger;
    private readonly instagramCache;
    normalizeUsername(raw: string): string;
    buildProfileUrl(platform: SupportedSocialPlatform, username: string): string;
    lookup(platform: SupportedSocialPlatform, rawUsername: string): Promise<SocialProfileLookupResult>;
    lookupBatch(items: Array<{
        platform: SupportedSocialPlatform;
        username: string;
    }>): Promise<{
        results: SocialProfileLookupResult[];
    }>;
    fetchPostImages(platform: SupportedSocialPlatform, rawUsername: string, limit?: number): Promise<string[]>;
    private isValidPostImageUrl;
    private collectUniqueImageUrls;
    private extractJsonFieldUrls;
    private extractInstagramPostImagesFromApi;
    private fetchInstagramPostImages;
    private extractYouTubePostImages;
    private fetchYouTubePostImages;
    private extractTikTokPostImages;
    private fetchTikTokPostImages;
    private extractXPostImages;
    private fetchXPostImages;
    private decodeJsonString;
    private extractInstagramJsonField;
    private extractInstagramProfileFromHtml;
    private isInstagramNotFoundHtml;
    private getCachedInstagram;
    private setCachedInstagram;
    private sleep;
    private decodeHtml;
    private extractMeta;
    private curlRequest;
    private fetchHtml;
    private notFound;
    private found;
    private lookupYouTube;
    private parseInstagramApiPayload;
    private lookupInstagram;
    private lookupInstagramViaApi;
    private lookupInstagramViaHtml;
    private lookupX;
    private lookupTikTok;
}
