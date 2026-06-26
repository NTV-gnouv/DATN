export type SupportedSocialPlatform = 'instagram' | 'tiktok' | 'youtube' | 'x';
export type SocialProfileLookupResult = {
    platform: SupportedSocialPlatform;
    username: string;
    exists: boolean;
    profileUrl: string;
    displayName?: string;
    avatarUrl?: string;
    postImageUrls?: string[];
};
