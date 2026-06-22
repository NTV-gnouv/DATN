export type PageViewDevice = 'mobile' | 'tablet' | 'desktop' | 'unknown';

export type PageViewEvent = {
  id: string;
  pageId: string;
  slug: string;
  viewedAt: string;
  countryCode: string;
  device: PageViewDevice;
  userAgent: string;
  referrer: string;
};

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
