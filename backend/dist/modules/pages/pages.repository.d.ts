import { DatabaseService } from '@/core/database/database.service';
export declare class PagesRepository {
    private readonly databaseService;
    constructor(databaseService: DatabaseService);
    private readonly defaultThemeId;
    private normalizeThemeId;
    private normalizeSlug;
    private mapPageRow;
    private mapBlockRow;
    private normalizeContentBlock;
    private mergeHeaderIntoBlocks;
    listBlocksByType(pageId: string, blockType: string): Promise<Record<string, unknown>[]>;
    countBlocksByType(pageId: string, blockType: string): Promise<number>;
    private loadBlocks;
    private saveBlocks;
    private loadPage;
    private readAllPages;
    private buildTemplate;
    findBySlug(slug: string): Promise<Record<string, unknown> | null>;
    findByUsername(username: string): Promise<Record<string, unknown> | null>;
    isUsernameAvailable(username: string, excludeId?: string): Promise<boolean>;
    private buildUniqueSuffix;
    suggestUniqueSlug(base: string, ownerId?: string): Promise<{
        slug: string;
        username: string;
    }>;
    isSlugAvailable(slug: string, excludeId?: string): Promise<boolean>;
    create(payload: Record<string, unknown>): Promise<Record<string, unknown> | {
        themeId: string;
        status: string;
        template: string;
        blocks: {};
        createdAt: string;
        ownerId?: string | undefined;
        id: string;
        title: string;
        slug: string;
        username: string;
    }>;
    list(): Promise<Record<string, unknown>[]>;
    get(id: string): Promise<Record<string, unknown>>;
    getBySlug(slug: string): Promise<Record<string, unknown>>;
    getByUsername(username: string): Promise<Record<string, unknown>>;
    update(id: string, payload: Record<string, unknown>): Promise<Record<string, unknown>>;
    updateSlug(id: string, slug: string): Promise<{
        id: string;
        slug: string;
        updatedAt: string;
    }>;
    updateSlugByUsername(username: string, slug: string, ownerId: string): Promise<{
        id: string;
        slug: string;
        updatedAt: string;
    }>;
    getOwned(id: string, ownerId: string): Promise<Record<string, unknown>>;
    findByOwnerId(ownerId: string): Promise<Record<string, unknown> | null>;
    findForAccount(user: {
        id?: string;
        name: string;
        email: string;
    }): Promise<Record<string, unknown> | null>;
    getEditorConfig(id: string): Promise<{
        pageId: string;
        themeId: string;
        themeTokens: Record<string, unknown> | null;
        headerBlockId: string;
        headerBlock: Record<string, unknown> | null;
    }>;
    updateEditorConfig(id: string, payload: Record<string, unknown>): Promise<{
        pageId: string;
        themeId: string;
        themeTokens: Record<string, unknown> | null;
        headerBlockId: string;
        headerBlock: Record<string, unknown> | null;
    }>;
    createTemplate(payload: Record<string, unknown>): Promise<Record<string, unknown> | {
        themeId: string;
        status: string;
        template: string;
        blocks: {};
        createdAt: string;
        ownerId?: string | undefined;
        id: string;
        title: string;
        slug: string;
        username: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        removed: boolean;
    }>;
}
