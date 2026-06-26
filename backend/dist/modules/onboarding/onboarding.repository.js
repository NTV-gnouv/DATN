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
exports.OnboardingRepository = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../core/database/database.service");
const json_payload_util_1 = require("../../core/database/json-payload.util");
const onboarding_entity_1 = require("./onboarding.entity");
let OnboardingRepository = class OnboardingRepository {
    constructor(databaseService) {
        this.databaseService = databaseService;
    }
    mapRow(row) {
        const sessionData = (0, json_payload_util_1.normalizeJsonPayload)(row.session_data);
        return {
            id: row.id,
            userId: row.user_id,
            ...(row.page_id ? { pageId: row.page_id } : {}),
            status: row.status,
            currentStep: row.current_step,
            startedAt: row.started_at,
            ...(row.completed_at ? { completedAt: row.completed_at } : {}),
            updatedAt: row.updated_at,
            ...sessionData,
        };
    }
    async writeSession(session) {
        const { id, userId, pageId, status, currentStep, startedAt, completedAt, updatedAt, ...sessionData } = session;
        await this.databaseService.execute(`INSERT INTO onboarding_sessions (id, user_id, page_id, status, current_step, session_data, started_at, completed_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         user_id = VALUES(user_id),
         page_id = VALUES(page_id),
         status = VALUES(status),
         current_step = VALUES(current_step),
         session_data = VALUES(session_data),
         completed_at = VALUES(completed_at),
         updated_at = VALUES(updated_at)`, [
            id,
            userId,
            pageId ?? null,
            status,
            currentStep,
            JSON.stringify(sessionData),
            startedAt,
            completedAt ?? null,
            updatedAt,
        ]);
    }
    async create(data) {
        const entity = onboarding_entity_1.OnboardingSessionEntity.create(data);
        await this.writeSession(entity);
        return entity;
    }
    async findById(id) {
        const [rows] = await this.databaseService.execute(`SELECT id, user_id, page_id, status, current_step, session_data, started_at, completed_at, updated_at
       FROM onboarding_sessions WHERE id = ? LIMIT 1`, [id]);
        const row = rows[0];
        return row ? this.mapRow(row) : null;
    }
    async findByUserId(userId) {
        const [rows] = await this.databaseService.execute(`SELECT id, user_id, page_id, status, current_step, session_data, started_at, completed_at, updated_at
       FROM onboarding_sessions WHERE user_id = ? ORDER BY updated_at DESC`, [userId]);
        return rows.map((row) => this.mapRow(row));
    }
    async findActiveSession(userId) {
        const [rows] = await this.databaseService.execute(`SELECT id, user_id, page_id, status, current_step, session_data, started_at, completed_at, updated_at
       FROM onboarding_sessions WHERE user_id = ? AND status = 'in_progress' LIMIT 1`, [userId]);
        const row = rows[0];
        return row ? this.mapRow(row) : null;
    }
    async update(id, data) {
        const existing = await this.findById(id);
        if (!existing)
            throw new Error(`Session ${id} not found`);
        const updated = { ...existing, ...data, updatedAt: new Date() };
        await this.writeSession(updated);
        return updated;
    }
    async updateStep(id, step, stepData) {
        const existing = await this.findById(id);
        if (!existing)
            throw new Error(`Session ${id} not found`);
        const stepKey = `step${step}`;
        const existingRecord = existing;
        existingRecord[stepKey] = {
            ...existingRecord[stepKey],
            ...stepData,
        };
        existing.currentStep = (step < 4 ? step + 1 : 4);
        existing.updatedAt = new Date();
        await this.writeSession(existing);
        return existing;
    }
    async completeSession(id) {
        const existing = await this.findById(id);
        if (!existing)
            throw new Error(`Session ${id} not found`);
        existing.status = 'completed';
        existing.completedAt = new Date();
        existing.updatedAt = new Date();
        await this.writeSession(existing);
        return existing;
    }
    async abandonSession(id) {
        const existing = await this.findById(id);
        if (!existing)
            throw new Error(`Session ${id} not found`);
        existing.status = 'abandoned';
        existing.updatedAt = new Date();
        await this.writeSession(existing);
        return existing;
    }
    async delete(id) {
        const [result] = await this.databaseService.execute(`DELETE FROM onboarding_sessions WHERE id = ?`, [id]);
        return result.affectedRows > 0;
    }
};
exports.OnboardingRepository = OnboardingRepository;
exports.OnboardingRepository = OnboardingRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], OnboardingRepository);
