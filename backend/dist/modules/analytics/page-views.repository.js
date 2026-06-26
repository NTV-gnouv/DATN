"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageViewsRepository = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../core/database/database.service");
const page_views_utils_1 = require("./page-views.utils");
let PageViewsRepository = class PageViewsRepository {
    constructor(databaseService) {
        this.databaseService = databaseService;
    }
    mapRow(row) {
        return {
            id: row.id,
            pageId: row.page_id,
            slug: row.slug,
            viewedAt: row.viewed_at.toISOString(),
            countryCode: row.country_code,
            device: row.device,
            userAgent: row.user_agent ?? '',
            referrer: row.referrer ?? '',
        };
    }
    toMysqlDateTime(value) {
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
    }
    async save(event) {
        await this.databaseService.execute(`INSERT INTO page_view_events (id, page_id, slug, viewed_at, country_code, device, user_agent, referrer)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         page_id = VALUES(page_id),
         slug = VALUES(slug),
         viewed_at = VALUES(viewed_at),
         country_code = VALUES(country_code),
         device = VALUES(device),
         user_agent = VALUES(user_agent),
         referrer = VALUES(referrer)`, [
            event.id,
            event.pageId,
            event.slug,
            this.toMysqlDateTime(event.viewedAt),
            event.countryCode,
            event.device,
            event.userAgent,
            event.referrer,
        ]);
        return event;
    }
    async listByPageId(pageId) {
        const [rows] = await this.databaseService.execute(`SELECT id, page_id, slug, viewed_at, country_code, device, user_agent, referrer
       FROM page_view_events
       WHERE page_id = ?
       ORDER BY viewed_at DESC`, [pageId]);
        return rows.map((row) => this.mapRow(row));
    }
    async countInRange(pageId, start, end) {
        const [rows] = await this.databaseService.execute(`SELECT COUNT(*) AS total
       FROM page_view_events
       WHERE page_id = ? AND viewed_at >= ? AND viewed_at <= ?`, [pageId, start, end]);
        return Number(rows[0]?.total ?? 0);
    }
    async aggregateCountries(pageId, start, end) {
        const [rows] = await this.databaseService.execute(`SELECT country_code AS keyName, COUNT(*) AS views
       FROM page_view_events
       WHERE page_id = ? AND viewed_at >= ? AND viewed_at <= ?
       GROUP BY country_code
       ORDER BY views DESC`, [pageId, start, end]);
        return rows.map((row) => ({
            key: String(row.keyName ?? 'ZZ'),
            views: Number(row.views ?? 0),
        }));
    }
    async aggregateDevices(pageId, start, end) {
        const [rows] = await this.databaseService.execute(`SELECT device AS keyName, COUNT(*) AS views
       FROM page_view_events
       WHERE page_id = ? AND viewed_at >= ? AND viewed_at <= ?
       GROUP BY device
       ORDER BY views DESC`, [pageId, start, end]);
        return rows.map((row) => ({
            key: String(row.keyName ?? 'unknown'),
            views: Number(row.views ?? 0),
        }));
    }
    async aggregateDailySeries(pageId, start, end) {
        const [rows] = await this.databaseService.execute(`SELECT DATE(viewed_at) AS bucket, COUNT(*) AS views
       FROM page_view_events
       WHERE page_id = ? AND viewed_at >= ? AND viewed_at <= ?
       GROUP BY DATE(viewed_at)
       ORDER BY bucket ASC`, [pageId, start, end]);
        return rows.map((row) => ({
            date: (0, page_views_utils_1.normalizeSqlDailyBucket)(row.bucket),
            views: Number(row.views ?? 0),
        }));
    }
    async aggregateHourlySeries(pageId, start, end) {
        const [rows] = await this.databaseService.execute(`SELECT DATE_FORMAT(viewed_at, '%Y-%m-%d %H:00:00') AS bucket, COUNT(*) AS views
       FROM page_view_events
       WHERE page_id = ? AND viewed_at >= ? AND viewed_at <= ?
       GROUP BY DATE_FORMAT(viewed_at, '%Y-%m-%d %H:00:00')
       ORDER BY bucket ASC`, [pageId, start, end]);
        return rows.map((row) => ({
            date: (0, page_views_utils_1.normalizeSqlHourlyBucket)(row.bucket),
            views: Number(row.views ?? 0),
        }));
    }
    async getLatestSlug(pageId) {
        const [rows] = await this.databaseService.execute(`SELECT slug FROM page_view_events WHERE page_id = ? ORDER BY viewed_at DESC LIMIT 1`, [pageId]);
        return String(rows[0]?.slug ?? '');
    }
};
exports.PageViewsRepository = PageViewsRepository;
exports.PageViewsRepository = PageViewsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], PageViewsRepository);
