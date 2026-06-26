"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var DatabaseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const common_1 = require("@nestjs/common");
const promise_1 = require("mysql2/promise");
const auth_schema_service_1 = require("./auth-schema.service");
const json_payload_util_1 = require("./json-payload.util");
const relational_schema_service_1 = require("./relational-schema.service");
let DatabaseService = DatabaseService_1 = class DatabaseService {
    constructor() {
        this.logger = new common_1.Logger(DatabaseService_1.name);
        this.pool = null;
        this.authSchemaService = new auth_schema_service_1.AuthSchemaService();
        this.relationalSchemaService = new relational_schema_service_1.RelationalSchemaService();
        this.entityTables = [
            { entity: 'admin', tableName: 'admin_records' },
            { entity: 'analytics', tableName: 'analytics' },
        ];
        this.activeConnection = null;
    }
    async onModuleInit() {
        const pool = await this.getPool();
        await this.authSchemaService.ensureSchema(pool);
        await this.relationalSchemaService.ensureSchema(pool);
        await this.ensureSchema();
    }
    async execute(sql, params = []) {
        if (this.activeConnection) {
            return this.activeConnection.execute(sql, params);
        }
        const pool = await this.getPool();
        return pool.execute(sql, params);
    }
    async transaction(cb) {
        return this.withTransaction(async () => cb());
    }
    async withTransaction(cb) {
        const pool = await this.getPool();
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            this.activeConnection = connection;
            const result = await cb();
            await connection.commit();
            return result;
        }
        catch (error) {
            await connection.rollback();
            throw error;
        }
        finally {
            this.activeConnection = null;
            connection.release();
        }
    }
    async readEntity(entity) {
        const pool = await this.getPool();
        const tableName = this.getTableName(entity);
        const [rows] = await pool.execute(`SELECT record_id, payload FROM ${tableName} ORDER BY updated_at DESC`, []);
        return rows.map((row) => ({
            id: row.record_id,
            data: this.normalizePayload(row.payload),
        }));
    }
    async readRecord(entity, recordId) {
        const pool = await this.getPool();
        const tableName = this.getTableName(entity);
        const [rows] = await pool.execute(`SELECT record_id, payload FROM ${tableName} WHERE record_id = ? LIMIT 1`, [recordId]);
        const row = rows[0];
        return row ? this.normalizePayload(row.payload) : null;
    }
    async writeRecord(entity, recordId, payload) {
        const pool = await this.getPool();
        const jsonPayload = JSON.stringify(payload);
        const tableName = this.getTableName(entity);
        await pool.execute(`INSERT INTO ${tableName} (record_id, payload)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE payload = VALUES(payload), updated_at = CURRENT_TIMESTAMP`, [recordId, jsonPayload]);
    }
    async deleteRecord(entity, recordId) {
        const pool = await this.getPool();
        const tableName = this.getTableName(entity);
        const [result] = await pool.execute(`DELETE FROM ${tableName} WHERE record_id = ?`, [recordId]);
        return result.affectedRows > 0;
    }
    async getPool() {
        if (this.pool) {
            return this.pool;
        }
        this.pool = (0, promise_1.createPool)({
            host: process.env.DB_HOST ?? '127.0.0.1',
            port: Number(process.env.DB_PORT ?? 3306),
            user: process.env.DB_USER ?? 'root',
            password: process.env.DB_PASS ?? '',
            database: process.env.DB_NAME ?? 'shotvn',
            connectionLimit: 10,
            decimalNumbers: true,
            namedPlaceholders: false,
        });
        return this.pool;
    }
    async ensureSchema() {
        const pool = await this.getPool();
        for (const item of this.entityTables) {
            await pool.execute(`
        CREATE TABLE IF NOT EXISTS ${item.tableName} (
          record_id VARCHAR(191) NOT NULL,
          payload JSON NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (record_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
        }
        this.logger.log('MySQL legacy JSON tables schema ensured');
    }
    normalizePayload(payload) {
        return (0, json_payload_util_1.normalizeJsonPayload)(payload);
    }
    getTableName(entity) {
        return this.entityTables.find((item) => item.entity === entity)?.tableName ?? 'admin_records';
    }
};
exports.DatabaseService = DatabaseService;
exports.DatabaseService = DatabaseService = DatabaseService_1 = __decorate([
    (0, common_1.Injectable)()
], DatabaseService);
