import { InternalServerErrorException, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { ImageProcessorService, type ImageUploadPurpose } from './processors/image-processor.service';
import { StorageService } from './processors/storage.service';
import { MediaRepository } from './media.repository';

type UploadFile = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    private readonly mediaRepository: MediaRepository,
    private readonly imageProcessorService: ImageProcessorService,
    private readonly storageService: StorageService,
  ) {}

  list() {
    return this.mediaRepository.list();
  }

  get(id: string) {
    return this.mediaRepository.get(id);
  }

  create(payload: Record<string, unknown>) {
    return this.mediaRepository.create(payload);
  }

  update(id: string, payload: Record<string, unknown>) {
    return this.mediaRepository.update(id, payload);
  }

  private normalizePurpose(value?: string): ImageUploadPurpose {
    return value === 'avatar' ? 'avatar' : 'background';
  }

  private normalizeOwnerId(ownerId: string) {
    return ownerId.trim().replace(/[^a-zA-Z0-9_-]/g, '_') || 'anonymous';
  }

  private inferImageReferer(sourceUrl: string): string {
    const lower = sourceUrl.toLowerCase();
    if (lower.includes('instagram') || lower.includes('cdninstagram') || lower.includes('fbcdn.net')) {
      return 'https://www.instagram.com/';
    }
    if (lower.includes('tiktok')) {
      return 'https://www.tiktok.com/';
    }
    if (lower.includes('youtube') || lower.includes('ytimg.com') || lower.includes('ggpht.com')) {
      return 'https://www.youtube.com/';
    }
    if (lower.includes('twimg.com') || lower.includes('x.com')) {
      return 'https://x.com/';
    }
    return '';
  }

  isHostedPublicUrl(sourceUrl: string): boolean {
    const publicBase = this.storageService.publicBaseUrl.replace(/\/$/, '');
    if (publicBase === 'https://cdn.local.invalid') {
      return false;
    }
    return sourceUrl.startsWith(`${publicBase}/`);
  }

  async uploadFromUrl(sourceUrl: string, ownerId: string, purposeInput?: string, filename = 'remote-image'): Promise<string> {
    const referer = this.inferImageReferer(sourceUrl);
    const response = await fetch(sourceUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        ...(referer ? { Referer: referer } : {}),
      },
    });

    if (!response.ok) {
      throw new InternalServerErrorException(`Không thể tải ảnh từ URL nguồn (${response.status}).`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get('content-type') ?? 'image/jpeg';
    const extension = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';

    const uploaded = await this.upload(
      {
        originalname: `${filename}.${extension}`,
        mimetype: contentType,
        size: buffer.length,
        buffer,
      },
      ownerId,
      purposeInput,
    );

    return uploaded.fileUrl;
  }

  async upload(file: UploadFile, ownerId: string, purposeInput?: string) {
    try {
      const safeOwnerId = this.normalizeOwnerId(ownerId);
      const purpose = this.normalizePurpose(purposeInput);
      const mediaId = `media-${Date.now()}-${randomUUID().slice(0, 8)}`;
      const objectPrefix = `users/${safeOwnerId}/media/${mediaId}`;
      const originalKey = `${objectPrefix}/original`;
      const processed = await this.imageProcessorService.processBuffer(file.buffer, purpose);

      await this.storageService.uploadObject(originalKey, file.buffer, file.mimetype);

      for (const variant of processed.variants) {
        await this.storageService.uploadObject(`${objectPrefix}/${variant.key}.webp`, variant.buffer, 'image/webp');
      }

      const record = await this.mediaRepository.create({
        ownerId: safeOwnerId,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        purpose,
        width: processed.metadata.width,
        height: processed.metadata.height,
        storageKey: originalKey,
        publicUrl: this.storageService.buildPublicUrl(originalKey),
        variants: processed.variants.reduce<Record<string, string>>((accumulator, variant) => {
          accumulator[variant.key] = this.storageService.buildPublicUrl(`${objectPrefix}/${variant.key}.webp`);
          return accumulator;
        }, {}),
      });

      return {
        record,
        metadata: processed.metadata,
        variants: processed.variants,
        fileUrl: this.storageService.buildPublicUrl(originalKey),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown upload error';
      this.logger.error(`Upload failed for owner ${ownerId}: ${message}`, error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException(`Avatar upload failed: ${message}`);
    }
  }
}
