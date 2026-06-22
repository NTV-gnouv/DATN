import { Injectable } from '@nestjs/common';

import { DatabaseService } from '@/core/database/database.service';
import type { ContactFormRecord, ContactFormSubmissionRecord } from './contact-forms.types';

@Injectable()
export class ContactFormsRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  private readonly formEntityName = 'contact-forms';
  private readonly submissionEntityName = 'contact-form-submissions';

  async listForms(): Promise<ContactFormRecord[]> {
    const records = await this.databaseService.readEntity(this.formEntityName);
    return records.map((record) => record.data as ContactFormRecord);
  }

  async getForm(id: string): Promise<ContactFormRecord | null> {
    return (await this.databaseService.readRecord(this.formEntityName, id)) as ContactFormRecord | null;
  }

  async saveForm(record: ContactFormRecord): Promise<ContactFormRecord> {
    await this.databaseService.writeRecord(this.formEntityName, record.id, record as unknown as Record<string, unknown>);
    return record;
  }

  async listSubmissions(formId?: string): Promise<ContactFormSubmissionRecord[]> {
    const records = await this.databaseService.readEntity(this.submissionEntityName);
    const mapped = records.map((record) => record.data as ContactFormSubmissionRecord);
    if (!formId) {
      return mapped;
    }
    return mapped.filter((item) => item.formId === formId);
  }

  async getSubmission(id: string): Promise<ContactFormSubmissionRecord | null> {
    return (await this.databaseService.readRecord(this.submissionEntityName, id)) as ContactFormSubmissionRecord | null;
  }

  async saveSubmission(record: ContactFormSubmissionRecord): Promise<ContactFormSubmissionRecord> {
    await this.databaseService.writeRecord(this.submissionEntityName, record.id, record as unknown as Record<string, unknown>);
    return record;
  }

  async deleteSubmission(id: string): Promise<boolean> {
    return this.databaseService.deleteRecord(this.submissionEntityName, id);
  }

  async deleteSubmissionsByFormId(formId: string): Promise<number> {
    const rows = await this.listSubmissions(formId);
    let deleted = 0;
    for (const row of rows) {
      const ok = await this.databaseService.deleteRecord(this.submissionEntityName, row.id);
      if (ok) {
        deleted += 1;
      }
    }
    return deleted;
  }
}
