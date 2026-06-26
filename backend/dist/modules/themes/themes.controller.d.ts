import { ThemesService } from './themes.service';
import { CreateThemeDto, UpdateThemeDto, GenerateThemeDto } from './dto/theme.dto';
export declare class ThemesController {
    private readonly themesService;
    constructor(themesService: ThemesService);
    list(): Promise<import("./themes.repository").ThemeRecord[]>;
    getDefaultId(): Promise<{
        defaultThemeId: string;
    }>;
    get(id: string): Promise<import("./themes.repository").ThemeRecord | null>;
    create(body: Record<string, unknown>): Promise<import("./themes.repository").ThemeRecord>;
    update(id: string, body: Record<string, unknown>): Promise<import("./themes.repository").ThemeRecord | null>;
    rescan(): Promise<import("./themes.repository").ThemeRecord[]>;
    enable(id: string): Promise<import("./themes.repository").ThemeRecord | null>;
    disable(id: string): Promise<import("./themes.repository").ThemeRecord | null>;
    remove(id: string): Promise<{
        removed: boolean;
        id: string;
    }>;
    generateTheme(generateThemeDto: GenerateThemeDto): Promise<import(".").ThemeGenerationResult>;
    createCustomTheme(body: {
        pageId: string;
    } & CreateThemeDto): Promise<import(".").ThemeConfig>;
    getCustomTheme(id: string): Promise<import(".").ThemeConfig | {
        error: string;
    }>;
    listThemesForPage(pageId: string): Promise<import(".").ThemeConfig[]>;
    updateCustomTheme(id: string, updateThemeDto: UpdateThemeDto): Promise<import(".").ThemeConfig | null>;
    deleteCustomTheme(id: string): Promise<{
        deleted: boolean;
        id: string;
    }>;
    getThemeCSS(id: string): Promise<{
        error: string;
        css?: undefined;
    } | {
        css: string;
        error?: undefined;
    }>;
}
