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
exports.ThemesRepository = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../core/database/database.service");
const json_payload_util_1 = require("../../core/database/json-payload.util");
let ThemesRepository = class ThemesRepository {
    constructor(databaseService) {
        this.databaseService = databaseService;
        this.defaultThemeId = 'minimal';
    }
    mapThemeRow(row) {
        return {
            id: row.id,
            name: row.name,
            version: row.version,
            layout: row.layout,
            sourcePath: row.source_path,
            ...(row.preview ? { preview: row.preview } : {}),
            ...(row.description ? { description: row.description } : {}),
            enabled: row.enabled === 1,
            ...(row.css_defaults ? { cssDefaults: (0, json_payload_util_1.normalizeJsonPayload)(row.css_defaults) } : {}),
            ...(row.theme_tokens ? { themeTokens: (0, json_payload_util_1.normalizeJsonPayload)(row.theme_tokens) } : {}),
            ...(row.field_schema
                ? { fields: (0, json_payload_util_1.normalizeJsonPayload)(row.field_schema) }
                : {}),
        };
    }
    buildDefaultTheme() {
        return {
            id: this.defaultThemeId,
            name: 'Minimal Theme',
            version: '1.0.0',
            preview: 'preview.png',
            description: 'Default minimal theme used by the editor.',
            cssDefaults: {
                colors: {
                    headerTextAndIcon: '#0f172a',
                    socialBlockBackground: '#ffffff',
                    socialBlockText: '#0f172a',
                    contentBlockBackground: '#ffffff',
                    contentBlockText: '#0f172a',
                    contentBlockButton: '#111827',
                },
                divLayout: {
                    widthPercent: 92,
                    border: { width: 1, style: 'solid', color: '#e6eef9', radius: 8 },
                    boxShadow: { enabled: true, x: 0, y: 6, blur: 18, spread: 0, color: 'rgba(16,24,40,0.06)' },
                },
                typography: { fontFamily: 'Inter' },
            },
            fields: [
                { key: 'typography.fontFamily', type: 'font-select', label: 'Font chữ', options: ['Inter', 'Roboto', 'Poppins', 'Montserrat', 'Lora', 'Playfair Display', 'Noto Sans', 'System'] },
                { key: 'divLayout.widthPercent', type: 'number', label: 'Chiều ngang (%)' },
                { key: 'divLayout.border.width', type: 'number', label: 'Chiều rộng border (px)' },
                { key: 'divLayout.border.color', type: 'color', label: 'Màu border' },
                { key: 'divLayout.border.radius', type: 'number', label: 'Border radius' },
                { key: 'divLayout.boxShadow.enabled', type: 'boolean', label: 'Shadow mặc định theo theme' },
                { key: 'colors.headerTextAndIcon', type: 'color', label: 'Tiêu đề & biểu tượng' },
                { key: 'colors.socialBlockBackground', type: 'color', label: 'Nền khối social' },
                { key: 'colors.socialBlockText', type: 'color', label: 'Chữ khối social' },
            ],
            layout: 'default',
            sourcePath: 'themes/minimal-theme/theme.json',
            enabled: true,
        };
    }
    async ensureDefaultTheme() {
        const current = await this.get(this.defaultThemeId);
        if (current) {
            return;
        }
        const record = this.buildDefaultTheme();
        await this.databaseService.execute(`INSERT INTO themes (id, name, version, layout, source_path, preview, description, enabled, css_defaults, field_schema)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`, [
            record.id,
            record.name,
            record.version,
            record.layout,
            record.sourcePath,
            record.preview ?? null,
            record.description ?? null,
            (0, json_payload_util_1.toJsonColumn)(record.cssDefaults ?? null),
            (0, json_payload_util_1.toJsonColumn)(record.fields ?? null),
        ]);
    }
    async list() {
        await this.ensureDefaultTheme();
        const [rows] = await this.databaseService.execute(`SELECT id, name, version, layout, source_path, preview, description, enabled, css_defaults, theme_tokens, field_schema
       FROM themes ORDER BY name ASC`);
        return rows.map((row) => this.mapThemeRow(row));
    }
    async get(id) {
        const [rows] = await this.databaseService.execute(`SELECT id, name, version, layout, source_path, preview, description, enabled, css_defaults, theme_tokens, field_schema
       FROM themes WHERE id = ? LIMIT 1`, [id]);
        const row = rows[0];
        return row ? this.mapThemeRow(row) : null;
    }
    async getDefaultId() {
        await this.ensureDefaultTheme();
        return { defaultThemeId: this.defaultThemeId };
    }
    async create(payload) {
        const id = `theme-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const record = {
            id,
            name: String(payload.name ?? id),
            version: String(payload.version ?? '1.0.0'),
            layout: String(payload.layout ?? 'default'),
            sourcePath: String(payload.sourcePath ?? ''),
            enabled: Boolean(payload.enabled ?? true),
        };
        await this.databaseService.execute(`INSERT INTO themes (id, name, version, layout, source_path, enabled)
       VALUES (?, ?, ?, ?, ?, ?)`, [id, record.name, record.version, record.layout, record.sourcePath, record.enabled ? 1 : 0]);
        return record;
    }
    async update(id, payload) {
        const current = await this.get(id);
        if (!current) {
            return null;
        }
        const next = {
            ...current,
            ...payload,
            id: current.id,
        };
        await this.databaseService.execute(`UPDATE themes
       SET name = ?, version = ?, layout = ?, source_path = ?, preview = ?, description = ?, enabled = ?, css_defaults = ?, theme_tokens = ?, field_schema = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`, [
            next.name,
            next.version,
            next.layout,
            next.sourcePath,
            next.preview ?? null,
            next.description ?? null,
            next.enabled ? 1 : 0,
            (0, json_payload_util_1.toJsonColumn)(next.cssDefaults ?? null),
            (0, json_payload_util_1.toJsonColumn)(next.themeTokens ?? null),
            (0, json_payload_util_1.toJsonColumn)(next.fields ?? null),
            id,
        ]);
        return next;
    }
    async replaceAll(items) {
        for (const item of items) {
            await this.databaseService.execute(`INSERT INTO themes (id, name, version, layout, source_path, preview, description, enabled, css_defaults, theme_tokens, field_schema)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           version = VALUES(version),
           layout = VALUES(layout),
           source_path = VALUES(source_path),
           preview = VALUES(preview),
           description = VALUES(description),
           enabled = VALUES(enabled),
           css_defaults = VALUES(css_defaults),
           theme_tokens = VALUES(theme_tokens),
           field_schema = VALUES(field_schema),
           updated_at = CURRENT_TIMESTAMP`, [
                item.id,
                item.name,
                item.version,
                item.layout,
                item.sourcePath,
                item.preview ?? null,
                item.description ?? null,
                item.enabled ? 1 : 0,
                (0, json_payload_util_1.toJsonColumn)(item.cssDefaults ?? null),
                (0, json_payload_util_1.toJsonColumn)(item.themeTokens ?? null),
                (0, json_payload_util_1.toJsonColumn)(item.fields ?? null),
            ]);
        }
    }
    async remove(id) {
        const [result] = await this.databaseService.execute(`DELETE FROM themes WHERE id = ?`, [id]);
        return { removed: result.affectedRows > 0, id };
    }
    async createCustomTheme(themeConfig) {
        const id = `custom-theme-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const configData = {
            ...themeConfig,
            id,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        await this.databaseService.execute(`INSERT INTO custom_themes (id, page_id, name, version, is_default, is_active, config)
       VALUES (?, ?, ?, ?, ?, ?, ?)`, [
            id,
            themeConfig.pageId,
            themeConfig.name,
            themeConfig.version,
            themeConfig.isDefault ? 1 : 0,
            themeConfig.isActive ? 1 : 0,
            JSON.stringify(configData),
        ]);
        return configData;
    }
    async getCustomTheme(id) {
        const [rows] = await this.databaseService.execute(`SELECT id, page_id, name, version, is_default, is_active, config, created_at, updated_at
       FROM custom_themes WHERE id = ? LIMIT 1`, [id]);
        const row = rows[0];
        if (!row) {
            return null;
        }
        const config = (0, json_payload_util_1.normalizeJsonPayload)(row.config);
        return config;
    }
    async listCustomThemesByPage(pageId) {
        const [rows] = await this.databaseService.execute(`SELECT id, page_id, name, version, is_default, is_active, config, created_at, updated_at
       FROM custom_themes WHERE page_id = ? ORDER BY updated_at DESC`, [pageId]);
        return rows.map((row) => (0, json_payload_util_1.normalizeJsonPayload)(row.config));
    }
    async updateCustomTheme(id, updates) {
        const current = await this.getCustomTheme(id);
        if (!current) {
            return null;
        }
        const updated = {
            ...current,
            ...updates,
            id: current.id,
            pageId: current.pageId,
            createdAt: current.createdAt,
            updatedAt: new Date(),
        };
        await this.databaseService.execute(`UPDATE custom_themes
       SET name = ?, version = ?, is_default = ?, is_active = ?, config = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`, [
            updated.name,
            updated.version,
            updated.isDefault ? 1 : 0,
            updated.isActive ? 1 : 0,
            JSON.stringify(updated),
            id,
        ]);
        return updated;
    }
    async deleteCustomTheme(id) {
        const [result] = await this.databaseService.execute(`DELETE FROM custom_themes WHERE id = ?`, [id]);
        return result.affectedRows > 0;
    }
};
exports.ThemesRepository = ThemesRepository;
exports.ThemesRepository = ThemesRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], ThemesRepository);
