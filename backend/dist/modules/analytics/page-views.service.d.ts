import { PageViewsRepository } from './page-views.repository';
import type { PageAnalyticsOverview, PageViewSeriesGranularity } from './page-views.types';
export declare class PageViewsService {
    private readonly repository;
    constructor(repository: PageViewsRepository);
    recordView(input: {
        pageId: string;
        slug: string;
        userAgent: string;
        referrer: string;
        clientIp?: string;
        countryCodeHint?: unknown;
        headers: Record<string, string | string[] | undefined>;
    }): Promise<{
        ok: boolean;
        id?: undefined;
    } | {
        ok: boolean;
        id: string;
    }>;
    getOverview(pageId: string, slug?: string, startDate?: string, endDate?: string, granularity?: PageViewSeriesGranularity): Promise<PageAnalyticsOverview>;
    private buildSqlBucketedSeries;
    private getHourlyOverview;
    private buildBucketedSeries;
    private buildDailySeries;
    private buildWeeklySeries;
    private buildMonthlySeries;
    private buildHourlySeries;
    private buildCountryBreakdown;
    private buildDeviceBreakdown;
}
