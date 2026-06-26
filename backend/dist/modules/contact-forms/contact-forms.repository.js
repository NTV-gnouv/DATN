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
exports.ContactFormsRepository = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../core/database/database.service");
const json_payload_util_1 = require("../../core/database/json-payload.util");
const submission_fields_util_1 = require("../../core/database/submission-fields.util");
let ContactFormsRepository = class ContactFormsRepository {
    constructor(databaseService) {
        this.databaseService = databaseService;
    }
    mapFormRow(row) {
        return {
            id: row.id,
            name: row.name,
            description: row.description ?? '',
            submitLabel: row.submit_label,
            successMessage: row.success_message ?? '',
            status: row.status,
            fields: (0, json_payload_util_1.normalizeJsonPayload)(row.fields),
            createdAt: row.created_at.toISOString(),
            updatedAt: row.updated_at.toISOString(),
        };
    }
    mapSubmissionRow(row) {
        return {
            id: row.id,
            formId: row.form_id,
            payload: (0, json_payload_util_1.normalizeJsonPayload)(row.payload),
            metadata: {
                ip: row.ip,
                userAgent: row.user_agent ?? '',
                submittedAt: row.submitted_at.toISOString(),
                pageUrl: row.page_url ?? '',
                ...(row.field_labels
                    ? { fieldLabels: (0, json_payload_util_1.normalizeJsonPayload)(row.field_labels) }
                    : {}),
            },
        };
    }
    async listForms() {
        const [rows] = await this.databaseService.execute(`SELECT id, name, description, submit_label, success_message, status, fields, created_at, updated_at
       FROM contact_forms ORDER BY updated_at DESC`);
        return rows.map((row) => this.mapFormRow(row));
    }
    async getForm(id) {
        const [rows] = await this.databaseService.execute(`SELECT id, name, description, submit_label, success_message, status, fields, created_at, updated_at
       FROM contact_forms WHERE id = ? LIMIT 1`, [id]);
        const row = rows[0];
        return row ? this.mapFormRow(row) : null;
    }
    async saveForm(record) {
        await this.databaseService.execute(`INSERT INTO contact_forms (id, name, description, submit_label, success_message, status, fields)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         description = VALUES(description),
         submit_label = VALUES(submit_label),
         success_message = VALUES(success_message),
         status = VALUES(status),
         fields = VALUES(fields),
         updated_at = CURRENT_TIMESTAMP`, [
            record.id,
            record.name,
            record.description,
            record.submitLabel,
            record.successMessage,
            record.status,
            JSON.stringify(record.fields),
        ]);
        return record;
    }
    async listSubmissions(formId) {
        const [rows] = formId
            ? await this.databaseService.execute(`SELECT id, form_id, payload, ip, user_agent, page_url, field_labels, submitted_at
           FROM contact_form_submissions WHERE form_id = ? ORDER BY submitted_at DESC`, [formId])
            : await this.databaseService.execute(`SELECT id, form_id, payload, ip, user_agent, page_url, field_labels, submitted_at
           FROM contact_form_submissions ORDER BY submitted_at DESC`);
        return rows.map((row) => this.mapSubmissionRow(row));
    }
    async getSubmission(id) {
        const [rows] = await this.databaseService.execute(`SELECT id, form_id, payload, ip, user_agent, page_url, field_labels, submitted_at
       FROM contact_form_submissions WHERE id = ? LIMIT 1`, [id]);
        const row = rows[0];
        return row ? this.mapSubmissionRow(row) : null;
    }
    async saveSubmission(record) {
        await this.databaseService.withTransaction(async () => {
            await this.databaseService.execute(`INSERT INTO contact_form_submissions (id, form_id, payload, ip, user_agent, page_url, field_labels, submitted_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
         ON DUPLICATE KEY UPDATE
           form_id = VALUES(form_id),
           payload = VALUES(payload),
           ip = VALUES(ip),
           user_agent = VALUES(user_agent),
           page_url = VALUES(page_url),
           field_labels = VALUES(field_labels),
           submitted_at = CURRENT_TIMESTAMP`, [
                record.id,
                record.formId,
                JSON.stringify(record.payload),
                record.metadata.ip,
                record.metadata.userAgent,
                record.metadata.pageUrl,
                (0, json_payload_util_1.toJsonColumn)(record.metadata.fieldLabels ?? null),
            ]);
            await this.databaseService.execute(`DELETE FROM contact_form_submission_fields WHERE submission_id = ?`, [record.id]);
            await (0, submission_fields_util_1.persistSubmissionFields)(async (sql, params) => {
                await this.databaseService.execute(sql, params ?? []);
            }, record.id, record.formId, record.payload);
        });
        return record;
    }
    async countSubmissions(formId, startAt, endAt) {
        const params = [formId];
        let sql = `SELECT COUNT(*) AS total FROM contact_form_submissions WHERE form_id = ?`;
        if (startAt) {
            sql += ` AND submitted_at >= ?`;
            params.push(startAt);
        }
        if (endAt) {
            sql += ` AND submitted_at <= ?`;
            params.push(endAt);
        }
        const [rows] = await this.databaseService.execute(sql, params);
        return Number(rows[0]?.total ?? 0);
    }
    async aggregateSubmissionFields(formId, fieldKey, limit = 20) {
        const [rows] = await this.databaseService.execute(`SELECT value_text AS valueKey, COUNT(*) AS total
       FROM contact_form_submission_fields
       WHERE form_id = ? AND field_key = ?
       GROUP BY value_text
       ORDER BY total DESC
       LIMIT ?`, [formId, fieldKey, limit]);
        return rows.map((row) => ({
            value: String(row.valueKey ?? ''),
            count: Number(row.total ?? 0),
        }));
    }
    async deleteSubmission(id) {
        const [result] = await this.databaseService.execute(`DELETE FROM contact_form_submissions WHERE id = ?`, [id]);
        return result.affectedRows > 0;
    }
    async deleteSubmissionsByFormId(formId) {
        const [result] = await this.databaseService.execute(`DELETE FROM contact_form_submissions WHERE form_id = ?`, [formId]);
        return result.affectedRows;
    }
};
exports.ContactFormsRepository = ContactFormsRepository;
exports.ContactFormsRepository = ContactFormsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], ContactFormsRepository);
