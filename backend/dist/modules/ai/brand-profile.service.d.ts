import { ConfigService } from '@nestjs/config';
import type { BrandProfile, BrandProfileInput } from '@/shared/types/brand-profile.types';
export declare class BrandProfileService {
    private readonly configService;
    private readonly logger;
    constructor(configService: ConfigService);
    generateProfile(input: BrandProfileInput): Promise<BrandProfile>;
    private normalizeProfile;
}
