import { Injectable, Logger } from '@nestjs/common';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import * as sharp from 'sharp';

export type ImageVariant = {
  key: 'thumb' | 'display';
  width?: number;
  height?: number;
  format: 'webp';
  filePath: string;
};

export type ImageUploadPurpose = 'avatar' | 'background';

export type ImageProcessingResult = {
  originalPath: string;
  variants: ImageVariant[];
};

export type ImageBufferVariant = {
  key: 'thumb' | 'display';
  width?: number;
  height?: number;
  format: 'webp';
  buffer: Buffer;
};

export type ImageBufferProcessingResult = {
  metadata: {
    width: number | null;
    height: number | null;
    format: string | null;
    size: number | null;
  };
  variants: ImageBufferVariant[];
};

@Injectable()
export class ImageProcessorService {
  private readonly logger = new Logger(ImageProcessorService.name);

  private buildVariantSpecs(purpose: ImageUploadPurpose) {
    return purpose === 'avatar'
      ? [
          { key: 'thumb' as const, width: 160, height: 160 },
          { key: 'display' as const, width: 512, height: 512 },
        ]
      : [
          { key: 'thumb' as const, width: 960, height: undefined },
          { key: 'display' as const, width: 1920, height: undefined },
        ];
  }

  async processBuffer(inputBuffer: Buffer, purpose: ImageUploadPurpose = 'background'): Promise<ImageBufferProcessingResult> {
    const metadata = await sharp(inputBuffer).metadata();
    const pipeline = sharp(inputBuffer).rotate();
    const specs = this.buildVariantSpecs(purpose);

    const variants: ImageBufferVariant[] = [];

    for (const spec of specs) {
      const fit = purpose === 'avatar' ? 'cover' : 'inside';
      const buffer = await pipeline
        .clone()
        .resize({
          width: spec.width,
          height: spec.height,
          withoutEnlargement: true,
          fit,
          position: 'centre',
        })
        .flatten({ background: '#ffffff' })
        .webp({ quality: purpose === 'avatar' ? 86 : 82 })
        .toBuffer();

      variants.push({
        key: spec.key,
        width: spec.width,
        height: spec.height,
        format: 'webp',
        buffer,
      });
    }

    return {
      metadata: {
        width: metadata.width ?? null,
        height: metadata.height ?? null,
        format: metadata.format ?? null,
        size: metadata.size ?? null,
      },
      variants,
    };
  }

  async generateVariants(
    inputPath: string,
    outputDir = join(process.cwd(), 'uploads', 'generated'),
    purpose: ImageUploadPurpose = 'background',
  ): Promise<ImageProcessingResult> {
    await mkdir(outputDir, { recursive: true });

    const sourceBuffer = await readFile(inputPath);
    const specResults = await this.processBuffer(sourceBuffer, purpose);
    const variants: ImageVariant[] = specResults.variants.map((variant) => ({
      key: variant.key,
      width: variant.width,
      height: variant.height,
      format: variant.format,
      filePath: join(outputDir, `${variant.key}.webp`),
    }));

    for (const variant of specResults.variants) {
      const targetPath = join(outputDir, `${variant.key}.webp`);
      await writeFile(targetPath, variant.buffer);
    }

    this.logger.log(`Generated ${variants.length} image variants for ${inputPath}`);

    return {
      originalPath: inputPath,
      variants,
    };
  }

  async extractMetadata(inputPath: string) {
    const metadata = await sharp(await readFile(inputPath)).metadata();
    return {
      width: metadata.width ?? null,
      height: metadata.height ?? null,
      format: metadata.format ?? null,
      size: metadata.size ?? null,
    };
  }

  async optimizeBuffer(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer)
      .rotate()
      .webp({ quality: 82 })
      .toBuffer();
  }
}
