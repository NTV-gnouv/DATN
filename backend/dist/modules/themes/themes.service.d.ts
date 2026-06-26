import { ThemeLoaderService } from './runtime/theme-loader.service';
import { ThemesRepository } from './themes.repository';
import { ThemeCustomizerService } from './theme-customizer.service';
import { ThemeConfig, ThemeGenerationInput, ThemeGenerationResult, ThemeCustomizationRequest } from '@/shared/types/theme.types';
export declare class ThemesService {
    private readonly themesRepository;
    private readonly themeLoaderService;
    private readonly customizer;
    constructor(themesRepository: ThemesRepository, themeLoaderService: ThemeLoaderService, customizer: ThemeCustomizerService);
    list(): Promise<import("./themes.repository").ThemeRecord[]>;
    get(id: string): Promise<import("./themes.repository").ThemeRecord | null>;
    getDefaultId(): Promise<{
        defaultThemeId: string;
    }>;
    create(payload: Record<string, unknown>): Promise<import("./themes.repository").ThemeRecord>;
    update(id: string, payload: Record<string, unknown>): Promise<import("./themes.repository").ThemeRecord | null>;
    rescan(baseDir?: string): Promise<import("./themes.repository").ThemeRecord[]>;
    enable(id: string): Promise<import("./themes.repository").ThemeRecord | null>;
    disable(id: string): Promise<import("./themes.repository").ThemeRecord | null>;
    remove(id: string): Promise<{
        removed: boolean;
        id: string;
    }>;
    generateThemeFromProfile(input: ThemeGenerationInput): Promise<ThemeGenerationResult>;
    customizeTheme(theme: ThemeConfig, customization: ThemeCustomizationRequest): Promise<ThemeConfig>;
    generateThemeCSS(theme: ThemeConfig): string;
    saveTheme(pageId: string, themeConfig: ThemeConfig): Promise<ThemeConfig>;
    updateTheme(id: string, updates: Partial<ThemeConfig>): Promise<ThemeConfig | null>;
    getTheme(id: string): Promise<ThemeConfig | null>;
    listThemesForPage(pageId: string): Promise<ThemeConfig[]>;
    deleteTheme(id: string): Promise<boolean>;
}
