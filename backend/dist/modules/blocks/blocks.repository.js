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
exports.BlocksRepository = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../core/database/database.service");
const json_payload_util_1 = require("../../core/database/json-payload.util");
let BlocksRepository = class BlocksRepository {
    constructor(databaseService) {
        this.databaseService = databaseService;
        this.defaultHeaderBlockId = 'block-header-default';
        this.socialPlatforms = ['TikTok', 'Instagram', 'YouTube', 'X'];
    }
    mapDefinitionRow(row) {
        const defaultData = (0, json_payload_util_1.normalizeJsonPayload)(row.default_data);
        return {
            id: row.id,
            type: row.block_type,
            name: row.name,
            version: row.version,
            isDefault: row.is_default === 1,
            fields: defaultData.fields ?? defaultData,
            ...(row.source ? { source: row.source } : {}),
            createdAt: row.created_at?.toISOString?.(),
            updatedAt: row.updated_at?.toISOString?.(),
        };
    }
    normalizeId(value) {
        return value
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    buildDefaultHeaderBlock() {
        const now = new Date().toISOString();
        return {
            id: this.defaultHeaderBlockId,
            type: 'header',
            name: 'header',
            version: '1.0.0',
            isDefault: true,
            fields: {
                profile: {
                    avatarUrl: '',
                    displayName: '',
                    bio: '',
                    avatarShape: 'circle',
                    avatarDisplayStyle: 'circle',
                    avatarSize: 32,
                    displayNameSize: 100,
                },
                theme: {
                    defaultThemeId: 'minimal',
                },
                layout: {
                    mode: 'default',
                    config: {},
                },
                colors: {
                    pageBackground: {
                        mode: 'solid',
                        solid: '#ffffff',
                        gradient: {
                            start: '#ffffff',
                            end: '#cbd5e1',
                            type: 'linear',
                        },
                        imageUrl: '',
                    },
                    headerTextAndIcon: '#000000',
                    socialBlockBackground: '#ffffff',
                    socialBlockText: '#000000',
                    contentBlockBackground: '#ffffff',
                    contentBlockText: '#000000',
                    contentBlockButton: '#76b900',
                },
                typography: {
                    fontFamily: 'Inter',
                    displayFontFamily: 'Inter',
                    bodyFontFamily: 'Inter',
                    fontPairingId: 'modern-inter',
                    fontSize: 16,
                    fontWeight: 400,
                    headingSize: 32,
                    headingWeight: 700,
                    headingLetterSpacing: -0.02,
                    headingTransform: 'none',
                    lineHeight: 1.5,
                },
                socials: {
                    iconSize: 24,
                    displayMode: 'icons',
                    items: this.socialPlatforms.map((platform) => ({
                        platform,
                        url: '',
                        iconUrl: '',
                    })),
                    customFaviconEnabled: true,
                },
                divLayout: {
                    widthPercent: 100,
                    border: {
                        width: 1,
                        style: 'solid',
                        color: '#cccccc',
                        radius: 2,
                    },
                    boxShadow: {
                        enabled: false,
                        x: 0,
                        y: 0,
                        blur: 5,
                        spread: 0,
                        color: 'rgba(0,0,0,0.3)',
                    },
                },
            },
            createdAt: now,
            updatedAt: now,
        };
    }
    async ensureDefaultHeaderBlock() {
        const current = await this.get(this.defaultHeaderBlockId);
        if (current) {
            return;
        }
        const record = this.buildDefaultHeaderBlock();
        await this.databaseService.execute(`INSERT INTO block_definitions (id, block_type, name, version, is_default, default_data)
       VALUES (?, 'header', ?, ?, 1, ?)`, [record.id, record.name, record.version, JSON.stringify({ fields: record.fields })]);
    }
    async list() {
        await this.ensureDefaultHeaderBlock();
        const [rows] = await this.databaseService.execute(`SELECT id, block_type, name, version, plugin_id, is_default, default_data, source, created_at, updated_at
       FROM block_definitions
       ORDER BY updated_at DESC`);
        return rows.map((row) => this.mapDefinitionRow(row));
    }
    async get(id) {
        const [rows] = await this.databaseService.execute(`SELECT id, block_type, name, version, plugin_id, is_default, default_data, source, created_at, updated_at
       FROM block_definitions WHERE id = ? LIMIT 1`, [id]);
        const row = rows[0];
        return row ? this.mapDefinitionRow(row) : null;
    }
    async getDefaultId() {
        await this.ensureDefaultHeaderBlock();
        return { defaultBlockId: this.defaultHeaderBlockId };
    }
    async getDefaultHeaderBlock() {
        await this.ensureDefaultHeaderBlock();
        return this.get(this.defaultHeaderBlockId);
    }
    async create(payload) {
        const id = `block-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const record = {
            id,
            type: String(payload.type ?? 'custom'),
            name: String(payload.name ?? 'custom-block'),
            version: String(payload.version ?? '1.0.0'),
            isDefault: Boolean(payload.isDefault ?? false),
            fields: (payload.fields ?? {}),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        await this.databaseService.execute(`INSERT INTO block_definitions (id, block_type, name, version, is_default, default_data)
       VALUES (?, ?, ?, ?, ?, ?)`, [
            id,
            record.type,
            record.name,
            record.version,
            record.isDefault ? 1 : 0,
            JSON.stringify({ fields: record.fields }),
        ]);
        return record;
    }
    async importDefinition(payload) {
        const source = (payload.block && typeof payload.block === 'object'
            ? payload.block
            : payload);
        const requestedId = String(source.id ?? source.name ?? 'imported-block');
        const baseId = this.normalizeId(requestedId) || `block-${Date.now()}`;
        let id = baseId;
        const existing = await this.get(id);
        if (existing) {
            id = `${baseId}-${Math.random().toString(36).slice(2, 6)}`;
        }
        const record = {
            id,
            type: String(source.type ?? 'custom'),
            name: String(source.name ?? id),
            version: String(source.version ?? '1.0.0'),
            isDefault: false,
            fields: (source.fields ?? {}),
            source: 'import',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        await this.databaseService.execute(`INSERT INTO block_definitions (id, block_type, name, version, is_default, default_data, source)
       VALUES (?, ?, ?, ?, 0, ?, 'import')`, [id, record.type, record.name, record.version, JSON.stringify({ fields: record.fields })]);
        return record;
    }
    async update(id, payload) {
        const current = (await this.get(id));
        if (!current) {
            return null;
        }
        const next = {
            ...current,
            ...payload,
            id,
            updatedAt: new Date().toISOString(),
        };
        await this.databaseService.execute(`UPDATE block_definitions
       SET block_type = ?, name = ?, version = ?, is_default = ?, default_data = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`, [
            String(next.type ?? current.type),
            String(next.name ?? current.name),
            String(next.version ?? current.version),
            next.isDefault === true ? 1 : 0,
            (0, json_payload_util_1.toJsonColumn)({ fields: next.fields ?? current.fields }),
            id,
        ]);
        return next;
    }
};
exports.BlocksRepository = BlocksRepository;
exports.BlocksRepository = BlocksRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], BlocksRepository);
