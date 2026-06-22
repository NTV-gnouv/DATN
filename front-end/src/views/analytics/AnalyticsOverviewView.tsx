import { useEffect, useState } from 'react';

import { PageAnalyticsDateRangeFilter } from '@/components/analytics/PageAnalyticsDateRangeFilter';
import { PageAnalyticsOverviewPanel } from '@/components/analytics/PageAnalyticsOverviewPanel';
import { PlatformInsightsChat } from '@/components/analytics/PlatformInsightsChat';
import { Card } from '@/components/ui/Card';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardPage } from '@/hooks/useDashboardPage';
import { getPageAnalyticsOverview, type PageAnalyticsOverview } from '@/services/page-analytics.service';
import {
  createDefaultAnalyticsDateRange,
  isValidAnalyticsDateRange,
  type AnalyticsDateRange,
} from '@/utils/analytics-date-range';

export default function AnalyticsOverviewView() {
  const { signOut } = useAuth();
  const { page, loading } = useDashboardPage();
  const [dateRange, setDateRange] = useState<AnalyticsDateRange>(() => createDefaultAnalyticsDateRange());
  const [overview, setOverview] = useState<PageAnalyticsOverview | null>(null);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!page?.id || loading) {
      return;
    }

    if (dateRange.preset !== '24h' && !isValidAnalyticsDateRange(dateRange.startDate, dateRange.endDate)) {
      return;
    }

    let cancelled = false;
    setFetching(true);
    setError('');

    void (async () => {
      try {
        const data = await getPageAnalyticsOverview(page.id, {
          slug: page.slug,
          granularity: dateRange.preset === '24h' ? 'hour' : 'day',
          startDate: dateRange.preset === '24h' ? undefined : dateRange.startDate,
          endDate: dateRange.preset === '24h' ? undefined : dateRange.endDate,
        });
        if (!cancelled) {
          setOverview(data);
        }
      } catch (caughtError) {
        if (!cancelled) {
          setError(caughtError instanceof Error ? caughtError.message : 'Không thể tải analytics');
          setOverview(null);
        }
      } finally {
        if (!cancelled) {
          setFetching(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [dateRange.endDate, dateRange.preset, dateRange.startDate, loading, page?.id, page?.slug]);

  return (
    <DashboardShell onSignOut={signOut}>
      <div className="analytics-page analytics-page-wide">
        <header className="analytics-page-header">
          <p className="eyebrow">Analytics</p>
          <h2>Tổng quan landing page</h2>
          <p className="muted-copy">
            Theo dõi lượt xem trang, quốc gia và thiết bị truy cập
            {page?.slug ? ` cho /${page.slug}` : ''}.
          </p>
        </header>

        <div className="analytics-overview-layout">
          <Card className="analytics-detail-card analytics-overview-main">
            <PageAnalyticsDateRangeFilter value={dateRange} onChange={setDateRange} />

            {loading || fetching ? <p className="muted-copy">Đang tải dữ liệu...</p> : null}
            {error ? <p className="field-error">{error}</p> : null}
            {!loading && !fetching && overview ? <PageAnalyticsOverviewPanel data={overview} /> : null}
            {!loading && !fetching && !overview && !error && isValidAnalyticsDateRange(dateRange.startDate, dateRange.endDate) ? (
              <p className="muted-copy">Chưa có dữ liệu lượt xem. Hãy mở trang public để bắt đầu ghi nhận.</p>
            ) : null}
          </Card>

          <Card className="analytics-detail-card analytics-overview-chat-card">
            <PlatformInsightsChat
              key={`${page?.id ?? 'page'}-${dateRange.preset}-${dateRange.startDate}-${dateRange.endDate}`}
              pageId={page?.id}
              slug={page?.slug}
              dateRange={dateRange}
              disabled={loading || fetching}
            />
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
