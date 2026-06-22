import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@/core/database/database.service';

export type EmailLogRecord = {
  id: string;
  to: string;
  subject: string;
  template: string;
  status: 'queued' | 'sent' | 'failed';
  errorMessage?: string;
  createdAt: string;
};

@Injectable()
export class EmailRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  private readonly entityName = 'email-logs';

  async create(record: Omit<EmailLogRecord, 'id' | 'createdAt'>) {
    const id = `email-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const next: EmailLogRecord = {
      id,
      createdAt: new Date().toISOString(),
      ...record,
    };
    await this.databaseService.writeRecord(this.entityName, id, next);
    return next;
  }

  async list() {
    const records = await this.databaseService.readEntity(this.entityName);
    return records.map((record) => record.data as EmailLogRecord);
  }
}
