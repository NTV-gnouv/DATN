import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Public } from '@/shared/decorators/public.decorator';

import { AiBackgroundService } from './ai-background.service';
import { GenerateAiBackgroundDto } from './dto/generate-ai-background.dto';

@ApiTags('AI')
@ApiBearerAuth()
@Controller('ai/background')
export class AiBackgroundController {
  constructor(private readonly aiBackgroundService: AiBackgroundService) {}

  @Post('generate')
  @Public()
  @ApiOperation({
    summary: 'Generate AI background',
    description: 'Generate a landing page background image using Gemini image generation.',
  })
  generate(@Body() body: GenerateAiBackgroundDto) {
    return this.aiBackgroundService.generateBackground(body.prompt, body.ownerId);
  }
}
