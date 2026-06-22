import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { BlocksModule } from '@/modules/blocks/blocks.module';
import { ContactFormsModule } from '@/modules/contact-forms/contact-forms.module';
import { MediaModule } from '@/modules/media/media.module';
import { PagesModule } from '@/modules/pages/pages.module';
import { SocialProfilesModule } from '@/modules/social-profiles/social-profiles.module';

import { AiBackgroundController } from './ai-background.controller';
import { AiBackgroundService } from './ai-background.service';
import { AiChatController } from './ai-chat.controller';
import { AiChatRepository } from './ai-chat.repository';
import { AiChatService } from './ai-chat.service';
import { BrandProfileService } from './brand-profile.service';
import { LandingBuilderService } from './landing-builder.service';
import { UnsplashService } from './unsplash.service';
import { UxDesignService } from './ux-design.service';

@Module({
  imports: [ConfigModule, MediaModule, PagesModule, ContactFormsModule, BlocksModule, SocialProfilesModule],
  controllers: [AiBackgroundController, AiChatController],
  providers: [
    AiBackgroundService,
    AiChatRepository,
    AiChatService,
    BrandProfileService,
    LandingBuilderService,
    UnsplashService,
    UxDesignService,
  ],
  exports: [AiBackgroundService, AiChatService, BrandProfileService, UxDesignService],
})
export class AiModule {}
