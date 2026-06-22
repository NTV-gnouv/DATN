import { Module } from '@nestjs/common';

import { ContactFormsModule } from '@/modules/contact-forms/contact-forms.module';
import { PagesModule } from '@/modules/pages/pages.module';

import { AnalyticsController } from './analytics.controller';
import { AnalyticsRepository } from './analytics.repository';
import { AnalyticsService } from './analytics.service';
import { PageViewsRepository } from './page-views.repository';
import { PageViewsService } from './page-views.service';
import { PlatformInsightsChatService } from './platform-insights-chat.service';
import { PlatformInsightsContextService } from './platform-insights-context.service';

@Module({
  imports: [PagesModule, ContactFormsModule],
  controllers: [AnalyticsController],
  providers: [
    AnalyticsService,
    AnalyticsRepository,
    PageViewsService,
    PageViewsRepository,
    PlatformInsightsContextService,
    PlatformInsightsChatService,
  ],
  exports: [PageViewsService, PlatformInsightsChatService],
})
export class AnalyticsModule {}
