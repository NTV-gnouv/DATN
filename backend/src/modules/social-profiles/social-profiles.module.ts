import { Module } from '@nestjs/common';

import { SocialProfilesController } from './social-profiles.controller';
import { SocialProfilesService } from './social-profiles.service';

@Module({
  controllers: [SocialProfilesController],
  providers: [SocialProfilesService],
  exports: [SocialProfilesService],
})
export class SocialProfilesModule {}
