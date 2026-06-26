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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcryptjs_1 = require("bcryptjs");
const crypto_1 = require("crypto");
const email_service_1 = require("../notifications/email.service");
const pages_service_1 = require("../pages/pages.service");
const auth_onboarding_util_1 = require("./auth-onboarding.util");
const auth_repository_1 = require("./auth.repository");
let AuthService = class AuthService {
    constructor(authRepository, jwtService, emailService, pagesService) {
        this.authRepository = authRepository;
        this.jwtService = jwtService;
        this.emailService = emailService;
        this.pagesService = pagesService;
    }
    toPublicUser(user, onboardingCompleted) {
        return {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
            onboardingCompleted,
        };
    }
    async resolveOnboardingCompleted(user) {
        if (user.onboardingCompleted === true) {
            return true;
        }
        const page = await this.pagesService.findForAccount({
            id: user.id,
            name: user.name,
            email: user.email,
        });
        if (!page?.id) {
            return false;
        }
        const editorConfig = await this.pagesService.getEditorConfig(String(page.id));
        const hasAiSetup = (0, auth_onboarding_util_1.hasConfiguredThemeTokens)(editorConfig?.themeTokens);
        if (hasAiSetup) {
            if (!user.onboardingCompleted) {
                await this.authRepository.completeOnboarding(user.id);
            }
            return true;
        }
        return false;
    }
    async getUserProfile(userId) {
        const user = await this.authRepository.findRawById(userId);
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const onboardingCompleted = await this.resolveOnboardingCompleted(user);
        return this.toPublicUser(user, onboardingCompleted);
    }
    async login(email, password) {
        const user = await this.authRepository.findByEmail(email);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const valid = await (0, bcryptjs_1.compare)(password, user.passwordHash);
        if (!valid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };
        const accessToken = await this.jwtService.signAsync(payload, {
            expiresIn: '1h',
        });
        const refreshToken = await this.jwtService.signAsync(payload, {
            expiresIn: '7d',
        });
        await this.authRepository.saveRefreshToken(user.id, refreshToken);
        const onboardingCompleted = await this.resolveOnboardingCompleted(user);
        return {
            accessToken,
            refreshToken,
            user: this.toPublicUser(user, onboardingCompleted),
        };
    }
    async register(email, password, name) {
        const existing = await this.authRepository.findByEmail(email);
        if (existing) {
            throw new common_1.UnauthorizedException('Email already exists');
        }
        const passwordHash = await (0, bcryptjs_1.hash)(password, 10);
        const user = await this.authRepository.create({ email, name, passwordHash });
        return this.toPublicUser(user, false);
    }
    async completeOnboarding(userId) {
        const user = await this.authRepository.completeOnboarding(userId);
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        return this.toPublicUser(user, true);
    }
    async refresh(refreshToken) {
        try {
            const payload = await this.jwtService.verifyAsync(refreshToken);
            const saved = await this.authRepository.getRefreshToken(payload.sub);
            if (!saved || saved !== refreshToken) {
                throw new common_1.UnauthorizedException('Invalid refresh token');
            }
            const nextToken = await this.jwtService.signAsync({
                sub: payload.sub,
                email: payload.email,
                role: payload.role,
            }, { expiresIn: '1h' });
            return { accessToken: nextToken };
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async logout(userId) {
        await this.authRepository.revokeRefreshToken(userId);
        return { success: true, userId };
    }
    async forgotPassword(email) {
        const user = await this.authRepository.findByEmail(email);
        if (user) {
            const token = (0, crypto_1.randomUUID)();
            const expiresAt = new Date(Date.now() + 1000 * 60 * 30).toISOString();
            await this.authRepository.createPasswordResetToken(user.id, token, expiresAt);
            const resetUrl = `${process.env.PUBLIC_APP_URL ?? 'http://localhost:5173'}/reset-password?token=${token}`;
            await this.emailService.sendTransactionalEmail({
                to: user.email,
                subject: 'Reset your ShotVN password',
                template: 'reset-password',
                html: `<p>Hello ${user.name},</p><p>Use this link to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
            });
        }
        return { success: true };
    }
    async resetPassword(token, password) {
        const record = await this.authRepository.findPasswordResetToken(token);
        if (!record) {
            throw new common_1.UnauthorizedException('Invalid reset token');
        }
        if (new Date(record.expiresAt).getTime() < Date.now()) {
            await this.authRepository.deletePasswordResetToken(token);
            throw new common_1.UnauthorizedException('Reset token expired');
        }
        const passwordHash = await (0, bcryptjs_1.hash)(password, 10);
        const updated = await this.authRepository.updatePasswordHash(record.userId, passwordHash);
        await this.authRepository.deletePasswordResetToken(token);
        if (!updated) {
            throw new common_1.UnauthorizedException('User not found');
        }
        return {
            success: true,
            user: this.toPublicUser(updated, await this.resolveOnboardingCompleted(updated)),
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auth_repository_1.AuthRepository,
        jwt_1.JwtService,
        email_service_1.EmailService,
        pages_service_1.PagesService])
], AuthService);
