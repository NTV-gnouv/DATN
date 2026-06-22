import { Controller, Post, Get, Param, Body, Patch, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OnboardingService } from './onboarding.service';
import { SubmitStep1Dto, SubmitStep2Dto, SubmitStep3Dto, SubmitStep4Dto, StartOnboardingDto } from './dto/onboarding.dto';
import { OnboardingSession } from '@/shared/types/onboarding.types';
import { Public } from '@/shared/decorators/public.decorator';

@ApiTags('Onboarding')
@Controller('onboarding')
@Public()
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  /**
   * Start a new onboarding session (Step 1/4)
   */
  @Post('start')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Start new onboarding session' })
  @ApiResponse({ status: 201, description: 'Session started', type: Object })
  async startSession(
    @Body() dto: StartOnboardingDto,
  ): Promise<OnboardingSession> {
    // Generate userId if not provided (for guests)
    const userId = dto.userId || `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return this.onboardingService.startSession(userId, dto.pageId);
  }

  /**
   * Get onboarding session status and progress
   */
  @Get(':sessionId')
  @ApiOperation({ summary: 'Get onboarding session details' })
  @ApiResponse({ status: 200, description: 'Session details', type: Object })
  async getSession(@Param('sessionId') sessionId: string): Promise<OnboardingSession> {
    return this.onboardingService.getSession(sessionId);
  }

  /**
   * Get session progress (Step indicator)
   */
  @Get(':sessionId/progress')
  @ApiOperation({ summary: 'Get progress (Step 1/4, 2/4, etc)' })
  @ApiResponse({ status: 200, description: 'Progress info' })
  async getProgress(@Param('sessionId') sessionId: string) {
    return this.onboardingService.getSessionProgress(sessionId);
  }

  /**
   * Submit Step 1 - Social Media Links
   */
  @Post(':sessionId/step/1')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit step 1: social media links' })
  @ApiResponse({ status: 200, description: 'Step 1 submitted' })
  async submitStep1(
    @Param('sessionId') sessionId: string,
    @Body() dto: SubmitStep1Dto,
  ): Promise<OnboardingSession> {
    return this.onboardingService.submitStep1(sessionId, dto);
  }

  /**
   * Submit Step 2 - Profile Confirmation
   */
  @Post(':sessionId/step/2')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit step 2: profile confirmation' })
  @ApiResponse({ status: 200, description: 'Step 2 submitted' })
  async submitStep2(
    @Param('sessionId') sessionId: string,
    @Body() dto: SubmitStep2Dto,
  ): Promise<OnboardingSession> {
    return this.onboardingService.submitStep2(sessionId, dto);
  }

  /**
   * Submit Step 3 - Prompt Review & Customization
   */
  @Post(':sessionId/step/3')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit step 3: prompt review' })
  @ApiResponse({ status: 200, description: 'Step 3 submitted' })
  async submitStep3(
    @Param('sessionId') sessionId: string,
    @Body() dto: SubmitStep3Dto,
  ): Promise<OnboardingSession> {
    return this.onboardingService.submitStep3(sessionId, dto);
  }

  /**
   * Submit Step 4 - Final Confirmation & Create Landing Page
   */
  @Post(':sessionId/step/4')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit step 4: finalize and create landing page' })
  @ApiResponse({ status: 201, description: 'Landing page created' })
  async submitStep4(
    @Param('sessionId') sessionId: string,
    @Body() dto: SubmitStep4Dto,
  ): Promise<OnboardingSession> {
    // TODO: Call PageService to create the actual landing page
    const landingPageId = 'page-' + Date.now();
    return this.onboardingService.submitStep4(sessionId, dto, landingPageId);
  }

  /**
   * Regenerate AI prompt for Step 3
   */
  @Patch(':sessionId/regenerate-prompt')
  @ApiOperation({ summary: 'Regenerate AI prompt' })
  @ApiResponse({ status: 200, description: 'New prompt generated' })
  async regeneratePrompt(@Param('sessionId') sessionId: string): Promise<{ prompt: string }> {
    const prompt = await this.onboardingService.regenerateStep3Prompt(sessionId);
    return { prompt };
  }

  /**
   * Cancel onboarding session
   */
  @Post(':sessionId/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel onboarding session' })
  @ApiResponse({ status: 200, description: 'Session cancelled' })
  async cancelSession(@Param('sessionId') sessionId: string): Promise<{ message: string }> {
    await this.onboardingService.cancelSession(sessionId);
    return { message: 'Onboarding session cancelled' };
  }

  /**
   * Get all sessions for current user
   */
  @Get('user/sessions')
  @ApiOperation({ summary: 'Get all user sessions' })
  @ApiResponse({ status: 200, description: 'List of sessions' })
  async getUserSessions(@Req() req: any): Promise<OnboardingSession[]> {
    const userId = req.user.id;
    return this.onboardingService.getUserSessions(userId);
  }
}
