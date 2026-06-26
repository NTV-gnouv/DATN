import { DatabaseService } from '@/core/database/database.service';
export type HeaderBlockRecord = {
    id: string;
    type: 'header';
    name: string;
    version: string;
    isDefault: boolean;
    fields: {
        profile: {
            avatarUrl: string;
            displayName: string;
            bio: string;
            avatarShape: 'circle' | 'square';
            avatarDisplayStyle?: 'circle' | 'square' | 'arched' | 'ring' | 'horizontal';
            avatarSize: number;
            displayNameSize?: number;
        };
        theme: {
            defaultThemeId: string;
        };
        layout: {
            mode: string;
            config: Record<string, unknown>;
        };
        colors: {
            pageBackground: {
                mode: 'solid' | 'gradient' | 'image';
                solid: string;
                gradient: {
                    start: string;
                    end: string;
                    type: 'linear' | 'radial' | 'diagonal';
                };
                imageUrl: string;
            };
            headerTextAndIcon: string;
            socialBlockBackground: string;
            socialBlockText: string;
            contentBlockBackground: string;
            contentBlockText: string;
            contentBlockButton: string;
        };
        typography: {
            fontFamily: string;
            displayFontFamily?: string;
            bodyFontFamily?: string;
            fontPairingId?: string;
            fontSize: number;
            fontWeight: number;
            headingSize?: number;
            headingWeight?: number;
            headingLetterSpacing?: number;
            headingTransform?: 'none' | 'uppercase';
            lineHeight?: number;
        };
        socials: {
            iconSize: number;
            displayMode: 'icons' | 'buttons' | 'both' | 'icon-only';
            items: Array<{
                platform: string;
                url: string;
                iconUrl: string;
            }>;
            customFaviconEnabled: boolean;
        };
        divLayout: {
            widthPercent: number;
            border: {
                width: number;
                style: 'solid' | 'dashed' | 'none';
                color: string;
                radius: number;
            };
            boxShadow: {
                enabled: boolean;
                x: number;
                y: number;
                blur: number;
                spread: number;
                color: string;
            };
        };
    };
    createdAt: string;
    updatedAt: string;
};
export declare class BlocksRepository {
    private readonly databaseService;
    constructor(databaseService: DatabaseService);
    private readonly defaultHeaderBlockId;
    private readonly socialPlatforms;
    private mapDefinitionRow;
    private normalizeId;
    private buildDefaultHeaderBlock;
    private ensureDefaultHeaderBlock;
    list(): Promise<Record<string, unknown>[]>;
    get(id: string): Promise<Record<string, unknown> | null>;
    getDefaultId(): Promise<{
        defaultBlockId: string;
    }>;
    getDefaultHeaderBlock(): Promise<Record<string, unknown> | null>;
    create(payload: Record<string, unknown>): Promise<{
        id: string;
        type: string;
        name: string;
        version: string;
        isDefault: boolean;
        fields: Record<string, unknown>;
        createdAt: string;
        updatedAt: string;
    }>;
    importDefinition(payload: Record<string, unknown>): Promise<{
        id: string;
        type: string;
        name: string;
        version: string;
        isDefault: boolean;
        fields: Record<string, unknown>;
        source: string;
        createdAt: string;
        updatedAt: string;
    }>;
    update(id: string, payload: Record<string, unknown>): Promise<Record<string, unknown> | null>;
}
