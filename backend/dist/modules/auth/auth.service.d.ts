import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../notifications/email.service';
import { PagesService } from '../pages/pages.service';
import { AuthRepository } from './auth.repository';
export declare class AuthService {
    private readonly authRepository;
    private readonly jwtService;
    private readonly emailService;
    private readonly pagesService;
    constructor(authRepository: AuthRepository, jwtService: JwtService, emailService: EmailService, pagesService: PagesService);
    private toPublicUser;
    private resolveOnboardingCompleted;
    getUserProfile(userId: string): Promise<{
        id: string;
        email: string;
        role: import("./auth.types").AuthUserRole;
        name: string;
        onboardingCompleted: boolean;
    }>;
    login(email: string, password: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            role: import("./auth.types").AuthUserRole;
            name: string;
            onboardingCompleted: boolean;
        };
    }>;
    register(email: string, password: string, name: string): Promise<{
        id: string;
        email: string;
        role: import("./auth.types").AuthUserRole;
        name: string;
        onboardingCompleted: boolean;
    }>;
    completeOnboarding(userId: string): Promise<{
        id: string;
        email: string;
        role: import("./auth.types").AuthUserRole;
        name: string;
        onboardingCompleted: boolean;
    }>;
    refresh(refreshToken: string): Promise<{
        accessToken: string;
    }>;
    logout(userId: string): Promise<{
        success: boolean;
        userId: string;
    }>;
    forgotPassword(email: string): Promise<{
        success: boolean;
    }>;
    resetPassword(token: string, password: string): Promise<{
        success: boolean;
        user: {
            id: string;
            email: string;
            role: import("./auth.types").AuthUserRole;
            name: string;
            onboardingCompleted: boolean;
        };
    }>;
}
