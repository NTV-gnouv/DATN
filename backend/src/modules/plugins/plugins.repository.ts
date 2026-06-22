import { Injectable } from '@nestjs/common';
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

@Injectable()
export class PluginsRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  private readonly entityName = 'plugins';

  async list() {
    const records = await this.databaseService.readEntity(this.entityName);
    return records.map((record) => record.data as PluginRecord);
  }

  async get(id: string) {
    return (await this.databaseService.readRecord(this.entityName, id)) as PluginRecord | null;
  }

  async create(payload: Record<string, unknown>) {
    const id = `plugin-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const record: PluginRecord = {
      id,
      name: String(payload.name ?? id),
      version: String(payload.version ?? '1.0.0'),
      type: String(payload.type ?? 'custom'),
      entry: String(payload.entry ?? 'backend/main.js'),
      permissions: Array.isArray(payload.permissions)
        ? payload.permissions.map(String)
        : [],
      enabled: Boolean(payload.enabled ?? true),
      sourcePath: String(payload.sourcePath ?? ''),
    };
    await this.databaseService.writeRecord(this.entityName, id, record);
    return record;
  }

  async update(id: string, payload: Record<string, unknown>) {
    const current = (await this.get(id)) as PluginRecord | null;
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

    await this.databaseService.writeRecord(this.entityName, id, next);
    return next;
  }

  async replaceAll(items: PluginRecord[]): Promise<void> {
    items.forEach((item) => {
      void this.databaseService.writeRecord(this.entityName, item.id, item);
    });
  }

  async remove(id: string): Promise<{ removed: boolean; id: string }> {
    return { removed: await this.databaseService.deleteRecord(this.entityName, id), id };
  }
}
