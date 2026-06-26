import { LookupSocialProfileDto, LookupSocialProfilesBatchDto } from './dto/lookup-social-profile.dto';
import { SocialProfilesService } from './social-profiles.service';
import type { SupportedSocialPlatform } from './social-profiles.types';
export declare class SocialProfilesController {
    private readonly socialProfilesService;
    constructor(socialProfilesService: SocialProfilesService);
    lookupByPath(platform: SupportedSocialPlatform, username: string): Promise<import("./social-profiles.types").SocialProfileLookupResult>;
    lookup(body: LookupSocialProfileDto): Promise<import("./social-profiles.types").SocialProfileLookupResult>;
    lookupBatch(body: LookupSocialProfilesBatchDto): Promise<{
        results: import("./social-profiles.types").SocialProfileLookupResult[];
    }>;
}
