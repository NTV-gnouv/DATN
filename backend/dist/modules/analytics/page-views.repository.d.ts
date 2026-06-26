import { DatabaseService } from '@/core/database/database.service';
import type { PageViewEvent } from './page-views.types';
export declare class PageViewsRepository {
    private readonly databaseService;
    constructor(databaseService: DatabaseService);
    private mapRow;
    private toMysqlDateTime;
    save(event: PageViewEvent): Promise<PageViewEvent>;
    listByPageId(pageId: string): Promise<PageViewEvent[]>;
    countInRange(pageId: string, start: Date, end: Date): Promise<number>;
    aggregateCountries(pageId: string, start: Date, end: Date): Promise<{
        key: string;
        views: number;
    }[]>;
    aggregateDevices(pageId: string, start: Date, end: Date): Promise<{
        key: string;
        views: number;
    }[]>;
    aggregateDailySeries(pageId: string, start: Date, end: Date): Promise<{
        date: string;
        views: number;
    }[]>;
    aggregateHourlySeries(pageId: string, start: Date, end: Date): Promise<{
        date: string;
        views: number;
    }[]>;
    getLatestSlug(pageId: string): Promise<string>;
}
