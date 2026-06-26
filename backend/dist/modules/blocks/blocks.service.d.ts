import { BlocksRepository } from './blocks.repository';
export declare class BlocksService {
    private readonly blocksRepository;
    constructor(blocksRepository: BlocksRepository);
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
