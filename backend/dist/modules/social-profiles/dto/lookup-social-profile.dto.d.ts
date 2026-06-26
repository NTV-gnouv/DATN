import type { SupportedSocialPlatform } from '../social-profiles.types';
export declare class LookupSocialProfileDto {
    platform: SupportedSocialPlatform;
    username: string;
}
export declare class LookupSocialProfilesBatchDto {
    profiles: LookupSocialProfileDto[];
}
