import { Module } from '@nestjs/common';

import { ContactFormsController } from './contact-forms.controller';
import { ContactFormsRepository } from './contact-forms.repository';
import { ContactFormsService } from './contact-forms.service';

@Module({
  controllers: [ContactFormsController],
  providers: [ContactFormsService, ContactFormsRepository],
  exports: [ContactFormsService],
})
export class ContactFormsModule {}
