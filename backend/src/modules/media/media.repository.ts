import { Injectable } from '@nestjs/common';
import { RowDataPacket } from 'mysql2/promise';

import { DatabaseService } from '@/core/database/database.service';
import { normalizeJsonPayload, toJsonColumn } from '@/core/database/json-payload.util';

type MediaRecord = {
  id: string;
  ownerId?: string;
  originalName: string;
  mimeType: string;
  size: number;
  purpose?: 'avatar' | 'background';
  width: number | null;
  height: number | null;
  storageKey: string;
  previewPath?: string;
  thumbPath?: string;
  publicUrl: string;
  variants: Record<string, string>;
};

type MediaRow = RowDataPacket & {
  id: string;
  owner_id: string | null;
  original_name: string;
  mime_type: string;
  size: number;
  purpose: string | null;
  width: number | null;
  height: number | null;
  storage_key: string;
  preview_path: string | null;
  thumb_path: string | null;
  public_url: string;
  variants: unknown;
};

@Injectable()
export class MediaRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  private mapRow(row: MediaRow): MediaRecord {
    const variants = normalizeJsonPayload(row.variants);
    return {
      id: row.id,
      ...(row.owner_id ? { ownerId: row.owner_id } : {}),
      originalName: row.original_name,
      mimeType: row.mime_type,
      size: Number(row.size),
      ...(row.purpose ? { purpose: row.purpose as MediaRecord['purpose'] } : {}),
      width: row.width,
      height: row.height,
      storageKey: row.storage_key,
      ...(row.preview_path ? { previewPath: row.preview_path } : {}),
      ...(row.thumb_path ? { thumbPath: row.thumb_path } : {}),
      publicUrl: row.public_url,
      variants: variants as Record<string, string>,
    };
  }

  async list() {
    const [rows] = await this.databaseService.execute<MediaRow[]>(
      `SELECT id, owner_id, original_name, mime_type, size, purpose, width, height, storage_key, preview_path, thumb_path, public_url, variants
       FROM media ORDER BY created_at DESC`,
    );
    return rows.map((row) => this.mapRow(row));
  }

  async get(id: string) {
    const [rows] = await this.databaseService.execute<MediaRow[]>(
      `SELECT id, owner_id, original_name, mime_type, size, purpose, width, height, storage_key, preview_path, thumb_path, public_url, variants
       FROM media WHERE id = ? LIMIT 1`,
      [id],
    );
    const row = rows[0];
    return row ? this.mapRow(row) : null;
  }

  async create(payload: Record<string, unknown>) {
    const id = `media-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const record: MediaRecord = {
      id,
      ownerId: String(payload.ownerId ?? ''),
      originalName: String(payload.originalName ?? 'upload'),
      mimeType: String(payload.mimeType ?? 'application/octet-stream'),
      size: Number(payload.size ?? 0),
      width: payload.width == null ? null : Number(payload.width),
      height: payload.height == null ? null : Number(payload.height),
      storageKey: String(payload.storageKey ?? `${id}/original`),
      publicUrl: String(payload.publicUrl ?? ''),
      variants: (payload.variants as Record<string, string>) ?? {},
    };

    await this.databaseService.execute(
      `INSERT INTO media (id, owner_id, original_name, mime_type, size, purpose, width, height, storage_key, preview_path, thumb_path, public_url, variants)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        record.ownerId || null,
        record.originalName,
        record.mimeType,
        record.size,
        payload.purpose ? String(payload.purpose) : null,
        record.width,
        record.height,
        record.storageKey,
        payload.previewPath ? String(payload.previewPath) : null,
        payload.thumbPath ? String(payload.thumbPath) : null,
        record.publicUrl,
        toJsonColumn(record.variants),
      ],
    );

    return record;
  }

  async update(id: string, payload: Record<string, unknown>) {
    const current = await this.get(id);
    if (!current) {
      return null;
    }

    const next = { ...current, ...payload, id: current.id } as MediaRecord;

    await this.databaseService.execute(
      `UPDATE media
       SET owner_id = ?, original_name = ?, mime_type = ?, size = ?, purpose = ?, width = ?, height = ?, storage_key = ?, preview_path = ?, thumb_path = ?, public_url = ?, variants = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        next.ownerId || null,
        next.originalName,
        next.mimeType,
        next.size,
        next.purpose ?? null,
        next.width,
        next.height,
        next.storageKey,
        next.previewPath ?? null,
        next.thumbPath ?? null,
        next.publicUrl,
        toJsonColumn(next.variants),
        id,
      ],
    );

    return next;
  }
}
