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
exports.EmailRepository = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../core/database/database.service");
let EmailRepository = class EmailRepository {
    constructor(databaseService) {
        this.databaseService = databaseService;
    }
    mapRow(row) {
        return {
            id: row.id,
            to: row.recipient,
            subject: row.subject,
            template: row.template,
            status: row.status,
            ...(row.error_message ? { errorMessage: row.error_message } : {}),
            createdAt: row.created_at.toISOString(),
        };
    }
    async create(record) {
        const id = `email-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const next = {
            id,
            createdAt: new Date().toISOString(),
            ...record,
        };
        await this.databaseService.execute(`INSERT INTO email_logs (id, recipient, subject, template, status, error_message)
       VALUES (?, ?, ?, ?, ?, ?)`, [
            id,
            next.to,
            next.subject,
            next.template,
            next.status,
            next.errorMessage ?? null,
        ]);
        return next;
    }
    async list() {
        const [rows] = await this.databaseService.execute(`SELECT id, recipient, subject, template, status, error_message, created_at
       FROM email_logs ORDER BY created_at DESC`);
        return rows.map((row) => this.mapRow(row));
    }
};
exports.EmailRepository = EmailRepository;
exports.EmailRepository = EmailRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], EmailRepository);
