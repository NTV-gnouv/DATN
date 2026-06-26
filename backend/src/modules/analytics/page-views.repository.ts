import { Injectable } from '@nestjs/common';
import { RowDataPacket } from 'mysql2/promise';

import { DatabaseService } from '@/core/database/database.service';

import type { PageViewEvent } from './page-views.types';

type PageViewRow = RowDataPacket & {
  id: string;
  page_id: string;
  slug: string;
  viewed_at: Date;
  country_code: string;
  device: string;
  user_agent: string | null;
  referrer: string | null;
};

@Injectable()
export class PageViewsRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  private mapRow(row: PageViewRow): PageViewEvent {
    return {
      id: row.id,
      pageId: row.page_id,
      slug: row.slug,
      viewedAt: row.viewed_at.toISOString(),
      countryCode: row.country_code,
      device: row.device as PageViewEvent['device'],
      userAgent: row.user_agent ?? '',
      referrer: row.referrer ?? '',
    };
  }

  async save(event: PageViewEvent): Promise<PageViewEvent> {
    await this.databaseService.execute(
      `INSERT INTO page_view_events (id, page_id, slug, viewed_at, country_code, device, user_agent, referrer)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         page_id = VALUES(page_id),
         slug = VALUES(slug),
         viewed_at = VALUES(viewed_at),
         country_code = VALUES(country_code),
         device = VALUES(device),
         user_agent = VALUES(user_agent),
         referrer = VALUES(referrer)`,
      [
        event.id,
        event.pageId,
        event.slug,
        event.viewedAt,
        event.countryCode,
        event.device,
        event.userAgent,
        event.referrer,
      ],
    );
    return event;
  }

  async listByPageId(pageId: string): Promise<PageViewEvent[]> {
    const [rows] = await this.databaseService.execute<PageViewRow[]>(
      `SELECT id, page_id, slug, viewed_at, country_code, device, user_agent, referrer
       FROM page_view_events
       WHERE page_id = ?
       ORDER BY viewed_at DESC`,
      [pageId],
    );

    return rows.map((row) => this.mapRow(row));
  }

  async countInRange(pageId: string, start: Date, end: Date): Promise<number> {
    const [rows] = await this.databaseService.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS total
       FROM page_view_events
       WHERE page_id = ? AND viewed_at >= ? AND viewed_at <= ?`,
      [pageId, start, end],
    );
    return Number(rows[0]?.total ?? 0);
  }

  async aggregateCountries(pageId: string, start: Date, end: Date) {
    const [rows] = await this.databaseService.execute<RowDataPacket[]>(
      `SELECT country_code AS keyName, COUNT(*) AS views
       FROM page_view_events
       WHERE page_id = ? AND viewed_at >= ? AND viewed_at <= ?
       GROUP BY country_code
       ORDER BY views DESC`,
      [pageId, start, end],
    );

    return rows.map((row) => ({
      key: String(row.keyName ?? 'ZZ'),
      views: Number(row.views ?? 0),
    }));
  }

  async aggregateDevices(pageId: string, start: Date, end: Date) {
    const [rows] = await this.databaseService.execute<RowDataPacket[]>(
      `SELECT device AS keyName, COUNT(*) AS views
       FROM page_view_events
       WHERE page_id = ? AND viewed_at >= ? AND viewed_at <= ?
       GROUP BY device
       ORDER BY views DESC`,
      [pageId, start, end],
    );

    return rows.map((row) => ({
      key: String(row.keyName ?? 'unknown'),
      views: Number(row.views ?? 0),
    }));
  }

  async aggregateDailySeries(pageId: string, start: Date, end: Date) {
    const [rows] = await this.databaseService.execute<RowDataPacket[]>(
      `SELECT DATE(viewed_at) AS bucket, COUNT(*) AS views
       FROM page_view_events
       WHERE page_id = ? AND viewed_at >= ? AND viewed_at <= ?
       GROUP BY DATE(viewed_at)
       ORDER BY bucket ASC`,
      [pageId, start, end],
    );

    return rows.map((row) => ({
      date: String(row.bucket),
      views: Number(row.views ?? 0),
    }));
  }

  async aggregateHourlySeries(pageId: string, start: Date, end: Date) {
    const [rows] = await this.databaseService.execute<RowDataPacket[]>(
      `SELECT DATE_FORMAT(viewed_at, '%Y-%m-%d %H:00:00') AS bucket, COUNT(*) AS views
       FROM page_view_events
       WHERE page_id = ? AND viewed_at >= ? AND viewed_at <= ?
       GROUP BY DATE_FORMAT(viewed_at, '%Y-%m-%d %H:00:00')
       ORDER BY bucket ASC`,
      [pageId, start, end],
    );

    return rows.map((row) => ({
      date: String(row.bucket),
      views: Number(row.views ?? 0),
    }));
  }

  async getLatestSlug(pageId: string): Promise<string> {
    const [rows] = await this.databaseService.execute<RowDataPacket[]>(
      `SELECT slug FROM page_view_events WHERE page_id = ? ORDER BY viewed_at DESC LIMIT 1`,
      [pageId],
    );
    return String(rows[0]?.slug ?? '');
  }
}
