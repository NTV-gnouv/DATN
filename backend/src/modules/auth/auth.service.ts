import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { randomUUID } from 'crypto';

import { EmailService } from '../notifications/email.service';
import { PagesService } from '../pages/pages.service';

import { hasConfiguredThemeTokens } from './auth-onboarding.util';
import { AuthUserRecord } from './auth.types';
import { AuthRepository } from './auth.repository';

type JwtPayload = {
  sub: string;
  email: string;
  role: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly pagesService: PagesService,
  ) {}

  private toPublicUser(user: AuthUserRecord, onboardingCompleted: boolean) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      onboardingCompleted,
    };
  }

  private async resolveOnboardingCompleted(user: AuthUserRecord): Promise<boolean> {
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
    const hasAiSetup = hasConfiguredThemeTokens(editorConfig?.themeTokens);

    if (hasAiSetup) {
      if (!user.onboardingCompleted) {
        await this.authRepository.completeOnboarding(user.id);
      }
      return true;
    }

    return false;
  }

  async getUserProfile(userId: string) {
    const user = await this.authRepository.findRawById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const onboardingCompleted = await this.resolveOnboardingCompleted(user);
    return this.toPublicUser(user, onboardingCompleted);
  }

  async login(email: string, password: string) {
    const user = await this.authRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
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

  async register(email: string, password: string, name: string) {
    const existing = await this.authRepository.findByEmail(email);
    if (existing) {
      throw new UnauthorizedException('Email already exists');
    }

    const passwordHash = await hash(password, 10);
    const user = await this.authRepository.create({ email, name, passwordHash });

    return this.toPublicUser(user, false);
  }

  async completeOnboarding(userId: string) {
    const user = await this.authRepository.completeOnboarding(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.toPublicUser(user, true);
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken);
      const saved = await this.authRepository.getRefreshToken(payload.sub);
      if (!saved || saved !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const nextToken = await this.jwtService.signAsync(
        {
          sub: payload.sub,
          email: payload.email,
          role: payload.role,
        },
        { expiresIn: '1h' },
      );

      return { accessToken: nextToken };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string) {
    await this.authRepository.revokeRefreshToken(userId);
    return { success: true, userId };
  }

  async forgotPassword(email: string) {
    const user = await this.authRepository.findByEmail(email);
    if (user) {
      const token = randomUUID();
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

  async resetPassword(token: string, password: string) {
    const record = await this.authRepository.findPasswordResetToken(token);
    if (!record) {
      throw new UnauthorizedException('Invalid reset token');
    }

    if (new Date(record.expiresAt).getTime() < Date.now()) {
      await this.authRepository.deletePasswordResetToken(token);
      throw new UnauthorizedException('Reset token expired');
    }

    const passwordHash = await hash(password, 10);
    const updated = await this.authRepository.updatePasswordHash(record.userId, passwordHash);
    await this.authRepository.deletePasswordResetToken(token);

    if (!updated) {
      throw new UnauthorizedException('User not found');
    }

    return {
      success: true,
      user: this.toPublicUser(updated, await this.resolveOnboardingCompleted(updated)),
    };
  }
}
