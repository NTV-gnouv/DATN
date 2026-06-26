import type { Request } from 'express';
import { AnalyticsService } from './analytics.service';
import { PageViewsService } from './page-views.service';
import { PlatformInsightsChatService } from './platform-insights-chat.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    private readonly pageViewsService;
    private readonly platformInsightsChatService;
    constructor(analyticsService: AnalyticsService, pageViewsService: PageViewsService, platformInsightsChatService: PlatformInsightsChatService);
    trackPageView(body: Record<string, unknown>, request: Request): Promise<{
        ok: boolean;
        id?: undefined;
    } | {
        ok: boolean;
        id: string;
    }>;
    getPageViewsOverview(pageId: string, slug?: string, startDate?: string, endDate?: string, granularity?: string): Promise<import("./page-views.types").PageAnalyticsOverview>;
    chatPlatformInsights(body: Record<string, unknown>): Promise<{
        reply: string;
        grounded: boolean;
        usedModel: string;
    }>;
    list(): Promise<never[]>;
    get(id: string): Promise<{
        id: string;
    }>;
    create(body: Record<string, unknown>): Promise<{
        id: string;
    }>;
    update(id: string, body: Record<string, unknown>): Promise<{
        id: string;
    }>;
}
