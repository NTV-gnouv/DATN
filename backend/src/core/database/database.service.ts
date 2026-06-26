import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { createPool, FieldPacket, Pool, PoolConnection, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import type { ExecuteValues } from 'mysql2/promise';

import { AuthSchemaService } from './auth-schema.service';
import { normalizeJsonPayload } from './json-payload.util';
import { RelationalSchemaService } from './relational-schema.service';

type StoredRecordRow = RowDataPacket & {
  record_id: string;
  payload: unknown;
};

type EntityTable = {
  entity: string;
  tableName: string;
};

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name);
  private pool: Pool | null = null;
  private readonly authSchemaService = new AuthSchemaService();
  private readonly relationalSchemaService = new RelationalSchemaService();
  private readonly entityTables: EntityTable[] = [
    { entity: 'admin', tableName: 'admin_records' },
    { entity: 'analytics', tableName: 'analytics' },
  ];

  async onModuleInit(): Promise<void> {
    const pool = await this.getPool();
    await this.authSchemaService.ensureSchema(pool);
    await this.relationalSchemaService.ensureSchema(pool);
    await this.ensureSchema();
  }

  async execute<T extends RowDataPacket[] | ResultSetHeader>(
    sql: string,
    params: ExecuteValues = [],
  ): Promise<[T, FieldPacket[]]> {
    if (this.activeConnection) {
      return this.activeConnection.execute<T>(sql, params);
    }

    const pool = await this.getPool();
    return pool.execute<T>(sql, params);
  }

  async transaction<T>(cb: () => Promise<T>): Promise<T> {
    return this.withTransaction(async () => cb());
  }

  async withTransaction<T>(cb: () => Promise<T>): Promise<T> {
    const pool = await this.getPool();
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();
      this.activeConnection = connection;
      const result = await cb();
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      this.activeConnection = null;
      connection.release();
    }
  }

  private activeConnection: PoolConnection | null = null;

  async readEntity(entity: string): Promise<Array<{ id: string; data: Record<string, unknown> }>> {
    const pool = await this.getPool();
    const tableName = this.getTableName(entity);
    const [rows] = await pool.execute<StoredRecordRow[]>(
      `SELECT record_id, payload FROM ${tableName} ORDER BY updated_at DESC`,
      [],
    );

    return rows.map((row) => ({
      id: row.record_id,
      data: this.normalizePayload(row.payload),
    }));
  }

  async readRecord(entity: string, recordId: string): Promise<Record<string, unknown> | null> {
    const pool = await this.getPool();
    const tableName = this.getTableName(entity);
    const [rows] = await pool.execute<StoredRecordRow[]>(
      `SELECT record_id, payload FROM ${tableName} WHERE record_id = ? LIMIT 1`,
      [recordId],
    );

    const row = rows[0];
    return row ? this.normalizePayload(row.payload) : null;
  }

  async writeRecord(entity: string, recordId: string, payload: Record<string, unknown>): Promise<void> {
    const pool = await this.getPool();
    const jsonPayload = JSON.stringify(payload);
    const tableName = this.getTableName(entity);
    await pool.execute<ResultSetHeader>(
      `INSERT INTO ${tableName} (record_id, payload)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE payload = VALUES(payload), updated_at = CURRENT_TIMESTAMP`,
      [recordId, jsonPayload],
    );
  }

  async deleteRecord(entity: string, recordId: string): Promise<boolean> {
    const pool = await this.getPool();
    const tableName = this.getTableName(entity);
    const [result] = await pool.execute<ResultSetHeader>(
      `DELETE FROM ${tableName} WHERE record_id = ?`,
      [recordId],
    );

    return result.affectedRows > 0;
  }

  private async getPool(): Promise<Pool> {
    if (this.pool) {
      return this.pool;
    }

    this.pool = createPool({
      host: process.env.DB_HOST ?? '127.0.0.1',
      port: Number(process.env.DB_PORT ?? 3306),
      user: process.env.DB_USER ?? 'root',
      password: process.env.DB_PASS ?? '',
      database: process.env.DB_NAME ?? 'shotvn',
      connectionLimit: 10,
      decimalNumbers: true,
      namedPlaceholders: false,
    });

    return this.pool;
  }

  private async ensureSchema(): Promise<void> {
    const pool = await this.getPool();
    for (const item of this.entityTables) {
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS ${item.tableName} (
          record_id VARCHAR(191) NOT NULL,
          payload JSON NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (record_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
    }
    this.logger.log('MySQL legacy JSON tables schema ensured');
  }

  private normalizePayload(payload: unknown): Record<string, unknown> {
    return normalizeJsonPayload(payload);
  }

  private getTableName(entity: string): string {
    return this.entityTables.find((item) => item.entity === entity)?.tableName ?? 'admin_records';
  }
}
