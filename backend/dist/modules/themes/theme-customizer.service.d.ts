import { ThemesRepository } from './themes.repository';
import { ThemeConfig, ThemeCustomizationRequest, ThemeGenerationInput, ThemeGenerationResult } from '@/shared/types/theme.types';
export declare class ThemeCustomizerService {
    private readonly themesRepository;
    constructor(themesRepository: ThemesRepository);
    generateThemeFromProfile(input: ThemeGenerationInput): Promise<ThemeGenerationResult>;
    private getSuggestedTemplates;
    customizeTheme(theme: ThemeConfig, customization: ThemeCustomizationRequest): Promise<ThemeConfig>;
    generateThemeCSS(theme: ThemeConfig): string;
    saveTheme(pageId: string, themeConfig: ThemeConfig): Promise<ThemeConfig>;
    updateTheme(id: string, updates: Partial<ThemeConfig>): Promise<ThemeConfig | null>;
    getTheme(id: string): Promise<ThemeConfig | null>;
    listThemesForPage(pageId: string): Promise<ThemeConfig[]>;
    deleteTheme(id: string): Promise<boolean>;
}
