import { Injectable } from '@nestjs/common';
import { RowDataPacket } from 'mysql2/promise';

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

type EmailLogRow = RowDataPacket & {
  id: string;
  recipient: string;
  subject: string;
  template: string;
  status: string;
  error_message: string | null;
  created_at: Date;
};

@Injectable()
export class EmailRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  private mapRow(row: EmailLogRow): EmailLogRecord {
    return {
      id: row.id,
      to: row.recipient,
      subject: row.subject,
      template: row.template,
      status: row.status as EmailLogRecord['status'],
      ...(row.error_message ? { errorMessage: row.error_message } : {}),
      createdAt: row.created_at.toISOString(),
    };
  }

  async create(record: Omit<EmailLogRecord, 'id' | 'createdAt'>) {
    const id = `email-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const next: EmailLogRecord = {
      id,
      createdAt: new Date().toISOString(),
      ...record,
    };

    await this.databaseService.execute(
      `INSERT INTO email_logs (id, recipient, subject, template, status, error_message)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id,
        next.to,
        next.subject,
        next.template,
        next.status,
        next.errorMessage ?? null,
      ],
    );

    return next;
  }

  async list() {
    const [rows] = await this.databaseService.execute<EmailLogRow[]>(
      `SELECT id, recipient, subject, template, status, error_message, created_at
       FROM email_logs ORDER BY created_at DESC`,
    );
    return rows.map((row) => this.mapRow(row));
  }
}
