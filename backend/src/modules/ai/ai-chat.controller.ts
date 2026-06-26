import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { Public } from '@/shared/decorators/public.decorator';

import { SubmitAiChatSocialsDto } from './dto/submit-ai-chat-socials.dto';
import { ApplyAiChatStyleDto } from './dto/apply-ai-chat-style.dto';
import { AiChatService } from './ai-chat.service';

export class StartAiChatDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  pageId?: string;
}

export class SendAiChatMessageDto {
  @IsString()
  @IsNotEmpty()
  message!: string;
}

@ApiTags('AI Chat')
@ApiBearerAuth()
@Controller('ai/chat')
export class AiChatController {
  constructor(private readonly aiChatService: AiChatService) {}

  @Post('start')
  @Public()
  @ApiOperation({ summary: 'Start AI chat onboarding session' })
  start(@Body() body: StartAiChatDto) {
    return this.aiChatService.startChat(
      body.userId,
      body.username?.trim() || body.userId,
      body.pageId?.trim() || undefined,
    );
  }

  @Get(':sessionId')
  @Public()
  @ApiOperation({ summary: 'Get AI chat session' })
  getSession(@Param('sessionId') sessionId: string) {
    return this.aiChatService.getChatSession(sessionId);
  }

  @Post(':sessionId/message')
  @Public()
  @ApiOperation({ summary: 'Send user message in AI chat onboarding' })
  sendMessage(@Param('sessionId') sessionId: string, @Body() body: SendAiChatMessageDto) {
    return this.aiChatService.sendChatMessage(sessionId, body.message);
  }

  @Post(':sessionId/socials')
  @Public()
  @ApiOperation({ summary: 'Submit social media usernames in AI chat onboarding' })
  submitSocials(@Param('sessionId') sessionId: string, @Body() body: SubmitAiChatSocialsDto) {
    return this.aiChatService.submitSocials(sessionId, body);
  }

  @Post(':sessionId/back')
  @Public()
  @ApiOperation({ summary: 'Go back to previous AI chat onboarding step' })
  goBack(@Param('sessionId') sessionId: string) {
    return this.aiChatService.goBack(sessionId);
  }

  @Post(':sessionId/generate')
  @Public()
  @ApiOperation({ summary: 'Generate landing page from collected chat answers' })
  generate(@Param('sessionId') sessionId: string) {
    return this.aiChatService.generateLandingPage(sessionId);
  }

  @Post(':sessionId/style')
  @Public()
  @ApiOperation({ summary: 'Apply selected AI style option and build landing page' })
  applyStyle(@Param('sessionId') sessionId: string, @Body() body: ApplyAiChatStyleDto) {
    return this.aiChatService.applyStyleChoice(sessionId, body.styleOptionId);
  }
}
