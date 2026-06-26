import { ConfigService } from '@nestjs/config';
import type { BrandProfile } from '@/shared/types/brand-profile.types';
import type { UxDesignProfile } from '@/shared/types/ux-design.types';
import { type UxStyleOption } from './ux-style-options.builder';
export declare class UxDesignService {
    private readonly configService;
    private readonly logger;
    constructor(configService: ConfigService);
    generateUxDesign(profile: BrandProfile): Promise<{
        ux: UxDesignProfile;
        source: 'gemini' | 'fallback';
        warnings: string[];
    }>;
    generateStyleOptions(profile: BrandProfile, options: {
        backgroundImageUrl?: string;
        backgroundImageUrls?: string[];
        pageKey: string;
        baseUx?: UxDesignProfile;
    }): UxStyleOption[];
}
