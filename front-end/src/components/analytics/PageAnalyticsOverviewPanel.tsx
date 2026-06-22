import { useMemo, useState } from 'react';

import type { PageAnalyticsOverview, PageViewSeriesGranularity } from '@/services/page-analytics.service';
import { buildChartAxisLabels, getChartBottomPadding } from '@/utils/chart-axis.utils';

type PageAnalyticsOverviewPanelProps = {
  data: PageAnalyticsOverview;
};

type BreakdownTab = 'countries' | 'devices';

function formatNumber(value: number): string {
  return new Intl.NumberFormat('vi-VN').format(value);
}

function getGranularityHint(granularity: PageViewSeriesGranularity): string | null {
  switch (granularity) {
    case 'hour':
      return ' trong 24 giờ qua';
    case 'week':
      return ' theo tuần';
    case 'month':
      return ' theo tháng';
    default:
      return null;
  }
}

function PageViewsLineChart({
  series,
  granularity,
}: {
  series: PageAnalyticsOverview['series'];
  granularity: PageViewSeriesGranularity;
}) {
  const width = 720;
  const paddingX = 28;
  const paddingY = 18;
  const innerWidth = width - paddingX * 2;

  const axisLabels = useMemo(
    () => buildChartAxisLabels(series, granularity, innerWidth),
    [granularity, innerWidth, series],
  );
  const paddingBottom = getChartBottomPadding(granularity, axisLabels);
  const height = paddingY + 132 + paddingBottom;
  const innerHeight = height - paddingY - paddingBottom;

  const maxViews = Math.max(1, ...series.map((point) => point.views));
  const yTicks = [0, Math.ceil(maxViews / 3), Math.ceil((maxViews * 2) / 3), maxViews].filter(
    (value, index, all) => all.indexOf(value) === index,
  );

  const points = series.map((point, index) => {
    const x = paddingX + (series.length <= 1 ? innerWidth / 2 : (index / (series.length - 1)) * innerWidth);
    const y = paddingY + innerHeight - (point.views / maxViews) * innerHeight;
    return { x, y, ...point };
  });

  const partialStartIndex = series.findIndex((point) => point.partial);
  const solidPoints = partialStartIndex >= 0 ? points.slice(0, partialStartIndex + 1) : points;
  const partialPoints = partialStartIndex >= 0 ? points.slice(partialStartIndex) : [];
  const solidPolyline = solidPoints.map((point) => `${point.x},${point.y}`).join(' ');
  const partialPolyline = partialPoints.map((point) => `${point.x},${point.y}`).join(' ');

  return (
    <div className="page-analytics-chart-wrap">
      <svg className="page-analytics-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Biểu đồ lượt xem theo thời gian">
        {yTicks.map((tick) => {
          const y = paddingY + innerHeight - (tick / maxViews) * innerHeight;
          return (
            <g key={tick}>
              <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} className="page-analytics-chart-grid" />
              <text x={paddingX - 6} y={y + 4} className="page-analytics-chart-axis" textAnchor="end">
                {tick}
              </text>
            </g>
          );
        })}

        <line x1={paddingX} y1={paddingY + innerHeight} x2={width - paddingX} y2={paddingY + innerHeight} className="page-analytics-chart-axis-line" />

        {solidPoints.length > 0 ? (
          <>
            <polyline points={solidPolyline} className="page-analytics-chart-line" fill="none" />
            {solidPoints.map((point) => (
              <circle key={point.date} cx={point.x} cy={point.y} r={3} className="page-analytics-chart-dot" />
            ))}
          </>
        ) : null}

        {partialPoints.length > 1 ? (
          <polyline points={partialPolyline} className="page-analytics-chart-line is-partial" fill="none" />
        ) : null}

        {axisLabels.map((label) => {
          const point = points[label.index];
          if (!point) {
            return null;
          }

          const labelY = height - (label.secondary ? 18 : 8);

          if (label.secondary) {
            return (
              <text
                key={`${point.date}-${label.index}`}
                x={point.x}
                y={labelY}
                className="page-analytics-chart-axis"
                textAnchor={label.anchor}
              >
                <tspan x={point.x} dy="0">
                  {label.primary}
                </tspan>
                <tspan x={point.x} dy="12" className="page-analytics-chart-axis-date">
                  {label.secondary}
                </tspan>
              </text>
            );
          }

          return (
            <text
              key={`${point.date}-${label.index}`}
              x={point.x}
              y={labelY}
              className="page-analytics-chart-axis"
              textAnchor={label.anchor}
            >
              {label.primary}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

function BreakdownTable({
  rows,
  nameHeader,
}: {
  rows: PageAnalyticsOverview['countries'];
  nameHeader: string;
}) {
  if (rows.length === 0) {
    return <p className="muted-copy page-analytics-empty">Chưa có dữ liệu.</p>;
  }

  return (
    <div className="page-analytics-table-wrap">
      <table className="page-analytics-table">
        <thead>
          <tr>
            <th>{nameHeader}</th>
            <th className="is-metric is-primary">Lượt xem</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key}>
              <td>{row.label}</td>
              <td className="is-metric is-primary">{formatNumber(row.views)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PageAnalyticsOverviewPanel({ data }: PageAnalyticsOverviewPanelProps) {
  const [tab, setTab] = useState<BreakdownTab>('countries');
  const rows = tab === 'countries' ? data.countries : data.devices;
  const nameHeader = tab === 'countries' ? 'Quốc gia' : 'Thiết bị';
  const granularity = data.seriesGranularity ?? 'day';
  const granularityHint = getGranularityHint(granularity);

  return (
    <div className="page-analytics-overview">
      <div className="page-analytics-performance-card">
        <div className="page-analytics-performance-head">
          <h3>Hiệu suất</h3>
        </div>
        <p className="page-analytics-legend">
          <span className="page-analytics-legend-line" aria-hidden="true" />
          Tổng {formatNumber(data.totalViews)} lượt xem trang
          {granularityHint}
        </p>
        <PageViewsLineChart series={data.series} granularity={granularity} />
      </div>

      <div className="page-analytics-breakdown-card">
        <div className="page-analytics-tabs" role="tablist" aria-label="Phân tích theo nhóm">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'countries'}
            className={`page-analytics-tab${tab === 'countries' ? ' is-active' : ''}`}
            onClick={() => setTab('countries')}
          >
            Quốc gia
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'devices'}
            className={`page-analytics-tab${tab === 'devices' ? ' is-active' : ''}`}
            onClick={() => setTab('devices')}
          >
            Thiết bị
          </button>
        </div>

        <BreakdownTable rows={rows} nameHeader={nameHeader} />
      </div>
    </div>
  );
}
