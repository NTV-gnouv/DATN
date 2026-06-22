import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Public } from '@/shared/decorators/public.decorator';

import { LinkPreviewService } from './link-preview.service';

@ApiTags('Link Preview')
@ApiBearerAuth()
@Controller('link-preview')
export class LinkPreviewController {
  constructor(private readonly service: LinkPreviewService) {}

  @Post()
  @Public()
  @ApiOperation({ summary: 'Fetch link metadata', description: 'Extract title, description and thumbnail from a URL.' })
  @ApiBody({ schema: { properties: { url: { type: 'string' } } } })
  preview(@Body() body: { url?: string }) {
    if (!body.url?.trim()) {
      throw new BadRequestException('URL là bắt buộc.');
    }
    return this.service.preview(body.url);
  }
}
