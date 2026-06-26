import { Injectable } from '@nestjs/common';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

import { DatabaseService } from '@/core/database/database.service';
import { normalizeJsonPayload, toJsonColumn } from '@/core/database/json-payload.util';
import { persistSubmissionFields } from '@/core/database/submission-fields.util';

import type { ContactFormRecord, ContactFormSubmissionRecord } from './contact-forms.types';

type ContactFormRow = RowDataPacket & {
  id: string;
  name: string;
  description: string | null;
  submit_label: string;
  success_message: string | null;
  status: string;
  fields: unknown;
  created_at: Date;
  updated_at: Date;
};

type ContactSubmissionRow = RowDataPacket & {
  id: string;
  form_id: string;
  payload: unknown;
  ip: string;
  user_agent: string | null;
  page_url: string | null;
  field_labels: unknown;
  submitted_at: Date;
};

@Injectable()
export class ContactFormsRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  private mapFormRow(row: ContactFormRow): ContactFormRecord {
    return {
      id: row.id,
      name: row.name,
      description: row.description ?? '',
      submitLabel: row.submit_label,
      successMessage: row.success_message ?? '',
      status: row.status as ContactFormRecord['status'],
      fields: normalizeJsonPayload(row.fields) as unknown as ContactFormRecord['fields'],
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }

  private mapSubmissionRow(row: ContactSubmissionRow): ContactFormSubmissionRecord {
    return {
      id: row.id,
      formId: row.form_id,
      payload: normalizeJsonPayload(row.payload),
      metadata: {
        ip: row.ip,
        userAgent: row.user_agent ?? '',
        submittedAt: row.submitted_at.toISOString(),
        pageUrl: row.page_url ?? '',
        ...(row.field_labels
          ? { fieldLabels: normalizeJsonPayload(row.field_labels) as Record<string, string> }
          : {}),
      },
    };
  }

  async listForms(): Promise<ContactFormRecord[]> {
    const [rows] = await this.databaseService.execute<ContactFormRow[]>(
      `SELECT id, name, description, submit_label, success_message, status, fields, created_at, updated_at
       FROM contact_forms ORDER BY updated_at DESC`,
    );
    return rows.map((row) => this.mapFormRow(row));
  }

  async getForm(id: string): Promise<ContactFormRecord | null> {
    const [rows] = await this.databaseService.execute<ContactFormRow[]>(
      `SELECT id, name, description, submit_label, success_message, status, fields, created_at, updated_at
       FROM contact_forms WHERE id = ? LIMIT 1`,
      [id],
    );
    const row = rows[0];
    return row ? this.mapFormRow(row) : null;
  }

  async saveForm(record: ContactFormRecord): Promise<ContactFormRecord> {
    await this.databaseService.execute(
      `INSERT INTO contact_forms (id, name, description, submit_label, success_message, status, fields, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         description = VALUES(description),
         submit_label = VALUES(submit_label),
         success_message = VALUES(success_message),
         status = VALUES(status),
         fields = VALUES(fields),
         updated_at = VALUES(updated_at)`,
      [
        record.id,
        record.name,
        record.description,
        record.submitLabel,
        record.successMessage,
        record.status,
        JSON.stringify(record.fields),
        record.createdAt,
        record.updatedAt,
      ],
    );
    return record;
  }

  async listSubmissions(formId?: string): Promise<ContactFormSubmissionRecord[]> {
    const [rows] = formId
      ? await this.databaseService.execute<ContactSubmissionRow[]>(
          `SELECT id, form_id, payload, ip, user_agent, page_url, field_labels, submitted_at
           FROM contact_form_submissions WHERE form_id = ? ORDER BY submitted_at DESC`,
          [formId],
        )
      : await this.databaseService.execute<ContactSubmissionRow[]>(
          `SELECT id, form_id, payload, ip, user_agent, page_url, field_labels, submitted_at
           FROM contact_form_submissions ORDER BY submitted_at DESC`,
        );

    return rows.map((row) => this.mapSubmissionRow(row));
  }

  async getSubmission(id: string): Promise<ContactFormSubmissionRecord | null> {
    const [rows] = await this.databaseService.execute<ContactSubmissionRow[]>(
      `SELECT id, form_id, payload, ip, user_agent, page_url, field_labels, submitted_at
       FROM contact_form_submissions WHERE id = ? LIMIT 1`,
      [id],
    );
    const row = rows[0];
    return row ? this.mapSubmissionRow(row) : null;
  }

  async saveSubmission(record: ContactFormSubmissionRecord): Promise<ContactFormSubmissionRecord> {
    await this.databaseService.withTransaction(async () => {
      await this.databaseService.execute(
        `INSERT INTO contact_form_submissions (id, form_id, payload, ip, user_agent, page_url, field_labels, submitted_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           form_id = VALUES(form_id),
           payload = VALUES(payload),
           ip = VALUES(ip),
           user_agent = VALUES(user_agent),
           page_url = VALUES(page_url),
           field_labels = VALUES(field_labels),
           submitted_at = VALUES(submitted_at)`,
        [
          record.id,
          record.formId,
          JSON.stringify(record.payload),
          record.metadata.ip,
          record.metadata.userAgent,
          record.metadata.pageUrl,
          toJsonColumn(record.metadata.fieldLabels ?? null),
          record.metadata.submittedAt,
        ],
      );

      await this.databaseService.execute(
        `DELETE FROM contact_form_submission_fields WHERE submission_id = ?`,
        [record.id],
      );
      await persistSubmissionFields(
        async (sql, params) => {
          await this.databaseService.execute(sql, params ?? []);
        },
        record.id,
        record.formId,
        record.payload,
      );
    });

    return record;
  }

  async countSubmissions(formId: string, startAt?: string, endAt?: string): Promise<number> {
    const params: string[] = [formId];
    let sql = `SELECT COUNT(*) AS total FROM contact_form_submissions WHERE form_id = ?`;

    if (startAt) {
      sql += ` AND submitted_at >= ?`;
      params.push(startAt);
    }
    if (endAt) {
      sql += ` AND submitted_at <= ?`;
      params.push(endAt);
    }

    const [rows] = await this.databaseService.execute<RowDataPacket[]>(sql, params);
    return Number(rows[0]?.total ?? 0);
  }

  async aggregateSubmissionFields(formId: string, fieldKey: string, limit = 20) {
    const [rows] = await this.databaseService.execute<RowDataPacket[]>(
      `SELECT value_text AS valueKey, COUNT(*) AS total
       FROM contact_form_submission_fields
       WHERE form_id = ? AND field_key = ?
       GROUP BY value_text
       ORDER BY total DESC
       LIMIT ?`,
      [formId, fieldKey, limit],
    );

    return rows.map((row) => ({
      value: String(row.valueKey ?? ''),
      count: Number(row.total ?? 0),
    }));
  }

  async deleteSubmission(id: string): Promise<boolean> {
    const [result] = await this.databaseService.execute<ResultSetHeader>(
      `DELETE FROM contact_form_submissions WHERE id = ?`,
      [id],
    );
    return result.affectedRows > 0;
  }

  async deleteSubmissionsByFormId(formId: string): Promise<number> {
    const [result] = await this.databaseService.execute<ResultSetHeader>(
      `DELETE FROM contact_form_submissions WHERE form_id = ?`,
      [formId],
    );
    return result.affectedRows;
  }
}
