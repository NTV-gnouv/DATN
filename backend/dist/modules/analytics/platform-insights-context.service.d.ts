import { ContactFormsService } from '@/modules/contact-forms/contact-forms.service';
import { PagesService } from '@/modules/pages/pages.service';
import type { PlatformInsightsContext } from './platform-insights.types';
import { PageViewsService } from './page-views.service';
export declare class PlatformInsightsContextService {
    private readonly pagesService;
    private readonly pageViewsService;
    private readonly contactFormsService;
    constructor(pagesService: PagesService, pageViewsService: PageViewsService, contactFormsService: ContactFormsService);
    buildContext(input: {
        pageId: string;
        slug?: string;
        startDate?: string;
        endDate?: string;
        granularity?: 'hour' | 'day' | 'week' | 'month';
    }): Promise<PlatformInsightsContext>;
}
