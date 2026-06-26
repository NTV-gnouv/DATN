import { Injectable } from '@nestjs/common';
import { RowDataPacket } from 'mysql2/promise';

import { DatabaseService } from '@/core/database/database.service';
import { normalizeJsonPayload } from '@/core/database/json-payload.util';

type UserProfileRow = RowDataPacket & {
  id: string;
  name: string;
  role: string;
  deleted: 0 | 1;
  metadata: unknown;
};

@Injectable()
export class UsersRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  private mapRow(row: UserProfileRow) {
    const metadata = normalizeJsonPayload(row.metadata);
    return {
      id: row.id,
      name: row.name,
      role: row.role,
      deleted: row.deleted === 1,
      ...metadata,
    };
  }

  async findById(id: string) {
    const [rows] = await this.databaseService.execute<UserProfileRow[]>(
      `SELECT id, name, role, deleted, metadata FROM user_profiles WHERE id = ? LIMIT 1`,
      [id],
    );
    const row = rows[0];
    return row ? this.mapRow(row) : { id, name: 'Demo User', role: 'creator' };
  }

  async findAll() {
    const [rows] = await this.databaseService.execute<UserProfileRow[]>(
      `SELECT id, name, role, deleted, metadata FROM user_profiles ORDER BY updated_at DESC`,
    );
    return rows.map((row) => this.mapRow(row));
  }

  async update(id: string, payload: Record<string, unknown>) {
    const current = (await this.findById(id)) as Record<string, unknown>;
    const next = { ...current, ...payload, id } as Record<string, unknown>;

    await this.databaseService.execute(
      `INSERT INTO user_profiles (id, name, role, deleted, metadata)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         role = VALUES(role),
         deleted = VALUES(deleted),
         metadata = VALUES(metadata),
         updated_at = CURRENT_TIMESTAMP`,
      [
        id,
        String(next.name ?? 'User'),
        String(next.role ?? 'creator'),
        next.deleted === true ? 1 : 0,
        JSON.stringify(next),
      ],
    );

    return next;
  }

  async softDelete(id: string) {
    const current = (await this.findById(id)) as Record<string, unknown>;
    const next = { ...current, id, deleted: true };
    await this.update(id, next);
    return next;
  }
}
