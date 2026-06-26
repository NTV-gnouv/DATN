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
exports.PluginsRepository = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../core/database/database.service");
const json_payload_util_1 = require("../../core/database/json-payload.util");
let PluginsRepository = class PluginsRepository {
    constructor(databaseService) {
        this.databaseService = databaseService;
    }
    mapRow(row) {
        const permissions = (0, json_payload_util_1.normalizeJsonPayload)(row.permissions);
        return {
            id: row.id,
            name: row.name,
            version: row.version,
            type: row.plugin_type,
            entry: row.entry,
            sourcePath: row.source_path,
            enabled: row.enabled === 1,
            permissions: Array.isArray(permissions) ? permissions.map(String) : [],
        };
    }
    async list() {
        const [rows] = await this.databaseService.execute(`SELECT id, name, version, plugin_type, entry, source_path, enabled, permissions FROM plugins ORDER BY name ASC`);
        return rows.map((row) => this.mapRow(row));
    }
    async get(id) {
        const [rows] = await this.databaseService.execute(`SELECT id, name, version, plugin_type, entry, source_path, enabled, permissions FROM plugins WHERE id = ? LIMIT 1`, [id]);
        const row = rows[0];
        return row ? this.mapRow(row) : null;
    }
    async create(payload) {
        const id = `plugin-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const record = {
            id,
            name: String(payload.name ?? id),
            version: String(payload.version ?? '1.0.0'),
            type: String(payload.type ?? 'custom'),
            entry: String(payload.entry ?? 'backend/main.js'),
            permissions: Array.isArray(payload.permissions) ? payload.permissions.map(String) : [],
            enabled: Boolean(payload.enabled ?? true),
            sourcePath: String(payload.sourcePath ?? ''),
        };
        await this.databaseService.execute(`INSERT INTO plugins (id, name, version, plugin_type, entry, source_path, enabled, permissions)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
            id,
            record.name,
            record.version,
            record.type,
            record.entry,
            record.sourcePath,
            record.enabled ? 1 : 0,
            (0, json_payload_util_1.toJsonColumn)(record.permissions),
        ]);
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
            permissions: Array.isArray(payload.permissions)
                ? payload.permissions.map(String)
                : current.permissions,
        };
        await this.databaseService.execute(`UPDATE plugins
       SET name = ?, version = ?, plugin_type = ?, entry = ?, source_path = ?, enabled = ?, permissions = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`, [
            next.name,
            next.version,
            next.type,
            next.entry,
            next.sourcePath,
            next.enabled ? 1 : 0,
            (0, json_payload_util_1.toJsonColumn)(next.permissions),
            id,
        ]);
        return next;
    }
    async replaceAll(items) {
        for (const item of items) {
            await this.databaseService.execute(`INSERT INTO plugins (id, name, version, plugin_type, entry, source_path, enabled, permissions)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           version = VALUES(version),
           plugin_type = VALUES(plugin_type),
           entry = VALUES(entry),
           source_path = VALUES(source_path),
           enabled = VALUES(enabled),
           permissions = VALUES(permissions),
           updated_at = CURRENT_TIMESTAMP`, [
                item.id,
                item.name,
                item.version,
                item.type,
                item.entry,
                item.sourcePath,
                item.enabled ? 1 : 0,
                (0, json_payload_util_1.toJsonColumn)(item.permissions),
            ]);
        }
    }
    async remove(id) {
        const [result] = await this.databaseService.execute(`DELETE FROM plugins WHERE id = ?`, [id]);
        return { removed: result.affectedRows > 0, id };
    }
};
exports.PluginsRepository = PluginsRepository;
exports.PluginsRepository = PluginsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], PluginsRepository);
