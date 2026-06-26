export type PlatformInsightsChatMessage = {
    role: 'user' | 'assistant';
    content: string;
};
export type PlatformInsightsChatInput = {
    pageId: string;
    slug?: string;
    startDate?: string;
    endDate?: string;
    granularity?: 'hour' | 'day' | 'week' | 'month';
    messages: PlatformInsightsChatMessage[];
};
export type PlatformInsightsContext = {
    platform: {
        name: string;
        description: string;
    };
    landingPage: {
        id: string;
        slug: string;
        title: string;
        status: string;
        blockSummary: Array<{
            type: string;
            visible: boolean;
            label: string;
        }>;
    };
    dateRange: {
        startDate: string;
        endDate: string;
        granularity: string;
    };
    pageViews: {
        totalViews: number;
        seriesGranularity: string;
        series: Array<{
            date: string;
            views: number;
        }>;
        countries: Array<{
            label: string;
            views: number;
        }>;
        devices: Array<{
            label: string;
            views: number;
        }>;
    };
    contactForms: {
        formCount: number;
        totalSubmissions: number;
        forms: Array<{
            formId: string;
            name: string;
            fieldCount: number;
            submissionCount: number;
        }>;
        recentSubmissions: Array<{
            formId: string;
            submittedAt: string;
            fields: Record<string, unknown>;
        }>;
    };
    conversionHints: {
        viewsToSubmissionRate: number | null;
        hasContactForm: boolean;
    };
};
