import { BlocksService } from './blocks.service';
export declare class BlocksController {
    private readonly blocksService;
    constructor(blocksService: BlocksService);
    list(): Promise<Record<string, unknown>[]>;
    getDefaultId(): Promise<{
        defaultBlockId: string;
    }>;
    getDefaultHeaderBlock(): Promise<Record<string, unknown> | null>;
    get(id: string): Promise<Record<string, unknown> | null>;
    create(body: Record<string, unknown>): Promise<{
        id: string;
        type: string;
        name: string;
        version: string;
        isDefault: boolean;
        fields: Record<string, unknown>;
        createdAt: string;
        updatedAt: string;
    }>;
    importDefinition(body: Record<string, unknown>): Promise<{
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
    update(id: string, body: Record<string, unknown>): Promise<Record<string, unknown> | null>;
}
