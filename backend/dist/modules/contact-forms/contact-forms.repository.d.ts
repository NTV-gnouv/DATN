import { DatabaseService } from '@/core/database/database.service';
import type { ContactFormRecord, ContactFormSubmissionRecord } from './contact-forms.types';
export declare class ContactFormsRepository {
    private readonly databaseService;
    constructor(databaseService: DatabaseService);
    private mapFormRow;
    private mapSubmissionRow;
    listForms(): Promise<ContactFormRecord[]>;
    getForm(id: string): Promise<ContactFormRecord | null>;
    saveForm(record: ContactFormRecord): Promise<ContactFormRecord>;
    listSubmissions(formId?: string): Promise<ContactFormSubmissionRecord[]>;
    getSubmission(id: string): Promise<ContactFormSubmissionRecord | null>;
    saveSubmission(record: ContactFormSubmissionRecord): Promise<ContactFormSubmissionRecord>;
    countSubmissions(formId: string, startAt?: string, endAt?: string): Promise<number>;
    aggregateSubmissionFields(formId: string, fieldKey: string, limit?: number): Promise<{
        value: string;
        count: number;
    }[]>;
    deleteSubmission(id: string): Promise<boolean>;
    deleteSubmissionsByFormId(formId: string): Promise<number>;
}
