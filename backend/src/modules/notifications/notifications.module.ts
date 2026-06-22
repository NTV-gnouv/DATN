import { Module } from '@nestjs/common';

import { EmailRepository } from './email.repository';
import { EmailService } from './email.service';
import { NotificationsController } from './notifications.controller';

@Module({
  controllers: [NotificationsController],
  providers: [EmailRepository, EmailService],
  exports: [EmailService],
})
export class NotificationsModule {}
