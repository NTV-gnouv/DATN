import { ContactFormsRepository } from './contact-forms.repository';
import { ContactFormRecord, ContactFormSubmissionRecord } from './contact-forms.types';
export declare class ContactFormsService {
    private readonly repository;
    constructor(repository: ContactFormsRepository);
    private slugify;
    private parseNumber;
    private toArray;
    private normalizeField;
    private normalizeFields;
    private validateScalar;
    private validateFileValue;
    listForms(): Promise<ContactFormRecord[]>;
    getForm(id: string): Promise<ContactFormRecord>;
    createForm(payload: Record<string, unknown>): Promise<ContactFormRecord>;
    updateForm(id: string, payload: Record<string, unknown>): Promise<ContactFormRecord>;
    submitForm(formId: string, payload: Record<string, unknown>, requestMeta: {
        ip: string;
        userAgent: string;
        pageUrl: string;
    }): Promise<{
        message: string;
        submissionId: string;
        submittedAt: string;
    }>;
    listSubmissions(formId?: string): Promise<ContactFormSubmissionRecord[]>;
    getSubmission(id: string): Promise<ContactFormSubmissionRecord>;
    deleteSubmission(id: string): Promise<{
        message: string;
        id: string;
    }>;
    clearSubmissions(formId: string): Promise<{
        message: string;
        formId: string;
        deletedCount: number;
    }>;
}
