import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { hashSync } from 'bcryptjs';
import { createPool, Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';

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
  private readonly entityTables: EntityTable[] = [
    { entity: 'auth-users', tableName: 'auth_users' },
    { entity: 'auth-refresh-tokens', tableName: 'auth_refresh_tokens' },
    { entity: 'auth-password-reset-tokens', tableName: 'auth_password_reset_tokens' },
    { entity: 'users', tableName: 'users' },
    { entity: 'pages', tableName: 'pages' },
    { entity: 'blocks', tableName: 'blocks' },
    { entity: 'themes', tableName: 'themes' },
    { entity: 'custom_themes', tableName: 'custom_themes' },
    { entity: 'plugins', tableName: 'plugins' },
    { entity: 'contact-forms', tableName: 'contact_forms' },
    { entity: 'contact-form-submissions', tableName: 'contact_form_submissions' },
    { entity: 'media', tableName: 'media' },
    { entity: 'email-logs', tableName: 'email_logs' },
    { entity: 'analytics', tableName: 'analytics' },
    { entity: 'page-view-events', tableName: 'page_view_events' },
    { entity: 'admin', tableName: 'admin_records' },
    { entity: 'onboarding_sessions', tableName: 'onboarding_sessions' },
    { entity: 'ai-chat-sessions', tableName: 'ai_chat_sessions' },
  ];

  async onModuleInit(): Promise<void> {
    await this.getPool();
    await this.ensureSchema();
    await this.seedInitialData();
  }

  async transaction<T>(cb: () => Promise<T>): Promise<T> {
    return cb();
  }

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
    this.logger.log('MySQL entity tables schema ensured');
  }

  private async seedInitialData(): Promise<void> {
    const pool = await this.getPool();
    const seeds: Array<{ entity: string; recordId: string; payload: Record<string, unknown> }> = [
      {
        entity: 'auth-users',
        recordId: 'admin@shotvn.local',
        payload: {
          id: 'u-admin',
          email: 'admin@shotvn.local',
          name: 'System Admin',
          role: 'admin',
          onboardingCompleted: true,
          passwordHash: hashSync('Admin@123', 10),
        },
      },
      {
        entity: 'users',
        recordId: 'u-demo',
        payload: { id: 'u-demo', name: 'Demo User', role: 'creator' },
      },
      {
        entity: 'pages',
        recordId: 'p-demo',
        payload: { id: 'p-demo', title: 'My Landing Page', slug: 'my-landing-page', username: 'demo', status: 'draft' },
      },
      {
        entity: 'themes',
        recordId: 'theme-demo',
        payload: { id: 'theme-demo', name: 'Minimal Theme', version: '1.0.0', enabled: true },
      },
      {
        entity: 'plugins',
        recordId: 'plugin-demo',
        payload: { id: 'plugin-demo', name: 'Hero Block', version: '1.0.0', type: 'block', enabled: true },
      },
    ];

    for (const seed of seeds) {
      const tableName = this.getTableName(seed.entity);
      await pool.execute(
        `INSERT IGNORE INTO ${tableName} (record_id, payload) VALUES (?, ?)`,
        [seed.recordId, JSON.stringify(seed.payload)],
      );
    }
    this.logger.log('MySQL seed data ensured');
  }

  private normalizePayload(payload: unknown): Record<string, unknown> {
    if (typeof payload === 'string') {
      try {
        return JSON.parse(payload) as Record<string, unknown>;
      } catch {
        return { value: payload };
      }
    }

    if (payload && typeof payload === 'object') {
      return payload as Record<string, unknown>;
    }

    return {};
  }

  private getTableName(entity: string): string {
    return this.entityTables.find((item) => item.entity === entity)?.tableName ?? 'admin_records';
  }
}
