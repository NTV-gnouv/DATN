import { ConfigService } from '@nestjs/config';
import { PagesService } from '@/modules/pages/pages.service';
import { ThemeCustomizerService } from './theme-customizer.service';
import { ThemeEngineApplyDto, ThemeEngineMapDto, ThemeEnginePipelineDto, ThemeEngineProfileInputDto } from './dto/theme-engine.dto';
import { GeneratedDesignProfile } from './theme-engine.mapping';
export declare class ThemeEngineService {
    private readonly configService;
    private readonly pagesService;
    private readonly themeCustomizerService;
    private readonly logger;
    constructor(configService: ConfigService, pagesService: PagesService, themeCustomizerService: ThemeCustomizerService);
    analyzeProfile(profile: ThemeEngineProfileInputDto): Promise<{
        step: string;
        source: string;
        warnings: string[];
        profile: {
            username: string;
            displayName: string;
            description: string;
            industry: string;
            tone: string;
            socialLinks: {
                platform: string;
                username: string;
                url: string;
            }[];
            customizations: {
                mainBackgroundColor: string;
                mainTextColor: string;
                reviewFontSize: number;
            };
        };
        designProfile: GeneratedDesignProfile;
    }>;
    mapToDesignSystem(payload: ThemeEngineMapDto): {
        designSystem: Record<string, unknown>;
        themeTokens: Record<string, unknown>;
        headerBlockPatch: Record<string, unknown>;
        animationCode: string;
        animationClassName: string;
        step: string;
        profile: {
            username: string;
            displayName: string;
            description: string;
            industry: string;
            tone: string;
            socialLinks: {
                platform: string;
                username: string;
                url: string;
            }[];
            customizations: {
                mainBackgroundColor: string;
                mainTextColor: string;
                reviewFontSize: number;
            };
        };
        designProfile: GeneratedDesignProfile;
    };
    applyDesignSystem(payload: ThemeEngineApplyDto): Promise<{
        step: string;
        pageId: string;
        themeId: string;
        animationCode: string;
        editorConfig: {
            pageId: string;
            themeId: string;
            themeTokens: Record<string, unknown> | null;
            headerBlockId: string;
            headerBlock: Record<string, unknown> | null;
        };
    }>;
    runPipeline(payload: ThemeEnginePipelineDto): Promise<{
        steps: {
            name: string;
            status: string;
        }[];
        source: string;
        warnings: string[];
        profile: {
            username: string;
            displayName: string;
            description: string;
            industry: string;
            tone: string;
            socialLinks: {
                platform: string;
                username: string;
                url: string;
            }[];
            customizations: {
                mainBackgroundColor: string;
                mainTextColor: string;
                reviewFontSize: number;
            };
        };
        designProfile: GeneratedDesignProfile;
        designSystem: Record<string, unknown>;
        result: {
            step: string;
            pageId: string;
            themeId: string;
            animationCode: string;
            editorConfig: {
                pageId: string;
                themeId: string;
                themeTokens: Record<string, unknown> | null;
                headerBlockId: string;
                headerBlock: Record<string, unknown> | null;
            };
        };
    }>;
    private normalizeProfile;
    private normalizeDesignProfile;
    private buildDesignSystemMapping;
    private buildThemeConfig;
    private requestGeminiDesignProfile;
    private buildFallbackDesignProfile;
    private detectIndustry;
    private buildAnimation;
    private deepMerge;
    private slugify;
    private pickEnum;
    private resolveHexOrFallback;
}
