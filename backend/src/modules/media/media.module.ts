import { Module } from '@nestjs/common';

import { MediaController } from './media.controller';
import { MediaRepository } from './media.repository';
import { MediaService } from './media.service';
import { ImageProcessorService } from './processors/image-processor.service';
import { StorageService } from './processors/storage.service';

@Module({
  controllers: [MediaController],
  providers: [MediaService, MediaRepository, ImageProcessorService, StorageService],
  exports: [MediaService, ImageProcessorService, StorageService],
})
export class MediaModule {}
