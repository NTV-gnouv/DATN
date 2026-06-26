import { DatabaseService } from '@/core/database/database.service';
import { AuthUserRecord, PasswordResetRecord } from './auth.types';
export declare class AuthRepository {
    private readonly databaseService;
    private seedAdminPromise;
    constructor(databaseService: DatabaseService);
    private mapUserRow;
    private queryUserByEmail;
    private queryUserById;
    private doEnsureSeedAdmin;
    private ensureSeedAdmin;
    findRawByEmail(email: string): Promise<AuthUserRecord | null>;
    findRawById(id: string): Promise<AuthUserRecord | null>;
    findByEmail(email: string): Promise<AuthUserRecord | null>;
    findById(id: string): Promise<AuthUserRecord | null>;
    create(data: {
        email: string;
        name: string;
        passwordHash: string;
        role?: 'creator' | 'admin';
    }): Promise<AuthUserRecord>;
    saveRefreshToken(userId: string, refreshToken: string): Promise<void>;
    getRefreshToken(userId: string): Promise<string | null>;
    revokeRefreshToken(userId: string): Promise<void>;
    updatePasswordHash(userId: string, passwordHash: string): Promise<AuthUserRecord | null>;
    createPasswordResetToken(userId: string, token: string, expiresAt: string): Promise<void>;
    findPasswordResetToken(token: string): Promise<PasswordResetRecord | null>;
    completeOnboarding(userId: string): Promise<AuthUserRecord | null>;
    deletePasswordResetToken(token: string): Promise<void>;
}
