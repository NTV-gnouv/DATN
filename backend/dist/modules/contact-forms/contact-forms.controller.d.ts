import type { Request } from 'express';
import { ContactFormsService } from './contact-forms.service';
export declare class ContactFormsController {
    private readonly service;
    constructor(service: ContactFormsService);
    listForms(): Promise<import("./contact-forms.types").ContactFormRecord[]>;
    listSubmissions(formId?: string): Promise<import("./contact-forms.types").ContactFormSubmissionRecord[]>;
    clearSubmissions(formId: string): Promise<{
        message: string;
        formId: string;
        deletedCount: number;
    }>;
    getSubmission(id: string): Promise<import("./contact-forms.types").ContactFormSubmissionRecord>;
    deleteSubmission(id: string): Promise<{
        message: string;
        id: string;
    }>;
    getForm(id: string): Promise<import("./contact-forms.types").ContactFormRecord>;
    createForm(body: Record<string, unknown>): Promise<import("./contact-forms.types").ContactFormRecord>;
    updateForm(id: string, body: Record<string, unknown>): Promise<import("./contact-forms.types").ContactFormRecord>;
    submit(id: string, body: Record<string, unknown>, request: Request): Promise<{
        message: string;
        submissionId: string;
        submittedAt: string;
    }>;
}
