import { EmailRepository } from './email.repository';
export type SendEmailInput = {
    to: string;
    subject: string;
    template: string;
    html: string;
};
export declare class EmailService {
    private readonly emailRepository;
    private readonly logger;
    private readonly transport;
    constructor(emailRepository: EmailRepository);
    sendTransactionalEmail(input: SendEmailInput): Promise<import("./email.repository").EmailLogRecord>;
    sendWelcomeEmail(to: string, name: string): Promise<import("./email.repository").EmailLogRecord>;
    listLogs(): Promise<import("./email.repository").EmailLogRecord[]>;
}
