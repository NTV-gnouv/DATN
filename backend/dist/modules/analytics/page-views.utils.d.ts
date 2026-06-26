import type { PageViewDevice } from './page-views.types';
export declare function isPrivateIp(ip: string): boolean;
export declare function resolveClientIp(headers: Record<string, string | string[] | undefined>, fallbackIp?: string): string;
export declare function resolveCountryCodeFromIp(ip: string): string | undefined;
export declare function resolveCountryCode(headers: Record<string, string | string[] | undefined>, options?: {
    clientIp?: string;
    hintedCountryCode?: unknown;
}): string;
export declare function resolveDeviceType(userAgent: string): PageViewDevice;
export declare function getCountryLabel(code: string, locale?: string): string;
export declare function getDeviceLabel(device: PageViewDevice): string;
export declare function formatDateKey(date: Date): string;
export declare const MAX_ANALYTICS_RANGE_DAYS = 730;
export declare function parseDateKey(dateKey: string): Date | null;
export declare function daysBetweenDates(start: Date, end: Date): number;
export declare function resolveAnalyticsDateRange(startDate?: string, endDate?: string): {
    start: Date;
    end: Date;
} | null;
export declare function isEventInDateRange(eventViewedAt: string, start: Date, end: Date): boolean;
export declare function formatHourKey(date: Date): string;
export declare function normalizeSqlDailyBucket(value: unknown): string;
export declare function normalizeSqlHourlyBucket(value: unknown): string;
export declare function floorToHour(date: Date): Date;
export declare function resolveRolling24HourRange(): {
    start: Date;
    end: Date;
};
export declare function resolveSeriesGranularityForDayRange(start: Date, end: Date): 'day' | 'week' | 'month';
export declare function getWeekStart(date: Date): Date;
export declare function formatMonthKey(date: Date): string;
export declare function parseMonthKey(monthKey: string): Date | null;
