import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { MediaService } from '@/modules/media/media.service';

type GeminiGenerateContentResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        inlineData?: {
          mimeType?: string;
          data?: string;
        };
      }>;
    };
  }>;
  error?: {
    message?: string;
  };
};

@Injectable()
export class AiBackgroundService {
  private readonly logger = new Logger(AiBackgroundService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly mediaService: MediaService,
  ) {}

  async generateBackground(prompt: string, ownerId: string) {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      throw new BadRequestException('Prompt không được để trống.');
    }

    const apiKey = this.configService.get<string>('GEMINI_API_KEY') ?? '';
    if (!apiKey) {
      throw new BadRequestException('GEMINI_API_KEY chưa được cấu hình trên server.');
    }

    const model = this.configService.get<string>('GEMINI_IMAGE_MODEL') ?? 'gemini-2.5-flash-image';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const enhancedPrompt = this.buildBackgroundPrompt(trimmedPrompt);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: enhancedPrompt }] }],
        generationConfig: {
          responseModalities: ['IMAGE'],
        },
      }),
    });

    const data = (await response.json()) as GeminiGenerateContentResponse;
    if (!response.ok) {
      const message = data.error?.message ?? `Gemini trả về lỗi ${response.status}`;
      this.logger.warn(`Gemini image generation failed: ${message}`);
      if (/quota|rate.?limit|billing/i.test(message)) {
        throw new BadRequestException(
          'Đã hết quota tạo ảnh AI trên tài khoản Gemini. Hãy bật billing hoặc thử lại sau.',
        );
      }
      throw new BadRequestException(message);
    }

    const parts = data.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find((part) => part.inlineData?.data);
    const inlineData = imagePart?.inlineData;

    if (!inlineData?.data) {
      throw new BadRequestException('AI không trả về hình ảnh. Hãy thử prompt khác.');
    }

    const mimeType = inlineData.mimeType ?? 'image/png';
    const extension = mimeType.includes('jpeg') ? 'jpg' : mimeType.includes('webp') ? 'webp' : 'png';
    const buffer = Buffer.from(inlineData.data, 'base64');

    const uploaded = await this.mediaService.upload(
      {
        originalname: `ai-background-${Date.now()}.${extension}`,
        mimetype: mimeType,
        size: buffer.length,
        buffer,
      },
      ownerId,
      'background',
    );

    return {
      imageUrl: uploaded.fileUrl,
      prompt: trimmedPrompt,
      model,
    };
  }

  private buildBackgroundPrompt(userPrompt: string) {
    return [
      'Create a high-quality vertical mobile landing page background image.',
      'Aspect ratio 9:16, full-bleed, cinematic, clean composition.',
      'No text, no watermark, no logo, no UI elements.',
      'Optimized for a link-in-bio website background behind profile content.',
      `User request: ${userPrompt}`,
    ].join(' ');
  }
}
