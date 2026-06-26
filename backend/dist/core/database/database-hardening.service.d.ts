import { Pool } from 'mysql2/promise';
export declare class DatabaseHardeningService {
    private readonly logger;
    ensureEnhancements(pool: Pool): Promise<void>;
    private ensureSubmissionFieldsTable;
    private ensurePageBlockReferenceColumns;
    private ensureContactFormPageLink;
    private ensurePerformanceIndexes;
    private ensureReferentialIntegrity;
    private backfillSubmissionFields;
    private backfillPageBlockReferences;
    private sanitizeEditorConfigSnapshots;
    resolveBlockReferences(blockType: string, data: Record<string, unknown>): {
        definitionId: string | null;
        refEntity: string | null;
        refId: string | null;
    };
    private addIndexIfMissing;
    private addForeignKeyIfMissing;
    private columnExists;
    private indexExists;
    private foreignKeyExists;
}
