import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@/core/database/database.service';

@Injectable()
export class UsersRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  private readonly entityName = 'users';

  async findById(id: string) {
    return (await this.databaseService.readRecord(this.entityName, id)) ?? { id, name: 'Demo User', role: 'creator' };
  }

  async findAll() {
    const records = await this.databaseService.readEntity(this.entityName);
    return records.map((record) => ({ id: record.id, ...record.data }));
  }

  async update(id: string, payload: Record<string, unknown>) {
    const current = (await this.findById(id)) as Record<string, unknown>;
    const next = { ...current, ...payload, id };
    await this.databaseService.writeRecord(this.entityName, id, next);
    return next;
  }

  async softDelete(id: string) {
    const current = (await this.findById(id)) as Record<string, unknown>;
    const next = { ...current, id, deleted: true };
    await this.databaseService.writeRecord(this.entityName, id, next);
    return next;
  }
}
