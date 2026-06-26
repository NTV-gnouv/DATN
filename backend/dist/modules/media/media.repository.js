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
exports.MediaRepository = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../core/database/database.service");
const json_payload_util_1 = require("../../core/database/json-payload.util");
let MediaRepository = class MediaRepository {
    constructor(databaseService) {
        this.databaseService = databaseService;
    }
    mapRow(row) {
        const variants = (0, json_payload_util_1.normalizeJsonPayload)(row.variants);
        return {
            id: row.id,
            ...(row.owner_id ? { ownerId: row.owner_id } : {}),
            originalName: row.original_name,
            mimeType: row.mime_type,
            size: Number(row.size),
            ...(row.purpose ? { purpose: row.purpose } : {}),
            width: row.width,
            height: row.height,
            storageKey: row.storage_key,
            ...(row.preview_path ? { previewPath: row.preview_path } : {}),
            ...(row.thumb_path ? { thumbPath: row.thumb_path } : {}),
            publicUrl: row.public_url,
            variants: variants,
        };
    }
    async list() {
        const [rows] = await this.databaseService.execute(`SELECT id, owner_id, original_name, mime_type, size, purpose, width, height, storage_key, preview_path, thumb_path, public_url, variants
       FROM media ORDER BY created_at DESC`);
        return rows.map((row) => this.mapRow(row));
    }
    async get(id) {
        const [rows] = await this.databaseService.execute(`SELECT id, owner_id, original_name, mime_type, size, purpose, width, height, storage_key, preview_path, thumb_path, public_url, variants
       FROM media WHERE id = ? LIMIT 1`, [id]);
        const row = rows[0];
        return row ? this.mapRow(row) : null;
    }
    async create(payload) {
        const id = `media-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const record = {
            id,
            ownerId: String(payload.ownerId ?? ''),
            originalName: String(payload.originalName ?? 'upload'),
            mimeType: String(payload.mimeType ?? 'application/octet-stream'),
            size: Number(payload.size ?? 0),
            width: payload.width == null ? null : Number(payload.width),
            height: payload.height == null ? null : Number(payload.height),
            storageKey: String(payload.storageKey ?? `${id}/original`),
            publicUrl: String(payload.publicUrl ?? ''),
            variants: payload.variants ?? {},
        };
        await this.databaseService.execute(`INSERT INTO media (id, owner_id, original_name, mime_type, size, purpose, width, height, storage_key, preview_path, thumb_path, public_url, variants)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            id,
            record.ownerId || null,
            record.originalName,
            record.mimeType,
            record.size,
            payload.purpose ? String(payload.purpose) : null,
            record.width,
            record.height,
            record.storageKey,
            payload.previewPath ? String(payload.previewPath) : null,
            payload.thumbPath ? String(payload.thumbPath) : null,
            record.publicUrl,
            (0, json_payload_util_1.toJsonColumn)(record.variants),
        ]);
        return record;
    }
    async update(id, payload) {
        const current = await this.get(id);
        if (!current) {
            return null;
        }
        const next = { ...current, ...payload, id: current.id };
        await this.databaseService.execute(`UPDATE media
       SET owner_id = ?, original_name = ?, mime_type = ?, size = ?, purpose = ?, width = ?, height = ?, storage_key = ?, preview_path = ?, thumb_path = ?, public_url = ?, variants = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`, [
            next.ownerId || null,
            next.originalName,
            next.mimeType,
            next.size,
            next.purpose ?? null,
            next.width,
            next.height,
            next.storageKey,
            next.previewPath ?? null,
            next.thumbPath ?? null,
            next.publicUrl,
            (0, json_payload_util_1.toJsonColumn)(next.variants),
            id,
        ]);
        return next;
    }
};
exports.MediaRepository = MediaRepository;
exports.MediaRepository = MediaRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], MediaRepository);
