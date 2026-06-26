import { OnModuleInit } from '@nestjs/common';
import { FieldPacket, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import type { ExecuteValues } from 'mysql2/promise';
export declare class DatabaseService implements OnModuleInit {
    private readonly logger;
    private pool;
    private readonly authSchemaService;
    private readonly relationalSchemaService;
    private readonly entityTables;
    onModuleInit(): Promise<void>;
    execute<T extends RowDataPacket[] | ResultSetHeader>(sql: string, params?: ExecuteValues): Promise<[T, FieldPacket[]]>;
    transaction<T>(cb: () => Promise<T>): Promise<T>;
    withTransaction<T>(cb: () => Promise<T>): Promise<T>;
    private activeConnection;
    readEntity(entity: string): Promise<Array<{
        id: string;
        data: Record<string, unknown>;
    }>>;
    readRecord(entity: string, recordId: string): Promise<Record<string, unknown> | null>;
    writeRecord(entity: string, recordId: string, payload: Record<string, unknown>): Promise<void>;
    deleteRecord(entity: string, recordId: string): Promise<boolean>;
    private getPool;
    private ensureSchema;
    private normalizePayload;
    private getTableName;
}
