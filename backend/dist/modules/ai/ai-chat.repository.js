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
exports.AiChatRepository = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../core/database/database.service");
const json_payload_util_1 = require("../../core/database/json-payload.util");
let AiChatRepository = class AiChatRepository {
    constructor(databaseService) {
        this.databaseService = databaseService;
    }
    mapRow(row) {
        const sessionData = (0, json_payload_util_1.normalizeJsonPayload)(row.session_data);
        return {
            id: row.id,
            userId: row.user_id,
            username: row.username,
            ...(row.page_id ? { pageId: row.page_id } : {}),
            status: row.status,
            currentStep: row.current_step,
            createdAt: row.created_at.toISOString(),
            updatedAt: row.updated_at.toISOString(),
            ...sessionData,
        };
    }
    async writeSession(session) {
        const { id, userId, username, pageId, status, currentStep, ...sessionData } = session;
        await this.databaseService.execute(`INSERT INTO ai_chat_sessions (id, user_id, username, page_id, status, current_step, session_data)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         user_id = VALUES(user_id),
         username = VALUES(username),
         page_id = VALUES(page_id),
         status = VALUES(status),
         current_step = VALUES(current_step),
         session_data = VALUES(session_data),
         updated_at = CURRENT_TIMESTAMP`, [
            id,
            userId,
            username,
            pageId ?? null,
            status,
            currentStep,
            JSON.stringify(sessionData),
        ]);
    }
    async create(userId, username, firstMessages, pageId) {
        const now = new Date().toISOString();
        const id = `ai-chat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const session = {
            id,
            userId,
            username,
            ...(pageId ? { pageId } : {}),
            status: 'collecting',
            currentStep: 0,
            answers: {},
            messages: firstMessages.map((content) => ({
                role: 'assistant',
                content,
                createdAt: now,
            })),
            createdAt: now,
            updatedAt: now,
        };
        await this.writeSession(session);
        return session;
    }
    async get(sessionId) {
        const [rows] = await this.databaseService.execute(`SELECT id, user_id, username, page_id, status, current_step, session_data, created_at, updated_at
       FROM ai_chat_sessions WHERE id = ? LIMIT 1`, [sessionId]);
        const row = rows[0];
        return row ? this.mapRow(row) : null;
    }
    async save(session) {
        const nextSession = {
            ...session,
            updatedAt: new Date().toISOString(),
        };
        await this.writeSession(nextSession);
        return nextSession;
    }
};
exports.AiChatRepository = AiChatRepository;
exports.AiChatRepository = AiChatRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], AiChatRepository);
