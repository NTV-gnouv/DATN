import type { UxDesignInput, UxDesignMappingResult, UxDesignProfile } from '@/shared/types/ux-design.types';
declare function buildFallbackUxDesign(input: UxDesignInput): UxDesignProfile;
export declare function normalizeUxDesignProfile(raw: unknown, input: UxDesignInput): UxDesignProfile;
export declare function mapUxDesignToPage(ux: UxDesignProfile, brandInput: UxDesignInput, options: {
    backgroundImageUrl?: string;
    pageKey: string;
}): UxDesignMappingResult;
export { buildFallbackUxDesign };
