import { BadRequestException, Body, Controller, Get, Param, Patch, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

import { Public } from '@/shared/decorators/public.decorator';

import { MediaService } from './media.service';

type UploadFile = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

@ApiTags('Media')
@ApiBearerAuth()
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  @ApiOperation({ summary: 'List media', description: 'Return all uploaded media records.' })
  list() {
    return this.mediaService.list();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get media item', description: 'Return one media record by ID.' })
  get(@Param('id') id: string) {
    return this.mediaService.get(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create media record', description: 'Create a media metadata record.' })
  @ApiBody({ description: 'Media payload' })
  create(@Body() body: Record<string, unknown>) {
    return this.mediaService.create(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update media record', description: 'Update a media metadata record by ID.' })
  @ApiBody({ description: 'Media update payload' })
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.mediaService.update(id, body);
  }

  @Post('upload')
  @Public()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload image', description: 'Upload an image, resize it, and persist media metadata.' })
  @ApiBody({ description: 'Multipart image upload payload' })
  upload(@UploadedFile() file: UploadFile | undefined, @Body() body: { ownerId?: string; purpose?: string }) {
    if (!file) {
      throw new BadRequestException('File upload is required.');
    }

    if (!body.ownerId) {
      throw new BadRequestException('Owner id is required.');
    }

    return this.mediaService.upload(file, body.ownerId, body.purpose);
  }

  @Get(':id/file')
  @Public()
  @ApiOperation({ summary: 'Get media file', description: 'Redirect to the CDN URL for the media record.' })
  async file(@Param('id') id: string, @Res({ passthrough: true }) response: Response) {
    const record = await this.mediaService.get(id);

    if (!record) {
      throw new BadRequestException('Media record not found.');
    }

    response.redirect(record.publicUrl);
  }
}