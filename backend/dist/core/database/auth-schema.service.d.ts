import { Pool } from 'mysql2/promise';
export declare class AuthSchemaService {
    private readonly logger;
    ensureSchema(pool: Pool): Promise<void>;
    private createRelationalTables;
    private migrateFromLegacyJson;
    private seedAdminIfMissing;
    private tableHasColumn;
    private normalizePayload;
    private extractMetadata;
}
