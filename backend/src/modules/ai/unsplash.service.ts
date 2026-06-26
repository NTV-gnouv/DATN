import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { MediaService } from '@/modules/media/media.service';

type UnsplashSearchResponse = {
  results?: Array<{
    id?: string;
    urls?: {
      regular?: string;
      full?: string;
    };
    alt_description?: string;
    description?: string;
    user?: {
      name?: string;
    };
  }>;
  errors?: string[];
};

export type UnsplashImageResult = {
  query: string;
  sourceUrl: string;
  publicUrl: string;
  alt: string;
};

@Injectable()
export class UnsplashService {
  private readonly logger = new Logger(UnsplashService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly mediaService: MediaService,
  ) {}

  private getAccessKey(): string {
    const accessKey = this.configService.get<string>('UNSPLASH_ACCESS_KEY') ?? '';
    if (!accessKey) {
      throw new BadRequestException('UNSPLASH_ACCESS_KEY chưa được cấu hình trên server.');
    }
    return accessKey;
  }

  async searchPhoto(query: string): Promise<{ sourceUrl: string; alt: string } | null> {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return null;
    }

    const accessKey = this.getAccessKey();
    const endpoint = new URL('https://api.unsplash.com/search/photos');
    endpoint.searchParams.set('query', trimmedQuery);
    endpoint.searchParams.set('per_page', '1');
    endpoint.searchParams.set('orientation', 'landscape');

    const response = await fetch(endpoint.toString(), {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
        'Accept-Version': 'v1',
      },
    });

    const data = (await response.json()) as UnsplashSearchResponse;
    if (!response.ok) {
      const message = data.errors?.join(', ') ?? `Unsplash trả về lỗi ${response.status}`;
      this.logger.warn(`Unsplash search failed for "${trimmedQuery}": ${message}`);
      return null;
    }

    const photo = data.results?.[0];
    const sourceUrl = photo?.urls?.regular ?? photo?.urls?.full ?? '';
    if (!sourceUrl) {
      return null;
    }

    return {
      sourceUrl,
      alt: photo?.alt_description ?? photo?.description ?? trimmedQuery,
    };
  }

  private async uploadFromUrl(sourceUrl: string, ownerId: string, purpose: 'avatar' | 'background', filename: string) {
    const response = await fetch(sourceUrl);
    if (!response.ok) {
      throw new BadRequestException(`Không thể tải ảnh từ Unsplash (${response.status}).`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get('content-type') ?? 'image/jpeg';
    const extension = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';

    const uploaded = await this.mediaService.upload(
      {
        originalname: `${filename}.${extension}`,
        mimetype: contentType,
        size: buffer.length,
        buffer,
      },
      ownerId,
      purpose,
    );

    return uploaded.fileUrl;
  }

  async fetchBrandImages(
    keywords: string[],
    gallery: Array<{ title: string; description: string }>,
    ownerId: string,
  ): Promise<{
    backgroundUrl: string;
    avatarUrl: string;
    galleryUrls: string[];
  }> {
    const queries = [
      keywords[0] ?? keywords.join(' '),
      keywords[1] ?? `${keywords[0] ?? 'portrait'} portrait`,
      gallery[0]?.title ?? keywords[2] ?? keywords[0] ?? 'creative',
      gallery[1]?.title ?? keywords[3] ?? keywords[0] ?? 'lifestyle',
    ];

    const uploaded: string[] = [];
    for (let index = 0; index < queries.length; index += 1) {
      const query = String(queries[index] ?? '').trim();
      const found = await this.searchPhoto(query);
      if (!found) {
        uploaded.push('');
        continue;
      }

      const purpose = index === 1 ? 'avatar' : 'background';
      try {
        const publicUrl = await this.uploadFromUrl(found.sourceUrl, ownerId, purpose, `unsplash-${index + 1}`);
        uploaded.push(publicUrl);
      } catch (error) {
        this.logger.warn(`Failed to upload Unsplash image for "${query}": ${String(error)}`);
        uploaded.push(found.sourceUrl);
      }
    }

    const fallback = uploaded.find((url) => url.length > 0) ?? '';
    return {
      backgroundUrl: uploaded[0] || fallback,
      avatarUrl: uploaded[1] || fallback,
      galleryUrls: [uploaded[2] || fallback, uploaded[3] || fallback],
    };
  }

  async fetchBackgroundVariants(
    keywords: string[],
    ownerId: string,
    count = 3,
  ): Promise<string[]> {
    const baseKeywords = keywords.map((item) => String(item ?? '').trim()).filter(Boolean);
    const fallbackQuery = baseKeywords[0] || 'creative lifestyle';
    const queries = Array.from({ length: count }, (_, index) => {
      const keyword = baseKeywords[index] ?? baseKeywords[baseKeywords.length - 1] ?? fallbackQuery;
      return index === 0 ? keyword : `${keyword} background ${index + 1}`;
    });

    const urls: string[] = [];
    const seen = new Set<string>();

    for (let index = 0; index < queries.length; index += 1) {
      const found = await this.searchPhoto(queries[index]);
      if (!found) {
        continue;
      }

      try {
        const publicUrl = await this.uploadFromUrl(
          found.sourceUrl,
          ownerId,
          'background',
          `unsplash-style-bg-${index + 1}`,
        );
        if (publicUrl && !seen.has(publicUrl)) {
          seen.add(publicUrl);
          urls.push(publicUrl);
        }
      } catch (error) {
        this.logger.warn(`Failed to upload background variant for "${queries[index]}": ${String(error)}`);
        if (found.sourceUrl && !seen.has(found.sourceUrl)) {
          seen.add(found.sourceUrl);
          urls.push(found.sourceUrl);
        }
      }
    }

    return urls;
  }
}
