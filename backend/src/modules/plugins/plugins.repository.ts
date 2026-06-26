import { Injectable } from '@nestjs/common';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

import { DatabaseService } from '@/core/database/database.service';
import { normalizeJsonPayload, toJsonColumn } from '@/core/database/json-payload.util';

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

type PluginRow = RowDataPacket & {
  id: string;
  name: string;
  version: string;
  plugin_type: string;
  entry: string;
  source_path: string;
  enabled: 0 | 1;
  permissions: unknown;
};

@Injectable()
export class PluginsRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  private mapRow(row: PluginRow): PluginRecord {
    const permissions = normalizeJsonPayload(row.permissions);
    return {
      id: row.id,
      name: row.name,
      version: row.version,
      type: row.plugin_type,
      entry: row.entry,
      sourcePath: row.source_path,
      enabled: row.enabled === 1,
      permissions: Array.isArray(permissions) ? permissions.map(String) : [],
    };
  }

  async list() {
    const [rows] = await this.databaseService.execute<PluginRow[]>(
      `SELECT id, name, version, plugin_type, entry, source_path, enabled, permissions FROM plugins ORDER BY name ASC`,
    );
    return rows.map((row) => this.mapRow(row));
  }

  async get(id: string) {
    const [rows] = await this.databaseService.execute<PluginRow[]>(
      `SELECT id, name, version, plugin_type, entry, source_path, enabled, permissions FROM plugins WHERE id = ? LIMIT 1`,
      [id],
    );
    const row = rows[0];
    return row ? this.mapRow(row) : null;
  }

  async create(payload: Record<string, unknown>) {
    const id = `plugin-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const record: PluginRecord = {
      id,
      name: String(payload.name ?? id),
      version: String(payload.version ?? '1.0.0'),
      type: String(payload.type ?? 'custom'),
      entry: String(payload.entry ?? 'backend/main.js'),
      permissions: Array.isArray(payload.permissions) ? payload.permissions.map(String) : [],
      enabled: Boolean(payload.enabled ?? true),
      sourcePath: String(payload.sourcePath ?? ''),
    };

    await this.databaseService.execute(
      `INSERT INTO plugins (id, name, version, plugin_type, entry, source_path, enabled, permissions)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        record.name,
        record.version,
        record.type,
        record.entry,
        record.sourcePath,
        record.enabled ? 1 : 0,
        toJsonColumn(record.permissions),
      ],
    );

    return record;
  }

  async update(id: string, payload: Record<string, unknown>) {
    const current = await this.get(id);
    if (!current) {
      return null;
    }

    const next: PluginRecord = {
      ...current,
      ...payload,
      id: current.id,
      permissions: Array.isArray(payload.permissions)
        ? payload.permissions.map(String)
        : current.permissions,
    } as PluginRecord;

    await this.databaseService.execute(
      `UPDATE plugins
       SET name = ?, version = ?, plugin_type = ?, entry = ?, source_path = ?, enabled = ?, permissions = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        next.name,
        next.version,
        next.type,
        next.entry,
        next.sourcePath,
        next.enabled ? 1 : 0,
        toJsonColumn(next.permissions),
        id,
      ],
    );

    return next;
  }

  async replaceAll(items: PluginRecord[]): Promise<void> {
    for (const item of items) {
      await this.databaseService.execute(
        `INSERT INTO plugins (id, name, version, plugin_type, entry, source_path, enabled, permissions)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           version = VALUES(version),
           plugin_type = VALUES(plugin_type),
           entry = VALUES(entry),
           source_path = VALUES(source_path),
           enabled = VALUES(enabled),
           permissions = VALUES(permissions),
           updated_at = CURRENT_TIMESTAMP`,
        [
          item.id,
          item.name,
          item.version,
          item.type,
          item.entry,
          item.sourcePath,
          item.enabled ? 1 : 0,
          toJsonColumn(item.permissions),
        ],
      );
    }
  }

  async remove(id: string): Promise<{ removed: boolean; id: string }> {
    const [result] = await this.databaseService.execute<ResultSetHeader>(`DELETE FROM plugins WHERE id = ?`, [id]);
    return { removed: result.affectedRows > 0, id };
  }
}
