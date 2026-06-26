"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AuthSchemaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthSchemaService = void 0;
const common_1 = require("@nestjs/common");
const bcryptjs_1 = require("bcryptjs");
let AuthSchemaService = AuthSchemaService_1 = class AuthSchemaService {
    constructor() {
        this.logger = new common_1.Logger(AuthSchemaService_1.name);
    }
    async ensureSchema(pool) {
        const hasLegacyUsers = await this.tableHasColumn(pool, 'auth_users', 'payload');
        if (hasLegacyUsers) {
            await this.migrateFromLegacyJson(pool);
            return;
        }
        await this.createRelationalTables(pool);
        await this.seedAdminIfMissing(pool);
    }
    async createRelationalTables(pool) {
        await pool.execute(`
      CREATE TABLE IF NOT EXISTS auth_users (
        id VARCHAR(191) NOT NULL,
        email VARCHAR(191) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role ENUM('creator', 'admin') NOT NULL DEFAULT 'creator',
        password_hash VARCHAR(255) NOT NULL,
        onboarding_completed TINYINT(1) NOT NULL DEFAULT 0,
        metadata JSON NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uk_auth_users_email (email),
        KEY idx_auth_users_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
        await pool.execute(`
      CREATE TABLE IF NOT EXISTS auth_refresh_tokens (
        user_id VARCHAR(191) NOT NULL,
        refresh_token TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id),
        CONSTRAINT fk_auth_refresh_tokens_user
          FOREIGN KEY (user_id) REFERENCES auth_users (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
        await pool.execute(`
      CREATE TABLE IF NOT EXISTS auth_password_reset_tokens (
        token VARCHAR(191) NOT NULL,
        user_id VARCHAR(191) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (token),
        KEY idx_auth_password_reset_user (user_id),
        KEY idx_auth_password_reset_expires (expires_at),
        CONSTRAINT fk_auth_password_reset_user
          FOREIGN KEY (user_id) REFERENCES auth_users (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
        this.logger.log('Relational auth schema ensured');
    }
    async migrateFromLegacyJson(pool) {
        this.logger.warn('Migrating auth tables from legacy JSON payload format');
        const [userRows] = await pool.execute('SELECT record_id, payload FROM auth_users');
        const [refreshRows] = await pool.execute('SELECT record_id, payload FROM auth_refresh_tokens');
        const [resetRows] = await pool.execute('SELECT record_id, payload FROM auth_password_reset_tokens');
        await pool.execute('DROP TABLE IF EXISTS auth_password_reset_tokens');
        await pool.execute('DROP TABLE IF EXISTS auth_refresh_tokens');
        await pool.execute('DROP TABLE IF EXISTS auth_users');
        await this.createRelationalTables(pool);
        for (const row of userRows) {
            const payload = this.normalizePayload(row.payload);
            const id = String(payload.id ?? row.record_id);
            const email = String(payload.email ?? row.record_id);
            const name = String(payload.name ?? 'User');
            const role = payload.role === 'admin' ? 'admin' : 'creator';
            const passwordHash = String(payload.passwordHash ?? (0, bcryptjs_1.hashSync)('Admin@123', 10));
            const onboardingCompleted = payload.onboardingCompleted === true ? 1 : 0;
            const metadata = this.extractMetadata(payload, [
                'id',
                'email',
                'name',
                'role',
                'passwordHash',
                'onboardingCompleted',
            ]);
            await pool.execute(`INSERT INTO auth_users (id, email, name, role, password_hash, onboarding_completed, metadata)
         VALUES (?, ?, ?, ?, ?, ?, ?)`, [
                id,
                email,
                name,
                role,
                passwordHash,
                onboardingCompleted,
                metadata ? JSON.stringify(metadata) : null,
            ]);
        }
        for (const row of refreshRows) {
            const payload = this.normalizePayload(row.payload);
            const userId = String(payload.userId ?? row.record_id);
            const refreshToken = String(payload.refreshToken ?? '');
            if (!userId || !refreshToken) {
                continue;
            }
            await pool.execute(`INSERT IGNORE INTO auth_refresh_tokens (user_id, refresh_token) VALUES (?, ?)`, [userId, refreshToken]);
        }
        for (const row of resetRows) {
            const payload = this.normalizePayload(row.payload);
            const token = String(payload.token ?? row.record_id);
            const userId = String(payload.userId ?? '');
            const expiresAt = String(payload.expiresAt ?? new Date(Date.now() + 3600000).toISOString());
            if (!token || !userId) {
                continue;
            }
            await pool.execute(`INSERT IGNORE INTO auth_password_reset_tokens (token, user_id, expires_at) VALUES (?, ?, ?)`, [token, userId, expiresAt]);
        }
        await this.seedAdminIfMissing(pool);
        this.logger.log('Auth JSON payload migration complete');
    }
    async seedAdminIfMissing(pool) {
        const [rows] = await pool.execute('SELECT id FROM auth_users WHERE email = ? LIMIT 1', ['admin@shotvn.local']);
        if (rows.length > 0) {
            return;
        }
        await pool.execute(`INSERT INTO auth_users (id, email, name, role, password_hash, onboarding_completed)
       VALUES (?, ?, ?, 'admin', ?, 1)`, ['u-admin', 'admin@shotvn.local', 'System Admin', (0, bcryptjs_1.hashSync)('Admin@123', 10)]);
    }
    async tableHasColumn(pool, tableName, columnName) {
        const [rows] = await pool.execute(`SELECT COUNT(*) AS total
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = ?
         AND COLUMN_NAME = ?`, [tableName, columnName]);
        return Number(rows[0]?.total ?? 0) > 0;
    }
    normalizePayload(payload) {
        if (typeof payload === 'string') {
            try {
                return JSON.parse(payload);
            }
            catch {
                return {};
            }
        }
        if (payload && typeof payload === 'object') {
            return payload;
        }
        return {};
    }
    extractMetadata(payload, reservedKeys) {
        const metadata = {};
        for (const [key, value] of Object.entries(payload)) {
            if (!reservedKeys.includes(key)) {
                metadata[key] = value;
            }
        }
        return Object.keys(metadata).length > 0 ? metadata : null;
    }
};
exports.AuthSchemaService = AuthSchemaService;
exports.AuthSchemaService = AuthSchemaService = AuthSchemaService_1 = __decorate([
    (0, common_1.Injectable)()
], AuthSchemaService);
