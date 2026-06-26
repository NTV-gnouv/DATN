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
exports.UsersRepository = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../core/database/database.service");
const json_payload_util_1 = require("../../core/database/json-payload.util");
let UsersRepository = class UsersRepository {
    constructor(databaseService) {
        this.databaseService = databaseService;
    }
    mapRow(row) {
        const metadata = (0, json_payload_util_1.normalizeJsonPayload)(row.metadata);
        return {
            id: row.id,
            name: row.name,
            role: row.role,
            deleted: row.deleted === 1,
            ...metadata,
        };
    }
    async findById(id) {
        const [rows] = await this.databaseService.execute(`SELECT id, name, role, deleted, metadata FROM user_profiles WHERE id = ? LIMIT 1`, [id]);
        const row = rows[0];
        return row ? this.mapRow(row) : { id, name: 'Demo User', role: 'creator' };
    }
    async findAll() {
        const [rows] = await this.databaseService.execute(`SELECT id, name, role, deleted, metadata FROM user_profiles ORDER BY updated_at DESC`);
        return rows.map((row) => this.mapRow(row));
    }
    async update(id, payload) {
        const current = (await this.findById(id));
        const next = { ...current, ...payload, id };
        await this.databaseService.execute(`INSERT INTO user_profiles (id, name, role, deleted, metadata)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         role = VALUES(role),
         deleted = VALUES(deleted),
         metadata = VALUES(metadata),
         updated_at = CURRENT_TIMESTAMP`, [
            id,
            String(next.name ?? 'User'),
            String(next.role ?? 'creator'),
            next.deleted === true ? 1 : 0,
            JSON.stringify(next),
        ]);
        return next;
    }
    async softDelete(id) {
        const current = (await this.findById(id));
        const next = { ...current, id, deleted: true };
        await this.update(id, next);
        return next;
    }
};
exports.UsersRepository = UsersRepository;
exports.UsersRepository = UsersRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], UsersRepository);
