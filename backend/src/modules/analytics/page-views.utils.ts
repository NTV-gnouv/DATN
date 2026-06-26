import geoip from 'geoip-lite';

import type { PageViewDevice } from './page-views.types';

function normalizeIp(ip: string): string {
  const trimmed = String(ip ?? '').trim();
  if (trimmed.startsWith('::ffff:')) {
    return trimmed.slice(7);
  }
  return trimmed;
}

export function isPrivateIp(ip: string): boolean {
  const value = normalizeIp(ip);
  if (!value || value === '::1' || value === '127.0.0.1' || value === 'localhost') {
    return true;
  }

  if (value.includes(':')) {
    return value.startsWith('fc') || value.startsWith('fd') || value === '::1';
  }

  const parts = value.split('.').map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) {
    return true;
  }

  const [a, b] = parts;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;

  return false;
}

export function resolveClientIp(
  headers: Record<string, string | string[] | undefined>,
  fallbackIp = '',
): string {
  const candidates = [
    headers['cf-connecting-ip'],
    headers['x-real-ip'],
    headers['x-forwarded-for'],
  ];

  for (const raw of candidates) {
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (!value) {
      continue;
    }

    const first = String(value).split(',')[0]?.trim();
    if (first) {
      return normalizeIp(first);
    }
  }

  return normalizeIp(fallbackIp);
}

function readHeaderCountry(headers: Record<string, string | string[] | undefined>): string | undefined {
  const candidates = [
    headers['cf-ipcountry'],
    headers['x-vercel-ip-country'],
    headers['x-country-code'],
    headers['cloudfront-viewer-country'],
  ];

  for (const raw of candidates) {
    const value = Array.isArray(raw) ? raw[0] : raw;
    const code = String(value ?? '').trim().toUpperCase();
    if (/^[A-Z]{2}$/.test(code) && code !== 'XX') {
      return code;
    }
  }

  return undefined;
}

function readHintedCountry(code: unknown): string | undefined {
  const normalized = String(code ?? '').trim().toUpperCase();
  if (/^[A-Z]{2}$/.test(normalized) && normalized !== 'ZZ' && normalized !== 'XX') {
    return normalized;
  }
  return undefined;
}

export function resolveCountryCodeFromIp(ip: string): string | undefined {
  const clientIp = normalizeIp(ip);
  if (!clientIp || isPrivateIp(clientIp)) {
    return undefined;
  }

  const lookup = geoip.lookup(clientIp);
  const code = String(lookup?.country ?? '').trim().toUpperCase();
  if (/^[A-Z]{2}$/.test(code) && code !== 'XX') {
    return code;
  }

  return undefined;
}

export function resolveCountryCode(
  headers: Record<string, string | string[] | undefined>,
  options?: { clientIp?: string; hintedCountryCode?: unknown },
): string {
  const fromHeader = readHeaderCountry(headers);
  if (fromHeader) {
    return fromHeader;
  }

  const fromServerIp = resolveCountryCodeFromIp(options?.clientIp ?? '');
  if (fromServerIp) {
    return fromServerIp;
  }

  const fromHint = readHintedCountry(options?.hintedCountryCode);
  if (fromHint) {
    return fromHint;
  }

  return 'ZZ';
}

export function resolveDeviceType(userAgent: string): PageViewDevice {
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet|playbook|silk|(android(?!.*mobile))/i.test(ua)) {
    return 'tablet';
  }
  if (/mobi|iphone|ipod|android.*mobile|windows phone/i.test(ua)) {
    return 'mobile';
  }
  if (ua.trim()) {
    return 'desktop';
  }
  return 'unknown';
}

export function getCountryLabel(code: string, locale = 'vi'): string {
  const normalized = String(code ?? '').trim().toUpperCase() || 'ZZ';
  if (normalized === 'ZZ') {
    return 'Không xác định';
  }

  try {
    const display = new Intl.DisplayNames([locale], { type: 'region' });
    return display.of(normalized) ?? normalized;
  } catch {
    return normalized;
  }
}

export function getDeviceLabel(device: PageViewDevice): string {
  switch (device) {
    case 'mobile':
      return 'Di động';
    case 'tablet':
      return 'Máy tính bảng';
    case 'desktop':
      return 'Máy tính';
    default:
      return 'Không xác định';
  }
}

export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const MAX_ANALYTICS_RANGE_DAYS = 730;
const DEFAULT_SERIES_DAYS = 28;

export function parseDateKey(dateKey: string): Date | null {
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

export function daysBetweenDates(start: Date, end: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((end.getTime() - start.getTime()) / msPerDay);
}

export function resolveAnalyticsDateRange(
  startDate?: string,
  endDate?: string,
): { start: Date; end: Date } | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const end = endDate ? parseDateKey(endDate) : today;
  if (!end) {
    return null;
  }

  let start = startDate ? parseDateKey(startDate) : null;
  if (!start) {
    start = new Date(end);
    start.setDate(end.getDate() - (DEFAULT_SERIES_DAYS - 1));
  }

  if (start > end) {
    return null;
  }

  if (daysBetweenDates(start, end) > MAX_ANALYTICS_RANGE_DAYS) {
    return null;
  }

  return { start, end };
}

export function isEventInDateRange(eventViewedAt: string, start: Date, end: Date): boolean {
  const viewedAt = new Date(eventViewedAt);
  return viewedAt >= start && viewedAt <= end;
}

export function formatHourKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  return `${year}-${month}-${day}T${hour}`;
}

export function normalizeSqlDailyBucket(value: unknown): string {
  if (value instanceof Date) {
    return formatDateKey(value);
  }

  const raw = String(value ?? '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return raw;
  }

  const datePart = raw.split(/[ T]/)[0] ?? '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    return datePart;
  }

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? raw : formatDateKey(parsed);
}

export function normalizeSqlHourlyBucket(value: unknown): string {
  if (value instanceof Date) {
    return formatHourKey(floorToHour(value));
  }

  const raw = String(value ?? '').trim();
  const match = raw.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2})/);
  if (match) {
    return `${match[1]}T${match[2]}`;
  }

  if (/^\d{4}-\d{2}-\d{2}T\d{2}$/.test(raw)) {
    return raw;
  }

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? raw : formatHourKey(floorToHour(parsed));
}

export function floorToHour(date: Date): Date {
  const next = new Date(date);
  next.setMinutes(0, 0, 0);
  return next;
}

export function resolveRolling24HourRange(): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
  return { start, end };
}

export function resolveSeriesGranularityForDayRange(start: Date, end: Date): 'day' | 'week' | 'month' {
  const days = daysBetweenDates(start, end) + 1;
  if (days <= 31) {
    return 'day';
  }
  if (days <= 180) {
    return 'week';
  }
  return 'month';
}

export function getWeekStart(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  const weekday = next.getDay();
  const diff = weekday === 0 ? -6 : 1 - weekday;
  next.setDate(next.getDate() + diff);
  return next;
}

export function formatMonthKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function parseMonthKey(monthKey: string): Date | null {
  const [year, month] = monthKey.split('-').map(Number);
  if (!year || !month) {
    return null;
  }
  const date = new Date(year, month - 1, 1);
  date.setHours(0, 0, 0, 0);
  return date;
}
