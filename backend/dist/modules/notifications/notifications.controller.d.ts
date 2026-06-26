import { EmailService } from './email.service';
export declare class NotificationsController {
    private readonly emailService;
    constructor(emailService: EmailService);
    listEmailLogs(): Promise<import("./email.repository").EmailLogRecord[]>;
    sendWelcome(body: {
        to: string;
        name: string;
    }): Promise<import("./email.repository").EmailLogRecord>;
    sendEmail(body: {
        to: string;
        subject: string;
        template: string;
        html: string;
    }): Promise<import("./email.repository").EmailLogRecord>;
}
