import { Injectable } from '@nestjs/common';
import { compare, hashSync } from 'bcryptjs';
import { RowDataPacket } from 'mysql2/promise';

import { DatabaseService } from '@/core/database/database.service';

import { AuthUserRecord, PasswordResetRecord } from './auth.types';

type AuthUserRow = RowDataPacket & {
  id: string;
  email: string;
  name: string;
  role: 'creator' | 'admin';
  password_hash: string;
  onboarding_completed: 0 | 1;
  metadata: unknown;
  created_at?: Date;
  updated_at?: Date;
};

type PasswordResetRow = RowDataPacket & {
  token: string;
  user_id: string;
  expires_at: Date;
};

@Injectable()
export class AuthRepository {
  private seedAdminPromise: Promise<void> | null = null;

  constructor(private readonly databaseService: DatabaseService) {}

  private mapUserRow(row: AuthUserRow): AuthUserRecord {
    const metadata =
      row.metadata && typeof row.metadata === 'object'
        ? (row.metadata as Record<string, unknown>)
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

  private async queryUserByEmail(email: string): Promise<AuthUserRecord | null> {
    const normalizedEmail = email.trim().toLowerCase();
    const [rows] = await this.databaseService.execute<AuthUserRow[]>(
      `SELECT id, email, name, role, password_hash, onboarding_completed, metadata, created_at, updated_at
       FROM auth_users
       WHERE email = ?
       LIMIT 1`,
      [normalizedEmail],
    );

    const row = rows[0];
    return row ? this.mapUserRow(row) : null;
  }

  private async queryUserById(id: string): Promise<AuthUserRecord | null> {
    const [rows] = await this.databaseService.execute<AuthUserRow[]>(
      `SELECT id, email, name, role, password_hash, onboarding_completed, metadata, created_at, updated_at
       FROM auth_users
       WHERE id = ?
       LIMIT 1`,
      [id],
    );

    const row = rows[0];
    return row ? this.mapUserRow(row) : null;
  }

  private async doEnsureSeedAdmin(): Promise<void> {
    const existing = await this.queryUserByEmail('admin@shotvn.local');
    if (existing) {
      const passwordMatches = await compare('Admin@123', existing.passwordHash);
      if (existing.role !== 'admin' || existing.onboardingCompleted !== true || !passwordMatches) {
        await this.databaseService.execute(
          `UPDATE auth_users
           SET role = 'admin',
               onboarding_completed = 1,
               password_hash = ?
           WHERE email = ?`,
          [hashSync('Admin@123', 10), existing.email],
        );
      }
      return;
    }

    await this.create({
      email: 'admin@shotvn.local',
      name: 'System Admin',
      passwordHash: hashSync('Admin@123', 10),
      role: 'admin',
    });
  }

  private ensureSeedAdmin(): Promise<void> {
    if (!this.seedAdminPromise) {
      this.seedAdminPromise = this.doEnsureSeedAdmin();
    }
    return this.seedAdminPromise;
  }

  async findRawByEmail(email: string): Promise<AuthUserRecord | null> {
    await this.ensureSeedAdmin();
    return this.queryUserByEmail(email);
  }

  async findRawById(id: string): Promise<AuthUserRecord | null> {
    await this.ensureSeedAdmin();
    return this.queryUserById(id);
  }

  async findByEmail(email: string): Promise<AuthUserRecord | null> {
    return this.findRawByEmail(email);
  }

  async findById(id: string): Promise<AuthUserRecord | null> {
    return this.findRawById(id);
  }

  async create(data: {
    email: string;
    name: string;
    passwordHash: string;
    role?: 'creator' | 'admin';
  }): Promise<AuthUserRecord> {
    const role = data.role ?? 'creator';
    const user: AuthUserRecord = {
      id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      email: data.email.trim().toLowerCase(),
      name: data.name.trim(),
      role,
      passwordHash: data.passwordHash,
      onboardingCompleted: role === 'admin',
    };

    await this.databaseService.execute(
      `INSERT INTO auth_users (id, email, name, role, password_hash, onboarding_completed)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        user.id,
        user.email,
        user.name,
        user.role,
        user.passwordHash,
        user.onboardingCompleted ? 1 : 0,
      ],
    );

    return user;
  }

  async saveRefreshToken(userId: string, refreshToken: string): Promise<void> {
    await this.databaseService.execute(
      `INSERT INTO auth_refresh_tokens (user_id, refresh_token)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE
         refresh_token = VALUES(refresh_token),
         updated_at = CURRENT_TIMESTAMP`,
      [userId, refreshToken],
    );
  }

  async getRefreshToken(userId: string): Promise<string | null> {
    const [rows] = await this.databaseService.execute<RowDataPacket[]>(
      `SELECT refresh_token FROM auth_refresh_tokens WHERE user_id = ? LIMIT 1`,
      [userId],
    );

    const token = rows[0]?.refresh_token;
    return typeof token === 'string' ? token : null;
  }

  async revokeRefreshToken(userId: string): Promise<void> {
    await this.databaseService.execute(`DELETE FROM auth_refresh_tokens WHERE user_id = ?`, [userId]);
  }

  async updatePasswordHash(userId: string, passwordHash: string): Promise<AuthUserRecord | null> {
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

  async createPasswordResetToken(userId: string, token: string, expiresAt: string): Promise<void> {
    await this.databaseService.execute(
      `INSERT INTO auth_password_reset_tokens (token, user_id, expires_at) VALUES (?, ?, ?)`,
      [token, userId, expiresAt],
    );
  }

  async findPasswordResetToken(token: string): Promise<PasswordResetRecord | null> {
    const [rows] = await this.databaseService.execute<PasswordResetRow[]>(
      `SELECT token, user_id, expires_at
       FROM auth_password_reset_tokens
       WHERE token = ?
       LIMIT 1`,
      [token],
    );

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

  async completeOnboarding(userId: string): Promise<AuthUserRecord | null> {
    const user = await this.findRawById(userId);
    if (!user) {
      return null;
    }

    await this.databaseService.execute(`UPDATE auth_users SET onboarding_completed = 1 WHERE id = ?`, [
      userId,
    ]);

    return { ...user, onboardingCompleted: true };
  }

  async deletePasswordResetToken(token: string): Promise<void> {
    await this.databaseService.execute(`DELETE FROM auth_password_reset_tokens WHERE token = ?`, [token]);
  }
}
