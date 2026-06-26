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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const public_decorator_1 = require("../../shared/decorators/public.decorator");
const forgot_password_dto_1 = require("./dto/forgot-password.dto");
const login_dto_1 = require("./dto/login.dto");
const logout_dto_1 = require("./dto/logout.dto");
const refresh_token_dto_1 = require("./dto/refresh-token.dto");
const register_dto_1 = require("./dto/register.dto");
const reset_password_dto_1 = require("./dto/reset-password.dto");
const auth_service_1 = require("./auth.service");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    login(body) {
        return this.authService.login(body.email, body.password);
    }
    register(body) {
        return this.authService.register(body.email, body.password, body.name);
    }
    refresh(body) {
        return this.authService.refresh(body.refreshToken);
    }
    forgotPassword(body) {
        return this.authService.forgotPassword(body.email);
    }
    resetPassword(body) {
        return this.authService.resetPassword(body.token, body.password);
    }
    logout(body) {
        return this.authService.logout(body.userId);
    }
    completeOnboarding(body) {
        return this.authService.completeOnboarding(body.userId);
    }
    syncUser(body) {
        return this.authService.getUserProfile(body.userId);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('login'),
    (0, swagger_1.ApiOperation)({ summary: 'Login user', description: 'Validate credentials and return access token plus refresh token.' }),
    (0, swagger_1.ApiBody)({ description: 'Email and password for login' }),
    (0, swagger_1.ApiCreatedResponse)({ description: 'JWT tokens and user profile are returned.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "login", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({ summary: 'Register user', description: 'Create a new creator account and return the created user.' }),
    (0, swagger_1.ApiBody)({ description: 'Registration payload including email, name and password' }),
    (0, swagger_1.ApiCreatedResponse)({ description: 'New user account created successfully.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "register", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('refresh'),
    (0, swagger_1.ApiOperation)({ summary: 'Refresh access token', description: 'Exchange a valid refresh token for a new access token.' }),
    (0, swagger_1.ApiBody)({ description: 'Refresh token payload' }),
    (0, swagger_1.ApiCreatedResponse)({ description: 'New access token returned.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [refresh_token_dto_1.RefreshTokenDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('forgot-password'),
    (0, swagger_1.ApiOperation)({ summary: 'Request password reset', description: 'Create a reset token and send password reset instructions to the user email.' }),
    (0, swagger_1.ApiBody)({ description: 'User email for reset request' }),
    (0, swagger_1.ApiCreatedResponse)({ description: 'Password reset request accepted.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [forgot_password_dto_1.ForgotPasswordDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('reset-password'),
    (0, swagger_1.ApiOperation)({ summary: 'Reset password', description: 'Replace the password using a valid reset token.' }),
    (0, swagger_1.ApiBody)({ description: 'Reset token and new password' }),
    (0, swagger_1.ApiCreatedResponse)({ description: 'Password updated successfully.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reset_password_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, swagger_1.ApiOperation)({ summary: 'Logout user', description: 'Revoke the stored refresh token for the given user.' }),
    (0, swagger_1.ApiBody)({ description: 'User ID to logout' }),
    (0, swagger_1.ApiCreatedResponse)({ description: 'Session revoked successfully.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [logout_dto_1.LogoutDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)('complete-onboarding'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark onboarding as completed for the user.' }),
    (0, swagger_1.ApiBody)({ description: 'User ID payload' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [logout_dto_1.LogoutDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "completeOnboarding", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('sync-user'),
    (0, swagger_1.ApiOperation)({ summary: 'Refresh user profile and onboarding status for an existing session.' }),
    (0, swagger_1.ApiBody)({ description: 'User ID payload' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [logout_dto_1.LogoutDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "syncUser", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
