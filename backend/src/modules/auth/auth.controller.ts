import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Public } from '@/shared/decorators/public.decorator';

import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login user', description: 'Validate credentials and return access token plus refresh token.' })
  @ApiBody({ description: 'Email and password for login' })
  @ApiCreatedResponse({ description: 'JWT tokens and user profile are returned.' })
  login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register user', description: 'Create a new creator account and return the created user.' })
  @ApiBody({ description: 'Registration payload including email, name and password' })
  @ApiCreatedResponse({ description: 'New user account created successfully.' })
  register(@Body() body: RegisterDto) {
    return this.authService.register(body.email, body.password, body.name);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token', description: 'Exchange a valid refresh token for a new access token.' })
  @ApiBody({ description: 'Refresh token payload' })
  @ApiCreatedResponse({ description: 'New access token returned.' })
  refresh(@Body() body: RefreshTokenDto) {
    return this.authService.refresh(body.refreshToken);
  }

  @Public()
  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset', description: 'Create a reset token and send password reset instructions to the user email.' })
  @ApiBody({ description: 'User email for reset request' })
  @ApiCreatedResponse({ description: 'Password reset request accepted.' })
  forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.forgotPassword(body.email);
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password', description: 'Replace the password using a valid reset token.' })
  @ApiBody({ description: 'Reset token and new password' })
  @ApiCreatedResponse({ description: 'Password updated successfully.' })
  resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body.token, body.password);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout user', description: 'Revoke the stored refresh token for the given user.' })
  @ApiBody({ description: 'User ID to logout' })
  @ApiCreatedResponse({ description: 'Session revoked successfully.' })
  logout(@Body() body: LogoutDto) {
    return this.authService.logout(body.userId);
  }

  @Post('complete-onboarding')
  @ApiOperation({ summary: 'Mark onboarding as completed for the user.' })
  @ApiBody({ description: 'User ID payload' })
  completeOnboarding(@Body() body: LogoutDto) {
    return this.authService.completeOnboarding(body.userId);
  }

  @Public()
  @Post('sync-user')
  @ApiOperation({ summary: 'Refresh user profile and onboarding status for an existing session.' })
  @ApiBody({ description: 'User ID payload' })
  syncUser(@Body() body: LogoutDto) {
    return this.authService.getUserProfile(body.userId);
  }
}
