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
exports.AuthRepository = void 0;
const common_1 = require("@nestjs/common");
const bcryptjs_1 = require("bcryptjs");
const database_service_1 = require("../../core/database/database.service");
let AuthRepository = class AuthRepository {
    constructor(databaseService) {
        this.databaseService = databaseService;
        this.seedAdminPromise = null;
    }
    mapUserRow(row) {
        const metadata = row.metadata && typeof row.metadata === 'object'
            ? row.metadata
            : undefined;
        return {
            id: row.id,
            email: row.email,
            name: row.name,
            role: row.role,
            passwordHash: row.password_hash,
            onboardingCompleted: row.onboarding_completed === 1,
            ...(metadata ? { metadata } : {}),
            ...(row.created_at ? { createdAt: row.created_at.toISOString() } : {}),
            ...(row.updated_at ? { updatedAt: row.updated_at.toISOString() } : {}),
        };
    }
    async queryUserByEmail(email) {
        const normalizedEmail = email.trim().toLowerCase();
        const [rows] = await this.databaseService.execute(`SELECT id, email, name, role, password_hash, onboarding_completed, metadata, created_at, updated_at
       FROM auth_users
       WHERE email = ?
       LIMIT 1`, [normalizedEmail]);
        const row = rows[0];
        return row ? this.mapUserRow(row) : null;
    }
    async queryUserById(id) {
        const [rows] = await this.databaseService.execute(`SELECT id, email, name, role, password_hash, onboarding_completed, metadata, created_at, updated_at
       FROM auth_users
       WHERE id = ?
       LIMIT 1`, [id]);
        const row = rows[0];
        return row ? this.mapUserRow(row) : null;
    }
    async doEnsureSeedAdmin() {
        const existing = await this.queryUserByEmail('admin@shotvn.local');
        if (existing) {
            const passwordMatches = await (0, bcryptjs_1.compare)('Admin@123', existing.passwordHash);
            if (existing.role !== 'admin' || existing.onboardingCompleted !== true || !passwordMatches) {
                await this.databaseService.execute(`UPDATE auth_users
           SET role = 'admin',
               onboarding_completed = 1,
               password_hash = ?
           WHERE email = ?`, [(0, bcryptjs_1.hashSync)('Admin@123', 10), existing.email]);
            }
            return;
        }
        await this.create({
            email: 'admin@shotvn.local',
            name: 'System Admin',
            passwordHash: (0, bcryptjs_1.hashSync)('Admin@123', 10),
            role: 'admin',
        });
    }
    ensureSeedAdmin() {
        if (!this.seedAdminPromise) {
            this.seedAdminPromise = this.doEnsureSeedAdmin();
        }
        return this.seedAdminPromise;
    }
    async findRawByEmail(email) {
        await this.ensureSeedAdmin();
        return this.queryUserByEmail(email);
    }
    async findRawById(id) {
        await this.ensureSeedAdmin();
        return this.queryUserById(id);
    }
    async findByEmail(email) {
        return this.findRawByEmail(email);
    }
    async findById(id) {
        return this.findRawById(id);
    }
    async create(data) {
        const role = data.role ?? 'creator';
        const user = {
            id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            email: data.email.trim().toLowerCase(),
            name: data.name.trim(),
            role,
            passwordHash: data.passwordHash,
            onboardingCompleted: role === 'admin',
        };
        await this.databaseService.execute(`INSERT INTO auth_users (id, email, name, role, password_hash, onboarding_completed)
       VALUES (?, ?, ?, ?, ?, ?)`, [
            user.id,
            user.email,
            user.name,
            user.role,
            user.passwordHash,
            user.onboardingCompleted ? 1 : 0,
        ]);
        return user;
    }
    async saveRefreshToken(userId, refreshToken) {
        await this.databaseService.execute(`INSERT INTO auth_refresh_tokens (user_id, refresh_token)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE
         refresh_token = VALUES(refresh_token),
         updated_at = CURRENT_TIMESTAMP`, [userId, refreshToken]);
    }
    async getRefreshToken(userId) {
        const [rows] = await this.databaseService.execute(`SELECT refresh_token FROM auth_refresh_tokens WHERE user_id = ? LIMIT 1`, [userId]);
        const token = rows[0]?.refresh_token;
        return typeof token === 'string' ? token : null;
    }
    async revokeRefreshToken(userId) {
        await this.databaseService.execute(`DELETE FROM auth_refresh_tokens WHERE user_id = ?`, [userId]);
    }
    async updatePasswordHash(userId, passwordHash) {
        const user = await this.findById(userId);
        if (!user) {
            return null;
        }
        await this.databaseService.execute(`UPDATE auth_users SET password_hash = ? WHERE id = ?`, [
            passwordHash,
            userId,
        ]);
        return { ...user, passwordHash };
    }
    async createPasswordResetToken(userId, token, expiresAt) {
        await this.databaseService.execute(`INSERT INTO auth_password_reset_tokens (token, user_id, expires_at) VALUES (?, ?, ?)`, [token, userId, expiresAt]);
    }
    async findPasswordResetToken(token) {
        const [rows] = await this.databaseService.execute(`SELECT token, user_id, expires_at
       FROM auth_password_reset_tokens
       WHERE token = ?
       LIMIT 1`, [token]);
        const row = rows[0];
        if (!row) {
            return null;
        }
        return {
            token: row.token,
            userId: row.user_id,
            expiresAt: row.expires_at.toISOString(),
        };
    }
    async completeOnboarding(userId) {
        const user = await this.findRawById(userId);
        if (!user) {
            return null;
        }
        await this.databaseService.execute(`UPDATE auth_users SET onboarding_completed = 1 WHERE id = ?`, [
            userId,
        ]);
        return { ...user, onboardingCompleted: true };
    }
    async deletePasswordResetToken(token) {
        await this.databaseService.execute(`DELETE FROM auth_password_reset_tokens WHERE token = ?`, [token]);
    }
};
exports.AuthRepository = AuthRepository;
exports.AuthRepository = AuthRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], AuthRepository);
