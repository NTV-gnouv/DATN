import { BadRequestException, Injectable } from '@nestjs/common';

import { PageViewsRepository } from './page-views.repository';
import type { PageAnalyticsOverview, PageViewEvent, PageViewSeriesGranularity } from './page-views.types';
import {
  floorToHour,
  formatDateKey,
  formatHourKey,
  formatMonthKey,
  getCountryLabel,
  getDeviceLabel,
  getWeekStart,
  isEventInDateRange,
  resolveAnalyticsDateRange,
  resolveClientIp,
  resolveCountryCode,
  resolveDeviceType,
  resolveRolling24HourRange,
  resolveSeriesGranularityForDayRange,
} from './page-views.utils';

@Injectable()
export class PageViewsService {
  constructor(private readonly repository: PageViewsRepository) {}

  async recordView(input: {
    pageId: string;
    slug: string;
    userAgent: string;
    referrer: string;
    clientIp?: string;
    countryCodeHint?: unknown;
    headers: Record<string, string | string[] | undefined>;
  }) {
    const pageId = String(input.pageId ?? '').trim();
    const slug = String(input.slug ?? '').trim();
    if (!pageId || !slug) {
      return { ok: false };
    }

    const clientIp = resolveClientIp(input.headers, input.clientIp ?? '');

    const event: PageViewEvent = {
      id: `pv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      pageId,
      slug,
      viewedAt: new Date().toISOString(),
      countryCode: resolveCountryCode(input.headers, {
        clientIp,
        hintedCountryCode: input.countryCodeHint,
      }),
      device: resolveDeviceType(input.userAgent),
      userAgent: input.userAgent,
      referrer: input.referrer,
    };

    await this.repository.save(event);
    return { ok: true, id: event.id };
  }

  async getOverview(
    pageId: string,
    slug = '',
    startDate?: string,
    endDate?: string,
    granularity: PageViewSeriesGranularity = 'day',
  ): Promise<PageAnalyticsOverview> {
    if (granularity === 'hour') {
      return this.getHourlyOverview(pageId, slug);
    }

    const range = resolveAnalyticsDateRange(startDate, endDate);
    if (!range) {
      throw new BadRequestException(
        'Phạm vi ngày không hợp lệ. Ngày bắt đầu phải trước ngày kết thúc và tối đa 2 năm.',
      );
    }

    const rangeStart = new Date(range.start);
    rangeStart.setHours(0, 0, 0, 0);
    const rangeEnd = new Date(range.end);
    rangeEnd.setHours(23, 59, 59, 999);

    const seriesGranularity = resolveSeriesGranularityForDayRange(range.start, range.end);
    const totalViews = await this.repository.countInRange(pageId, rangeStart, rangeEnd);
    const countryRows = await this.repository.aggregateCountries(pageId, rangeStart, rangeEnd);
    const deviceRows = await this.repository.aggregateDevices(pageId, rangeStart, rangeEnd);
    const series = await this.buildSqlBucketedSeries(pageId, range.start, range.end, seriesGranularity);
    const countries = countryRows.map((row) => ({
      key: row.key,
      label: getCountryLabel(row.key),
      views: row.views,
    }));
    const devices = deviceRows.map((row) => ({
      key: row.key,
      label: getDeviceLabel(row.key as PageViewEvent['device']),
      views: row.views,
    }));
    const latestSlug = await this.repository.getLatestSlug(pageId);

    return {
      pageId,
      slug: slug || latestSlug,
      totalViews,
      startDate: formatDateKey(range.start),
      endDate: formatDateKey(range.end),
      seriesGranularity,
      series,
      countries,
      devices,
    };
  }

  private async buildSqlBucketedSeries(
    pageId: string,
    start: Date,
    end: Date,
    granularity: 'day' | 'week' | 'month',
  ) {
    if (granularity === 'day') {
      const rangeStart = new Date(start);
      rangeStart.setHours(0, 0, 0, 0);
      const rangeEnd = new Date(end);
      rangeEnd.setHours(23, 59, 59, 999);
      const sqlSeries = await this.repository.aggregateDailySeries(pageId, rangeStart, rangeEnd);
      const counts = new Map(sqlSeries.map((item) => [item.date, item.views]));
      const cursor = new Date(start);
      const output = [];

      while (cursor <= end) {
        const key = formatDateKey(cursor);
        output.push({ date: key, views: counts.get(key) ?? 0 });
        cursor.setDate(cursor.getDate() + 1);
      }

      return output;
    }

    const events = (await this.repository.listByPageId(pageId))
      .filter((event) => isEventInDateRange(event.viewedAt, new Date(start), new Date(end)))
      .sort((a, b) => a.viewedAt.localeCompare(b.viewedAt));

    return this.buildBucketedSeries(events, start, end, granularity);
  }

  private async getHourlyOverview(pageId: string, slug = ''): Promise<PageAnalyticsOverview> {
    const { start, end } = resolveRolling24HourRange();
    const totalViews = await this.repository.countInRange(pageId, start, end);
    const countryRows = await this.repository.aggregateCountries(pageId, start, end);
    const deviceRows = await this.repository.aggregateDevices(pageId, start, end);
    const sqlSeries = await this.repository.aggregateHourlySeries(pageId, start, end);
    const counts = new Map(sqlSeries.map((item) => [item.date, item.views]));
    const rangeEnd = floorToHour(end);
    const rangeStart = new Date(rangeEnd);
    rangeStart.setHours(rangeStart.getHours() - 23);
    const currentHourKey = formatHourKey(rangeEnd);
    const cursor = new Date(rangeStart);
    const series = [];

    while (cursor <= rangeEnd) {
      const key = formatHourKey(cursor);
      series.push({
        date: key,
        views: counts.get(key) ?? 0,
        partial: key === currentHourKey,
      });
      cursor.setHours(cursor.getHours() + 1);
    }

    const latestSlug = await this.repository.getLatestSlug(pageId);

    return {
      pageId,
      slug: slug || latestSlug,
      totalViews,
      startDate: formatHourKey(floorToHour(start)),
      endDate: formatHourKey(floorToHour(end)),
      seriesGranularity: 'hour',
      series,
      countries: countryRows.map((row) => ({
        key: row.key,
        label: getCountryLabel(row.key),
        views: row.views,
      })),
      devices: deviceRows.map((row) => ({
        key: row.key,
        label: getDeviceLabel(row.key as PageViewEvent['device']),
        views: row.views,
      })),
    };
  }

  private buildBucketedSeries(
    events: PageViewEvent[],
    start: Date,
    end: Date,
    granularity: 'day' | 'week' | 'month',
  ) {
    switch (granularity) {
      case 'week':
        return this.buildWeeklySeries(events, start, end);
      case 'month':
        return this.buildMonthlySeries(events, start, end);
      default:
        return this.buildDailySeries(events, start, end);
    }
  }

  private buildDailySeries(events: PageViewEvent[], start: Date, end: Date) {
    const counts = new Map<string, number>();
    const cursor = new Date(start);

    while (cursor <= end) {
      counts.set(formatDateKey(cursor), 0);
      cursor.setDate(cursor.getDate() + 1);
    }

    for (const event of events) {
      const key = formatDateKey(new Date(event.viewedAt));
      if (counts.has(key)) {
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }

    return Array.from(counts.entries()).map(([date, views]) => ({ date, views }));
  }

  private buildWeeklySeries(events: PageViewEvent[], start: Date, end: Date) {
    const counts = new Map<string, number>();
    let cursor = getWeekStart(start);
    const lastWeek = getWeekStart(end);

    while (cursor <= lastWeek) {
      counts.set(formatDateKey(cursor), 0);
      cursor.setDate(cursor.getDate() + 7);
    }

    for (const event of events) {
      const key = formatDateKey(getWeekStart(new Date(event.viewedAt)));
      if (counts.has(key)) {
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }

    return Array.from(counts.entries()).map(([date, views]) => ({ date, views }));
  }

  private buildMonthlySeries(events: PageViewEvent[], start: Date, end: Date) {
    const counts = new Map<string, number>();
    const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    const lastMonth = new Date(end.getFullYear(), end.getMonth(), 1);

    while (cursor <= lastMonth) {
      counts.set(formatMonthKey(cursor), 0);
      cursor.setMonth(cursor.getMonth() + 1);
    }

    for (const event of events) {
      const key = formatMonthKey(new Date(event.viewedAt));
      if (counts.has(key)) {
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }

    return Array.from(counts.entries()).map(([date, views]) => ({ date, views }));
  }

  private buildHourlySeries(events: PageViewEvent[], start: Date, end: Date) {
    const rangeEnd = floorToHour(end);
    const rangeStart = new Date(rangeEnd);
    rangeStart.setHours(rangeStart.getHours() - 23);
    const currentHourKey = formatHourKey(rangeEnd);
    const counts = new Map<string, number>();
    const cursor = new Date(rangeStart);

    while (cursor <= rangeEnd) {
      counts.set(formatHourKey(cursor), 0);
      cursor.setHours(cursor.getHours() + 1);
    }

    for (const event of events) {
      const viewedAt = new Date(event.viewedAt);
      if (viewedAt < start || viewedAt > end) {
        continue;
      }

      const key = formatHourKey(floorToHour(viewedAt));
      if (counts.has(key)) {
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }

    return Array.from(counts.entries()).map(([date, views]) => ({
      date,
      views,
      partial: date === currentHourKey,
    }));
  }

  private buildCountryBreakdown(events: PageViewEvent[]) {
    const counts = new Map<string, number>();
    for (const event of events) {
      const code = event.countryCode || 'ZZ';
      counts.set(code, (counts.get(code) ?? 0) + 1);
    }

    return Array.from(counts.entries())
      .map(([key, views]) => ({
        key,
        label: getCountryLabel(key),
        views,
      }))
      .sort((a, b) => b.views - a.views);
  }

  private buildDeviceBreakdown(events: PageViewEvent[]) {
    const counts = new Map<string, number>();
    for (const event of events) {
      const key = event.device || 'unknown';
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    return Array.from(counts.entries())
      .map(([key, views]) => ({
        key,
        label: getDeviceLabel(key as PageViewEvent['device']),
        views,
      }))
      .sort((a, b) => b.views - a.views);
  }
}
