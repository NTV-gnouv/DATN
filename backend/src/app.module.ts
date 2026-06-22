import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { AdminModule } from './modules/admin/admin.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AuthModule } from './modules/auth/auth.module';
import { BlocksModule } from './modules/blocks/blocks.module';
import { ContactFormsModule } from './modules/contact-forms/contact-forms.module';
import { LinkPreviewModule } from './modules/link-preview/link-preview.module';
import { SocialProfilesModule } from './modules/social-profiles/social-profiles.module';
import { MediaModule } from './modules/media/media.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PagesModule } from './modules/pages/pages.module';
import { PluginsModule } from './modules/plugins/plugins.module';
import { ThemesModule } from './modules/themes/themes.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { AiModule } from './modules/ai/ai.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SharedModule,
    CoreModule,
    AuthModule,
    UsersModule,
    PagesModule,
    BlocksModule,
    ContactFormsModule,
    LinkPreviewModule,
    SocialProfilesModule,
    ThemesModule,
    OnboardingModule,
    PluginsModule,
    MediaModule,
    NotificationsModule,
    AnalyticsModule,
    AiModule,
    AdminModule,
  ],
})
export class AppModule {}
