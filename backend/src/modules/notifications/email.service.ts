import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

import { EmailRepository } from './email.repository';

export type SendEmailInput = {
  to: string;
  subject: string;
  template: string;
  html: string;
};

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transport: Transporter | null;

  constructor(private readonly emailRepository: EmailRepository) {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT ?? 465);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    this.transport = host && user && pass ? nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } }) : null;
  }

  async sendTransactionalEmail(input: SendEmailInput) {
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
    } catch (error) {
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

  async sendWelcomeEmail(to: string, name: string) {
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
}
