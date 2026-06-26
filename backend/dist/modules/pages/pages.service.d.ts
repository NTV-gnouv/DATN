import { PagesRepository } from './pages.repository';
export declare class PagesService {
    private readonly pagesRepository;
    constructor(pagesRepository: PagesRepository);
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
    checkSlug(slug: string, excludeId?: string): Promise<{
        slug: string;
        available: boolean;
    }>;
    checkUsername(username: string, excludeId?: string): Promise<{
        username: string;
        available: boolean;
    }>;
    suggestDomain(ownerId: string, base?: string): Promise<{
        slug: string;
        username: string;
    }>;
    getBySlug(slug: string): Promise<Record<string, unknown>>;
    getByUsername(username: string): Promise<Record<string, unknown>>;
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
    listForOwner(ownerId: string): Promise<Record<string, unknown>[]>;
    getMyPage(ownerId: string): Promise<Record<string, unknown> | null>;
    get(id: string): Promise<Record<string, unknown>>;
    getOwned(id: string, ownerId: string): Promise<Record<string, unknown>>;
    update(id: string, payload: Record<string, unknown>, ownerId?: string): Promise<Record<string, unknown>>;
    updateSlug(id: string, slug: string, ownerId?: string): Promise<{
        id: string;
        slug: string;
        updatedAt: string;
    }>;
    updateSlugByUsername(username: string, slug: string, ownerId: string): Promise<{
        id: string;
        slug: string;
        updatedAt: string;
    }>;
    findForAccount(user: {
        id?: string;
        name: string;
        email: string;
    }): Promise<Record<string, unknown> | null>;
    findByOwnerId(ownerId: string): Promise<Record<string, unknown> | null>;
    getEditorConfig(id: string, ownerId?: string): Promise<{
        pageId: string;
        themeId: string;
        themeTokens: Record<string, unknown> | null;
        headerBlockId: string;
        headerBlock: Record<string, unknown> | null;
    }>;
    updateEditorConfig(id: string, payload: Record<string, unknown>, ownerId?: string): Promise<{
        pageId: string;
        themeId: string;
        themeTokens: Record<string, unknown> | null;
        headerBlockId: string;
        headerBlock: Record<string, unknown> | null;
    }>;
    remove(id: string, ownerId?: string): Promise<{
        id: string;
        removed: boolean;
    }>;
    assertPageOwnedBy(page: Record<string, unknown> | null | undefined, ownerId: string): Record<string, unknown> | null | undefined;
}
