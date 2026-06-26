import { DatabaseService } from '@/core/database/database.service';
import { ThemeConfig } from '@/shared/types/theme.types';
export type ThemeRecord = {
    id: string;
    name: string;
    version: string;
    preview?: string;
    description?: string;
    cssDefaults?: Record<string, unknown>;
    themeTokens?: Record<string, unknown>;
    fields?: Array<{
        key: string;
        type: string;
        label: string;
        help?: string;
        options?: string[];
    }>;
    layout: string;
    sourcePath: string;
    enabled: boolean;
};
export declare class ThemesRepository {
    private readonly databaseService;
    constructor(databaseService: DatabaseService);
    private readonly defaultThemeId;
    private mapThemeRow;
    private buildDefaultTheme;
    private ensureDefaultTheme;
    list(): Promise<ThemeRecord[]>;
    get(id: string): Promise<ThemeRecord | null>;
    getDefaultId(): Promise<{
        defaultThemeId: string;
    }>;
    create(payload: Record<string, unknown>): Promise<ThemeRecord>;
    update(id: string, payload: Record<string, unknown>): Promise<ThemeRecord | null>;
    replaceAll(items: ThemeRecord[]): Promise<void>;
    remove(id: string): Promise<{
        removed: boolean;
        id: string;
    }>;
    createCustomTheme(themeConfig: ThemeConfig): Promise<ThemeConfig>;
    getCustomTheme(id: string): Promise<ThemeConfig | null>;
    listCustomThemesByPage(pageId: string): Promise<ThemeConfig[]>;
    updateCustomTheme(id: string, updates: Partial<ThemeConfig>): Promise<ThemeConfig | null>;
    deleteCustomTheme(id: string): Promise<boolean>;
}
