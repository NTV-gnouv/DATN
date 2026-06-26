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
export declare class EmailRepository {
    private readonly databaseService;
    constructor(databaseService: DatabaseService);
    private mapRow;
    create(record: Omit<EmailLogRecord, 'id' | 'createdAt'>): Promise<EmailLogRecord>;
    list(): Promise<EmailLogRecord[]>;
}
