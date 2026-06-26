import { DatabaseService } from '@/core/database/database.service';
export type PluginRecord = {
    id: string;
    name: string;
    version: string;
    type: string;
    entry: string;
    permissions: string[];
    enabled: boolean;
    sourcePath: string;
};
export declare class PluginsRepository {
    private readonly databaseService;
    constructor(databaseService: DatabaseService);
    private mapRow;
    list(): Promise<PluginRecord[]>;
    get(id: string): Promise<PluginRecord | null>;
    create(payload: Record<string, unknown>): Promise<PluginRecord>;
    update(id: string, payload: Record<string, unknown>): Promise<PluginRecord | null>;
    replaceAll(items: PluginRecord[]): Promise<void>;
    remove(id: string): Promise<{
        removed: boolean;
        id: string;
    }>;
}
