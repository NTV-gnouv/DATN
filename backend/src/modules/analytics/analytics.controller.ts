import { Body, Controller, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { Public } from '@/shared/decorators/public.decorator';

import { AnalyticsService } from './analytics.service';
import { PageViewsService } from './page-views.service';
import { PlatformInsightsChatService } from './platform-insights-chat.service';

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly pageViewsService: PageViewsService,
    private readonly platformInsightsChatService: PlatformInsightsChatService,
  ) {}

  @Post('page-views')
  @Public()
  @ApiOperation({ summary: 'Track page view', description: 'Record a landing page view event.' })
  trackPageView(
    @Body() body: Record<string, unknown>,
    @Req() request: Request,
  ) {
    const userAgent = String(request.headers['user-agent'] ?? '');
    const referrerHeader = request.headers.referer ?? request.headers.referrer;
    const referrer = Array.isArray(referrerHeader) ? referrerHeader[0] ?? '' : String(referrerHeader ?? '');

    return this.pageViewsService.recordView({
      pageId: String(body.pageId ?? ''),
      slug: String(body.slug ?? ''),
      userAgent,
      referrer,
      clientIp: request.ip ?? '',
      countryCodeHint: body.countryCode,
      headers: request.headers as Record<string, string | string[] | undefined>,
    });
  }

  @Get('page-views/overview')
  @Public()
  @ApiOperation({ summary: 'Page analytics overview', description: 'Aggregated views by date, country and device.' })
  getPageViewsOverview(
    @Query('pageId') pageId: string,
    @Query('slug') slug?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('granularity') granularity?: string,
  ) {
    const resolvedGranularity = granularity === 'hour' ? 'hour' : 'day';
    return this.pageViewsService.getOverview(pageId, slug, startDate, endDate, resolvedGranularity);
  }

  @Post('insights/chat')
  @Public()
  @ApiOperation({
    summary: 'Platform insights chat',
    description: 'Grounded analytics chat for landing page performance and conversion.',
  })
  chatPlatformInsights(@Body() body: Record<string, unknown>) {
    const granularityRaw = String(body.granularity ?? 'day');
    const granularity =
      granularityRaw === 'hour' || granularityRaw === 'week' || granularityRaw === 'month'
        ? granularityRaw
        : 'day';

    return this.platformInsightsChatService.chat({
      pageId: String(body.pageId ?? ''),
      slug: body.slug ? String(body.slug) : undefined,
      startDate: body.startDate ? String(body.startDate) : undefined,
      endDate: body.endDate ? String(body.endDate) : undefined,
      granularity,
      messages: Array.isArray(body.messages)
        ? body.messages
            .map((item) => {
              const record = item as Record<string, unknown>;
              const role = String(record.role ?? '') === 'assistant' ? 'assistant' : 'user';
              return {
                role: role as 'user' | 'assistant',
                content: String(record.content ?? '').trim(),
              };
            })
            .filter((item) => item.content)
        : [],
    });
  }

  @Get()
  @ApiOperation({ summary: 'List analytics records', description: 'Return analytics entries or aggregated metrics.' })
  list() {
    return this.analyticsService.list();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get analytics record', description: 'Return a single analytics record by ID.' })
  get(@Param('id') id: string) {
    return this.analyticsService.get(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create analytics record', description: 'Store a new analytics event or snapshot.' })
  @ApiBody({ description: 'Analytics payload' })
  create(@Body() body: Record<string, unknown>) {
    return this.analyticsService.create(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update analytics record', description: 'Update an analytics record by ID.' })
  @ApiBody({ description: 'Analytics update payload' })
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.analyticsService.update(id, body);
  }
}
