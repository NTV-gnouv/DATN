import { Module } from '@nestjs/common';

import { AnalyticsController } from './analytics.controller';
import { AnalyticsRepository } from './analytics.repository';
import { AnalyticsService } from './analytics.service';
import { PageViewsRepository } from './page-views.repository';
import { PageViewsService } from './page-views.service';

@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService, AnalyticsRepository, PageViewsService, PageViewsRepository],
  exports: [PageViewsService],
})
export class AnalyticsModule {}
