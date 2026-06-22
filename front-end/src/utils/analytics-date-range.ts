export const ANALYTICS_MAX_RANGE_DAYS = 730;

export type AnalyticsQuickPreset = '24h' | '7d' | '28d' | '3m';
export type AnalyticsMorePreset = '6m' | '12m' | '16m' | 'custom';
export type AnalyticsDateRangePreset = AnalyticsQuickPreset | AnalyticsMorePreset;

export type AnalyticsDateRange = {
  preset: AnalyticsDateRangePreset;
  startDate: string;
  endDate: string;
};

export const ANALYTICS_QUICK_PRESETS: AnalyticsQuickPreset[] = ['24h', '7d', '28d', '3m'];
export const ANALYTICS_MORE_PRESETS: Exclude<AnalyticsMorePreset, 'custom'>[] = ['6m', '12m', '16m'];

export function isMoreAnalyticsPreset(preset: AnalyticsDateRangePreset): preset is AnalyticsMorePreset {
  return preset === '6m' || preset === '12m' || preset === '16m' || preset === 'custom';
}

export function formatAnalyticsDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseAnalyticsDateKey(dateKey: string): Date | null {
  const [year, month, day] = dateKey.split('-').map(Number);
  if (!year || !month || !day) {
    return null;
  }

  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }

  date.setHours(0, 0, 0, 0);
  return date;
}

export function getTodayDateKey(): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return formatAnalyticsDateKey(today);
}

function subtractMonths(from: Date, months: number): Date {
  const result = new Date(from);
  const day = result.getDate();
  result.setMonth(result.getMonth() - months);
  if (result.getDate() !== day) {
    result.setDate(0);
  }
  result.setHours(0, 0, 0, 0);
  return result;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function daysBetween(start: Date, end: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((end.getTime() - start.getTime()) / msPerDay);
}

export function getPresetDateRange(
  preset: Exclude<AnalyticsDateRangePreset, 'custom'>,
): Pick<AnalyticsDateRange, 'startDate' | 'endDate'> {
  const end = new Date();
  end.setHours(0, 0, 0, 0);

  let start: Date;
  switch (preset) {
    case '24h':
      start = new Date(end);
      break;
    case '7d':
      start = addDays(end, -6);
      break;
    case '28d':
      start = addDays(end, -27);
      break;
    case '3m':
      start = subtractMonths(end, 3);
      break;
    case '6m':
      start = subtractMonths(end, 6);
      break;
    case '12m':
      start = subtractMonths(end, 12);
      break;
    case '16m':
      start = subtractMonths(end, 16);
      break;
    default:
      start = subtractMonths(end, 3);
  }

  return {
    startDate: formatAnalyticsDateKey(start),
    endDate: formatAnalyticsDateKey(end),
  };
}

export function createDefaultAnalyticsDateRange(): AnalyticsDateRange {
  const preset: AnalyticsQuickPreset = '3m';
  return {
    preset,
    ...getPresetDateRange(preset),
  };
}

export function normalizeAnalyticsDateRange(
  startDate: string,
  endDate: string,
  changedField: 'start' | 'end',
): Pick<AnalyticsDateRange, 'startDate' | 'endDate'> {
  const start = parseAnalyticsDateKey(startDate);
  const end = parseAnalyticsDateKey(endDate);
  if (!start || !end) {
    return { startDate, endDate };
  }

  let nextStart = start;
  let nextEnd = end;

  if (changedField === 'start' && nextStart > nextEnd) {
    nextEnd = new Date(nextStart);
  } else if (changedField === 'end' && nextEnd < nextStart) {
    nextStart = new Date(nextEnd);
  }

  if (daysBetween(nextStart, nextEnd) > ANALYTICS_MAX_RANGE_DAYS) {
    if (changedField === 'start') {
      nextEnd = addDays(nextStart, ANALYTICS_MAX_RANGE_DAYS);
    } else {
      nextStart = addDays(nextEnd, -ANALYTICS_MAX_RANGE_DAYS);
    }
  }

  return {
    startDate: formatAnalyticsDateKey(nextStart),
    endDate: formatAnalyticsDateKey(nextEnd),
  };
}

export function isValidAnalyticsDateRange(startDate: string, endDate: string): boolean {
  const start = parseAnalyticsDateKey(startDate);
  const end = parseAnalyticsDateKey(endDate);
  if (!start || !end || start > end) {
    return false;
  }

  return daysBetween(start, end) <= ANALYTICS_MAX_RANGE_DAYS;
}
