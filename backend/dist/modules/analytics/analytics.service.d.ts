import { AnalyticsRepository } from './analytics.repository';
export declare class AnalyticsService {
    private readonly analyticsRepository;
    constructor(analyticsRepository: AnalyticsRepository);
    list(): Promise<never[]>;
    get(id: string): Promise<{
        id: string;
    }>;
    create(payload: Record<string, unknown>): Promise<{
        id: string;
    }>;
    update(id: string, payload: Record<string, unknown>): Promise<{
        id: string;
    }>;
}
