import { Pool } from 'mysql2/promise';
export declare class RelationalSchemaService {
    private readonly logger;
    private readonly hardeningService;
    ensureSchema(pool: Pool): Promise<void>;
    private finalizeSchema;
    private createAllTables;
    private migrateFromLegacyJson;
    private seedDemoData;
    private readLegacyTable;
    private tableExists;
    private tableHasColumn;
}
