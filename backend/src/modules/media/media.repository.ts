import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@/core/database/database.service';

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

@Injectable()
export class MediaRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  private readonly entityName = 'media';

  async list() {
    const records = await this.databaseService.readEntity(this.entityName);
    return records.map((record) => record.data as MediaRecord);
  }

  async get(id: string) {
    return (await this.databaseService.readRecord(this.entityName, id)) as MediaRecord | null;
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
    await this.databaseService.writeRecord(this.entityName, id, record);
    return record;
  }

  async update(id: string, payload: Record<string, unknown>) {
    const current = (await this.get(id)) as MediaRecord | null;
    if (!current) {
      return null;
    }

    const next = { ...current, ...payload, id: current.id } as MediaRecord;
    await this.databaseService.writeRecord(this.entityName, id, next);
    return next;
  }
}
