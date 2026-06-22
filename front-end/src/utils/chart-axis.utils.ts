import type { PageViewSeriesGranularity } from '@/services/page-analytics.service';

const MIN_LABEL_GAP_PX = 56;

export type ChartAxisLabel = {
  index: number;
  primary: string;
  secondary?: string;
  anchor: 'start' | 'middle' | 'end';
};

function parseDayKey(dateKey: string): { year: number; month: number; day: number } | null {
  const [year, month, day] = dateKey.split('-').map(Number);
  if (!year || !month || !day) {
    return null;
  }
  return { year, month, day };
}

function parseMonthKey(dateKey: string): { year: number; month: number } | null {
  const [year, month] = dateKey.split('-').map(Number);
  if (!year || !month) {
    return null;
  }
  return { year, month };
}

export function pickChartLabelIndexes(seriesLength: number, innerWidth: number): number[] {
  if (seriesLength <= 1) {
    return [0];
  }

  const maxLabels = Math.max(2, Math.floor(innerWidth / MIN_LABEL_GAP_PX));
  if (seriesLength <= maxLabels) {
    return Array.from({ length: seriesLength }, (_, index) => index);
  }

  const step = Math.ceil((seriesLength - 1) / (maxLabels - 1));
  const indexes: number[] = [];
  for (let index = 0; index < seriesLength; index += step) {
    indexes.push(index);
  }

  const lastIndex = seriesLength - 1;
  const previous = indexes[indexes.length - 1] ?? 0;
  const minTailGap = Math.max(2, Math.floor(step * 0.6));
  if (lastIndex - previous >= minTailGap) {
    indexes.push(lastIndex);
  }

  return indexes;
}

function getLabelAnchor(index: number, indexes: number[]): 'start' | 'middle' | 'end' {
  if (index === indexes[0]) {
    return 'start';
  }
  if (index === indexes[indexes.length - 1]) {
    return 'end';
  }
  return 'middle';
}

function formatHourLabel(dateKey: string, showDate: boolean): Pick<ChartAxisLabel, 'primary' | 'secondary'> {
  const hourPart = dateKey.split('T')[1];
  const hour = hourPart?.slice(0, 2) ?? '00';
  const primary = `${hour}:00`;

  if (!showDate) {
    return { primary };
  }

  const datePart = dateKey.split('T')[0];
  const parsed = datePart ? parseDayKey(datePart) : null;
  if (!parsed) {
    return { primary };
  }

  return {
    primary,
    secondary: `${parsed.day}/${parsed.month}/${String(parsed.year).slice(-2)}`,
  };
}

function formatDayLabel(dateKey: string, compact: boolean): Pick<ChartAxisLabel, 'primary' | 'secondary'> {
  const parsed = parseDayKey(dateKey);
  if (!parsed) {
    return { primary: dateKey };
  }

  if (compact) {
    return { primary: `${parsed.day}/${parsed.month}` };
  }

  return {
    primary: `${parsed.day}/${parsed.month}`,
    secondary: String(parsed.year).slice(-2),
  };
}

function formatWeekLabel(dateKey: string, showYear: boolean): Pick<ChartAxisLabel, 'primary' | 'secondary'> {
  const parsed = parseDayKey(dateKey);
  if (!parsed) {
    return { primary: dateKey };
  }

  if (showYear) {
    return {
      primary: `${parsed.day}/${parsed.month}`,
      secondary: String(parsed.year).slice(-2),
    };
  }

  return { primary: `${parsed.day}/${parsed.month}` };
}

function formatMonthLabel(dateKey: string): Pick<ChartAxisLabel, 'primary' | 'secondary'> {
  const parsed = parseMonthKey(dateKey);
  if (!parsed) {
    return { primary: dateKey };
  }

  return {
    primary: `T${parsed.month}/${String(parsed.year).slice(-2)}`,
  };
}

export function buildChartAxisLabels(
  series: Array<{ date: string }>,
  granularity: PageViewSeriesGranularity,
  innerWidth: number,
): ChartAxisLabel[] {
  const indexes = pickChartLabelIndexes(series.length, innerWidth);
  const useCompactDayLabels = series.length > 10;

  return indexes.map((index, labelIndex) => {
    const dateKey = series[index]?.date ?? '';
    const anchor = getLabelAnchor(index, indexes);
    const isFirst = labelIndex === 0;
    const isLast = labelIndex === indexes.length - 1;
    const showExtra = isFirst || isLast;

    if (granularity === 'hour') {
      const hourLabel = formatHourLabel(dateKey, isFirst);
      return { index, ...hourLabel, anchor };
    }

    if (granularity === 'week') {
      const weekLabel = formatWeekLabel(dateKey, isFirst || isLast);
      return { index, ...weekLabel, anchor };
    }

    if (granularity === 'month') {
      const monthLabel = formatMonthLabel(dateKey);
      return { index, ...monthLabel, anchor };
    }

    const dayLabel = formatDayLabel(dateKey, useCompactDayLabels && !showExtra);
    if (!showExtra || useCompactDayLabels) {
      return { index, primary: dayLabel.primary, anchor };
    }

    return {
      index,
      primary: dayLabel.primary,
      secondary: dayLabel.secondary,
      anchor,
    };
  });
}

export function getChartBottomPadding(
  granularity: PageViewSeriesGranularity,
  labels: ChartAxisLabel[],
): number {
  const hasSecondary = labels.some((label) => label.secondary);
  if (granularity === 'hour' || hasSecondary) {
    return 30;
  }
  return 14;
}
