import { apiRequest } from './api';
import { resolveClientCountryCode } from '@/utils/client-country';

export type PageViewSeriesPoint = {
  date: string;
  views: number;
  partial?: boolean;
};

export type PageViewSeriesGranularity = 'hour' | 'day' | 'week' | 'month';

export type PageViewBreakdownRow = {
  key: string;
  label: string;
  views: number;
};

export type PageAnalyticsOverview = {
  pageId: string;
  slug: string;
  totalViews: number;
  startDate: string;
  endDate: string;
  seriesGranularity: PageViewSeriesGranularity;
  series: PageViewSeriesPoint[];
  countries: PageViewBreakdownRow[];
  devices: PageViewBreakdownRow[];
};

export async function trackPageView(pageId: string, slug: string) {
  const countryCode = await resolveClientCountryCode();

  return apiRequest<{ ok: boolean; id?: string }>('/analytics/page-views', {
    method: 'POST',
    body: JSON.stringify({
      pageId,
      slug,
      ...(countryCode ? { countryCode } : {}),
    }),
  });
}

export function getPageAnalyticsOverview(
  pageId: string,
  options?: {
    slug?: string;
    startDate?: string;
    endDate?: string;
    granularity?: PageViewSeriesGranularity;
  },
) {
  const params = new URLSearchParams({ pageId });
  if (options?.slug) {
    params.set('slug', options.slug);
  }
  if (options?.granularity) {
    params.set('granularity', options.granularity);
  }
  if (options?.startDate) {
    params.set('startDate', options.startDate);
  }
  if (options?.endDate) {
    params.set('endDate', options.endDate);
  }
  return apiRequest<PageAnalyticsOverview>(`/analytics/page-views/overview?${params.toString()}`);
}
