import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(body: LoginDto): Promise<{
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
    register(body: RegisterDto): Promise<{
        id: string;
        email: string;
        role: import("./auth.types").AuthUserRole;
        name: string;
        onboardingCompleted: boolean;
    }>;
    refresh(body: RefreshTokenDto): Promise<{
        accessToken: string;
    }>;
    forgotPassword(body: ForgotPasswordDto): Promise<{
        success: boolean;
    }>;
    resetPassword(body: ResetPasswordDto): Promise<{
        success: boolean;
        user: {
            id: string;
            email: string;
            role: import("./auth.types").AuthUserRole;
            name: string;
            onboardingCompleted: boolean;
        };
    }>;
    logout(body: LogoutDto): Promise<{
        success: boolean;
        userId: string;
    }>;
    completeOnboarding(body: LogoutDto): Promise<{
        id: string;
        email: string;
        role: import("./auth.types").AuthUserRole;
        name: string;
        onboardingCompleted: boolean;
    }>;
    syncUser(body: LogoutDto): Promise<{
        id: string;
        email: string;
        role: import("./auth.types").AuthUserRole;
        name: string;
        onboardingCompleted: boolean;
    }>;
}
