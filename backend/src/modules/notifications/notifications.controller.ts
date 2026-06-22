import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

import { EmailService } from './email.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly emailService: EmailService) {}

  @Get('email/logs')
  @ApiOperation({ summary: 'List email logs', description: 'Return transactional email delivery logs.' })
  listEmailLogs() {
    return this.emailService.listLogs();
  }

  @Post('email/welcome')
  @ApiOperation({ summary: 'Send welcome email', description: 'Send a welcome email to a user.' })
  @ApiBody({ description: 'Email recipient and display name' })
  sendWelcome(@Body() body: { to: string; name: string }) {
    return this.emailService.sendWelcomeEmail(body.to, body.name);
  }

  @Post('email/send')
  @ApiOperation({ summary: 'Send transactional email', description: 'Send an arbitrary transactional email.' })
  @ApiBody({ description: 'Transactional email payload' })
  sendEmail(@Body() body: { to: string; subject: string; template: string; html: string }) {
    return this.emailService.sendTransactionalEmail(body);
  }
}
