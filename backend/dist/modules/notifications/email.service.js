"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = require("nodemailer");
const email_repository_1 = require("./email.repository");
let EmailService = EmailService_1 = class EmailService {
    constructor(emailRepository) {
        this.emailRepository = emailRepository;
        this.logger = new common_1.Logger(EmailService_1.name);
        const host = process.env.SMTP_HOST;
        const port = Number(process.env.SMTP_PORT ?? 465);
        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASS;
        this.transport = host && user && pass ? nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } }) : null;
    }
    async sendTransactionalEmail(input) {
        const log = await this.emailRepository.create({
            to: input.to,
            subject: input.subject,
            template: input.template,
            status: 'queued',
        });
        try {
            if (this.transport) {
                await this.transport.sendMail({
                    from: process.env.SMTP_USER ?? 'no-reply@shotvn.local',
                    to: input.to,
                    subject: input.subject,
                    html: input.html,
                });
            }
            return this.emailRepository.create({
                to: input.to,
                subject: input.subject,
                template: input.template,
                status: 'sent',
            });
        }
        catch (error) {
            this.logger.error('Failed to send email', error instanceof Error ? error.stack : undefined);
            return this.emailRepository.create({
                to: input.to,
                subject: input.subject,
                template: input.template,
                status: 'failed',
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    async sendWelcomeEmail(to, name) {
        return this.sendTransactionalEmail({
            to,
            subject: 'Welcome to ShotVN',
            template: 'welcome',
            html: `<p>Hello ${name}, welcome to ShotVN.</p>`,
        });
    }
    listLogs() {
        return this.emailRepository.list();
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [email_repository_1.EmailRepository])
], EmailService);
