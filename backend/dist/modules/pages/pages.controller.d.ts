import { CreatePageDto } from './dto/create-page.dto';
import { PagesService } from './pages.service';
type AuthUserPayload = {
    sub: string;
};
export declare class PagesController {
    private readonly pagesService;
    constructor(pagesService: PagesService);
    getMyPage(user: AuthUserPayload): Promise<Record<string, unknown> | null>;
    suggestDomain(user: AuthUserPayload, base?: string): Promise<{
        slug: string;
        username: string;
    }>;
    create(body: CreatePageDto, user: AuthUserPayload): Promise<Record<string, unknown> | {
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
    createTemplate(body: CreatePageDto, user: AuthUserPayload): Promise<Record<string, unknown> | {
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
    getBySlug(slug: string): Promise<Record<string, unknown>>;
    getByUsername(username: string): Promise<Record<string, unknown>>;
    checkSlug(slug: string, excludeId?: string): Promise<{
        slug: string;
        available: boolean;
    }>;
    list(user: AuthUserPayload): Promise<Record<string, unknown>[]>;
    getEditorConfig(id: string, user: AuthUserPayload): Promise<{
        pageId: string;
        themeId: string;
        themeTokens: Record<string, unknown> | null;
        headerBlockId: string;
        headerBlock: Record<string, unknown> | null;
    }>;
    get(id: string, user: AuthUserPayload): Promise<Record<string, unknown>>;
    update(id: string, body: Record<string, unknown>, user: AuthUserPayload): Promise<Record<string, unknown>>;
    updateSlug(id: string, body: {
        slug?: string;
    }, user: AuthUserPayload): Promise<{
        id: string;
        slug: string;
        updatedAt: string;
    }>;
    updateSlugByUsername(username: string, body: {
        slug?: string;
    }, user: AuthUserPayload): Promise<{
        id: string;
        slug: string;
        updatedAt: string;
    }>;
    updateEditorConfig(id: string, body: Record<string, unknown>, user: AuthUserPayload): Promise<{
        pageId: string;
        themeId: string;
        themeTokens: Record<string, unknown> | null;
        headerBlockId: string;
        headerBlock: Record<string, unknown> | null;
    }>;
    remove(id: string, user: AuthUserPayload): Promise<{
        id: string;
        removed: boolean;
    }>;
}
export {};
