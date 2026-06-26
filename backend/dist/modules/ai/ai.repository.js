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
exports.AiRepository = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../core/database/database.service");
let AiRepository = class AiRepository {
    constructor(databaseService) {
        this.databaseService = databaseService;
        this.entityName = 'ai-chat-sessions';
    }
    async create(pageId, firstAssistantMessage) {
        const now = new Date().toISOString();
        const id = `ai-chat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const session = {
            id,
            pageId,
            status: 'collecting',
            currentStep: 0,
            answers: {},
            messages: [
                {
                    role: 'assistant',
                    content: firstAssistantMessage,
                    createdAt: now,
                },
            ],
            createdAt: now,
            updatedAt: now,
        };
        await this.databaseService.writeRecord(this.entityName, id, session);
        return session;
    }
    async get(sessionId) {
        const record = await this.databaseService.readRecord(this.entityName, sessionId);
        if (!record) {
            return null;
        }
        return record;
    }
    async save(session) {
        const nextSession = {
            ...session,
            updatedAt: new Date().toISOString(),
        };
        await this.databaseService.writeRecord(this.entityName, nextSession.id, nextSession);
        return nextSession;
    }
};
exports.AiRepository = AiRepository;
exports.AiRepository = AiRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], AiRepository);
