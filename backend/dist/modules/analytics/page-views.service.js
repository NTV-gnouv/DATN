"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageViewsService = void 0;
const common_1 = require("@nestjs/common");
const page_views_repository_1 = require("./page-views.repository");
const page_views_utils_1 = require("./page-views.utils");
let PageViewsService = class PageViewsService {
    constructor(repository) {
        this.repository = repository;
    }
    async recordView(input) {
        const pageId = String(input.pageId ?? '').trim();
        const slug = String(input.slug ?? '').trim();
        if (!pageId || !slug) {
            return { ok: false };
        }
        const clientIp = (0, page_views_utils_1.resolveClientIp)(input.headers, input.clientIp ?? '');
        const event = {
            id: `pv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            pageId,
            slug,
            viewedAt: new Date().toISOString(),
            countryCode: (0, page_views_utils_1.resolveCountryCode)(input.headers, {
                clientIp,
                hintedCountryCode: input.countryCodeHint,
            }),
            device: (0, page_views_utils_1.resolveDeviceType)(input.userAgent),
            userAgent: input.userAgent,
            referrer: input.referrer,
        };
        await this.repository.save(event);
        return { ok: true, id: event.id };
    }
    async getOverview(pageId, slug = '', startDate, endDate, granularity = 'day') {
        if (granularity === 'hour') {
            return this.getHourlyOverview(pageId, slug);
        }
        const range = (0, page_views_utils_1.resolveAnalyticsDateRange)(startDate, endDate);
        if (!range) {
            throw new common_1.BadRequestException('Phạm vi ngày không hợp lệ. Ngày bắt đầu phải trước ngày kết thúc và tối đa 2 năm.');
        }
        const rangeStart = new Date(range.start);
        rangeStart.setHours(0, 0, 0, 0);
        const rangeEnd = new Date(range.end);
        rangeEnd.setHours(23, 59, 59, 999);
        const seriesGranularity = (0, page_views_utils_1.resolveSeriesGranularityForDayRange)(range.start, range.end);
        const totalViews = await this.repository.countInRange(pageId, rangeStart, rangeEnd);
        const countryRows = await this.repository.aggregateCountries(pageId, rangeStart, rangeEnd);
        const deviceRows = await this.repository.aggregateDevices(pageId, rangeStart, rangeEnd);
        const series = await this.buildSqlBucketedSeries(pageId, range.start, range.end, seriesGranularity);
        const countries = countryRows.map((row) => ({
            key: row.key,
            label: (0, page_views_utils_1.getCountryLabel)(row.key),
            views: row.views,
        }));
        const devices = deviceRows.map((row) => ({
            key: row.key,
            label: (0, page_views_utils_1.getDeviceLabel)(row.key),
            views: row.views,
        }));
        const latestSlug = await this.repository.getLatestSlug(pageId);
        return {
            pageId,
            slug: slug || latestSlug,
            totalViews,
            startDate: (0, page_views_utils_1.formatDateKey)(range.start),
            endDate: (0, page_views_utils_1.formatDateKey)(range.end),
            seriesGranularity,
            series,
            countries,
            devices,
        };
    }
    async buildSqlBucketedSeries(pageId, start, end, granularity) {
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
                const key = (0, page_views_utils_1.formatDateKey)(cursor);
                output.push({ date: key, views: counts.get(key) ?? 0 });
                cursor.setDate(cursor.getDate() + 1);
            }
            return output;
        }
        const rangeStart = new Date(start);
        rangeStart.setHours(0, 0, 0, 0);
        const rangeEnd = new Date(end);
        rangeEnd.setHours(23, 59, 59, 999);
        const events = (await this.repository.listByPageId(pageId))
            .filter((event) => (0, page_views_utils_1.isEventInDateRange)(event.viewedAt, rangeStart, rangeEnd))
            .sort((a, b) => a.viewedAt.localeCompare(b.viewedAt));
        return this.buildBucketedSeries(events, start, end, granularity);
    }
    async getHourlyOverview(pageId, slug = '') {
        const { start, end } = (0, page_views_utils_1.resolveRolling24HourRange)();
        const totalViews = await this.repository.countInRange(pageId, start, end);
        const countryRows = await this.repository.aggregateCountries(pageId, start, end);
        const deviceRows = await this.repository.aggregateDevices(pageId, start, end);
        const sqlSeries = await this.repository.aggregateHourlySeries(pageId, start, end);
        const counts = new Map(sqlSeries.map((item) => [item.date, item.views]));
        const rangeEnd = (0, page_views_utils_1.floorToHour)(end);
        const rangeStart = new Date(rangeEnd);
        rangeStart.setHours(rangeStart.getHours() - 23);
        const currentHourKey = (0, page_views_utils_1.formatHourKey)(rangeEnd);
        const cursor = new Date(rangeStart);
        const series = [];
        while (cursor <= rangeEnd) {
            const key = (0, page_views_utils_1.formatHourKey)(cursor);
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
            startDate: (0, page_views_utils_1.formatHourKey)((0, page_views_utils_1.floorToHour)(start)),
            endDate: (0, page_views_utils_1.formatHourKey)((0, page_views_utils_1.floorToHour)(end)),
            seriesGranularity: 'hour',
            series,
            countries: countryRows.map((row) => ({
                key: row.key,
                label: (0, page_views_utils_1.getCountryLabel)(row.key),
                views: row.views,
            })),
            devices: deviceRows.map((row) => ({
                key: row.key,
                label: (0, page_views_utils_1.getDeviceLabel)(row.key),
                views: row.views,
            })),
        };
    }
    buildBucketedSeries(events, start, end, granularity) {
        switch (granularity) {
            case 'week':
                return this.buildWeeklySeries(events, start, end);
            case 'month':
                return this.buildMonthlySeries(events, start, end);
            default:
                return this.buildDailySeries(events, start, end);
        }
    }
    buildDailySeries(events, start, end) {
        const counts = new Map();
        const cursor = new Date(start);
        while (cursor <= end) {
            counts.set((0, page_views_utils_1.formatDateKey)(cursor), 0);
            cursor.setDate(cursor.getDate() + 1);
        }
        for (const event of events) {
            const key = (0, page_views_utils_1.formatDateKey)(new Date(event.viewedAt));
            if (counts.has(key)) {
                counts.set(key, (counts.get(key) ?? 0) + 1);
            }
        }
        return Array.from(counts.entries()).map(([date, views]) => ({ date, views }));
    }
    buildWeeklySeries(events, start, end) {
        const counts = new Map();
        let cursor = (0, page_views_utils_1.getWeekStart)(start);
        const lastWeek = (0, page_views_utils_1.getWeekStart)(end);
        while (cursor <= lastWeek) {
            counts.set((0, page_views_utils_1.formatDateKey)(cursor), 0);
            cursor.setDate(cursor.getDate() + 7);
        }
        for (const event of events) {
            const key = (0, page_views_utils_1.formatDateKey)((0, page_views_utils_1.getWeekStart)(new Date(event.viewedAt)));
            if (counts.has(key)) {
                counts.set(key, (counts.get(key) ?? 0) + 1);
            }
        }
        return Array.from(counts.entries()).map(([date, views]) => ({ date, views }));
    }
    buildMonthlySeries(events, start, end) {
        const counts = new Map();
        const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
        const lastMonth = new Date(end.getFullYear(), end.getMonth(), 1);
        while (cursor <= lastMonth) {
            counts.set((0, page_views_utils_1.formatMonthKey)(cursor), 0);
            cursor.setMonth(cursor.getMonth() + 1);
        }
        for (const event of events) {
            const key = (0, page_views_utils_1.formatMonthKey)(new Date(event.viewedAt));
            if (counts.has(key)) {
                counts.set(key, (counts.get(key) ?? 0) + 1);
            }
        }
        return Array.from(counts.entries()).map(([date, views]) => ({ date, views }));
    }
    buildHourlySeries(events, start, end) {
        const rangeEnd = (0, page_views_utils_1.floorToHour)(end);
        const rangeStart = new Date(rangeEnd);
        rangeStart.setHours(rangeStart.getHours() - 23);
        const currentHourKey = (0, page_views_utils_1.formatHourKey)(rangeEnd);
        const counts = new Map();
        const cursor = new Date(rangeStart);
        while (cursor <= rangeEnd) {
            counts.set((0, page_views_utils_1.formatHourKey)(cursor), 0);
            cursor.setHours(cursor.getHours() + 1);
        }
        for (const event of events) {
            const viewedAt = new Date(event.viewedAt);
            if (viewedAt < start || viewedAt > end) {
                continue;
            }
            const key = (0, page_views_utils_1.formatHourKey)((0, page_views_utils_1.floorToHour)(viewedAt));
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
    buildCountryBreakdown(events) {
        const counts = new Map();
        for (const event of events) {
            const code = event.countryCode || 'ZZ';
            counts.set(code, (counts.get(code) ?? 0) + 1);
        }
        return Array.from(counts.entries())
            .map(([key, views]) => ({
            key,
            label: (0, page_views_utils_1.getCountryLabel)(key),
            views,
        }))
            .sort((a, b) => b.views - a.views);
    }
    buildDeviceBreakdown(events) {
        const counts = new Map();
        for (const event of events) {
            const key = event.device || 'unknown';
            counts.set(key, (counts.get(key) ?? 0) + 1);
        }
        return Array.from(counts.entries())
            .map(([key, views]) => ({
            key,
            label: (0, page_views_utils_1.getDeviceLabel)(key),
            views,
        }))
            .sort((a, b) => b.views - a.views);
    }
};
exports.PageViewsService = PageViewsService;
exports.PageViewsService = PageViewsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [page_views_repository_1.PageViewsRepository])
], PageViewsService);
