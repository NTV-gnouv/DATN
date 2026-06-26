import { DatabaseService } from '@/core/database/database.service';
type MediaRecord = {
    id: string;
    ownerId?: string;
    originalName: string;
    mimeType: string;
    size: number;
    purpose?: 'avatar' | 'background';
    width: number | null;
    height: number | null;
    storageKey: string;
    previewPath?: string;
    thumbPath?: string;
    publicUrl: string;
    variants: Record<string, string>;
};
export declare class MediaRepository {
    private readonly databaseService;
    constructor(databaseService: DatabaseService);
    private mapRow;
    list(): Promise<MediaRecord[]>;
    get(id: string): Promise<MediaRecord | null>;
    create(payload: Record<string, unknown>): Promise<MediaRecord>;
    update(id: string, payload: Record<string, unknown>): Promise<MediaRecord | null>;
}
export {};
