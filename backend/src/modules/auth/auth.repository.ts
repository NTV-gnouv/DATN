import { Injectable } from '@nestjs/common';
import { compare, hashSync } from 'bcryptjs';
import { DatabaseService } from '@/core/database/database.service';

type AuthUserRecord = {
  id: string;
  email: string;
  name: string;
  role: 'creator' | 'admin';
  passwordHash: string;
};

type PasswordResetRecord = {
  userId: string;
  token: string;
  expiresAt: string;
};

@Injectable()
export class AuthRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  private readonly entityName = 'auth-users';
  private readonly refreshEntityName = 'auth-refresh-tokens';
  private readonly passwordResetEntityName = 'auth-password-reset-tokens';

  private async ensureSeedAdmin(): Promise<void> {
    const records = await this.databaseService.readEntity(this.entityName);
    const existing = records
      .map((record) => record.data as AuthUserRecord)
      .find((user) => user.email === 'admin@shotvn.local');
    if (existing) {
      const passwordMatches = await compare('Admin@123', existing.passwordHash);
      if (!passwordMatches) {
        await this.databaseService.writeRecord(this.entityName, existing.email, {
          ...existing,
          passwordHash: hashSync('Admin@123', 10),
        });
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

  async findByEmail(email: string) {
    await this.ensureSeedAdmin();
    const records = await this.databaseService.readEntity(this.entityName);
    return (
      records
        .map((record) => record.data as AuthUserRecord)
        .find((user) => user.email === email) ?? null
    );
  }

  async findById(id: string) {
    await this.ensureSeedAdmin();
    const records = await this.databaseService.readEntity(this.entityName);
    return records.map((record) => record.data as AuthUserRecord).find((user) => user.id === id) ?? null;
  }

  async create(data: { email: string; name: string; passwordHash: string; role?: 'creator' | 'admin' }) {
    const user: AuthUserRecord = {
      id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      email: data.email,
      name: data.name,
      role: data.role ?? 'creator',
      passwordHash: data.passwordHash,
    };
    await this.databaseService.writeRecord(this.entityName, user.email, user);
    return user;
  }

  async saveRefreshToken(userId: string, refreshToken: string): Promise<void> {
    await this.databaseService.writeRecord(this.refreshEntityName, userId, { userId, refreshToken });
  }

  async getRefreshToken(userId: string): Promise<string | null> {
    const record = await this.databaseService.readRecord(this.refreshEntityName, userId);
    return typeof record?.refreshToken === 'string' ? record.refreshToken : null;
  }

  async revokeRefreshToken(userId: string): Promise<void> {
    await this.databaseService.deleteRecord(this.refreshEntityName, userId);
  }

  async updatePasswordHash(userId: string, passwordHash: string): Promise<AuthUserRecord | null> {
    const user = await this.findById(userId);
    if (!user) {
      return null;
    }

    const next: AuthUserRecord = { ...user, passwordHash };
    await this.databaseService.writeRecord(this.entityName, next.email, next);
    return next;
  }

  async createPasswordResetToken(userId: string, token: string, expiresAt: string): Promise<void> {
    const record: PasswordResetRecord = { userId, token, expiresAt };
    await this.databaseService.writeRecord(this.passwordResetEntityName, token, record);
  }

  async findPasswordResetToken(token: string): Promise<PasswordResetRecord | null> {
    const record = await this.databaseService.readRecord(this.passwordResetEntityName, token);
    return record ? (record as PasswordResetRecord) : null;
  }

  async deletePasswordResetToken(token: string): Promise<void> {
    await this.databaseService.deleteRecord(this.passwordResetEntityName, token);
  }
}
