import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { BrandProfile } from '@/shared/types/brand-profile.types';
import type { UxDesignInput, UxDesignProfile } from '@/shared/types/ux-design.types';

import { buildUxDesignPrompt } from './prompts/ux-design.prompt';
import { buildFallbackUxDesign, normalizeUxDesignProfile } from './ux-design.mapper';
import { buildStyleOptionsFromProfile, type UxStyleOption } from './ux-style-options.builder';

type GeminiGenerateContentResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message?: string;
  };
};

function extractJsonPayload(value: string): unknown {
  const trimmed = value.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    return JSON.parse(trimmed);
  }

  const fenced = trimmed.match(/```json\s*([\s\S]*?)```/i) ?? trimmed.match(/```\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return JSON.parse(fenced[1].trim());
  }

  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
  }

  throw new Error('Invalid JSON from Gemini UX design response.');
}

function brandProfileToUxInput(profile: BrandProfile): UxDesignInput {
  return {
    name: profile.name,
    occupation: profile.occupation,
    description: profile.long_bio || profile.short_bio,
    brand_style: profile.brand_style,
    personality_traits: profile.personality_traits,
    color_palette: profile.color_palette,
  };
}

@Injectable()
export class UxDesignService {
  private readonly logger = new Logger(UxDesignService.name);

  constructor(private readonly configService: ConfigService) {}

  async generateUxDesign(profile: BrandProfile): Promise<{ ux: UxDesignProfile; source: 'gemini' | 'fallback'; warnings: string[] }> {
    const input = brandProfileToUxInput(profile);
    const apiKey = this.configService.get<string>('GEMINI_API_KEY') ?? '';
    if (!apiKey) {
      return {
        ux: buildFallbackUxDesign(input),
        source: 'fallback',
        warnings: ['GEMINI_API_KEY chưa được cấu hình. Dùng UX fallback.'],
      };
    }

    const model = this.configService.get<string>('GEMINI_MODEL') ?? 'gemini-2.5-flash';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const prompt = buildUxDesignPrompt(input);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.5,
            responseMimeType: 'application/json',
          },
        }),
      });

      const data = (await response.json()) as GeminiGenerateContentResponse;
      if (!response.ok) {
        const message = data.error?.message ?? `Gemini UX trả về lỗi ${response.status}`;
        this.logger.warn(`UX design generation failed: ${message}`);
        return {
          ux: buildFallbackUxDesign(input),
          source: 'fallback',
          warnings: [message],
        };
      }

      const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('') ?? '';
      if (!text.trim()) {
        return {
          ux: buildFallbackUxDesign(input),
          source: 'fallback',
          warnings: ['Gemini không trả về nội dung UX design.'],
        };
      }

      return {
        ux: normalizeUxDesignProfile(extractJsonPayload(text), input),
        source: 'gemini',
        warnings: [],
      };
    } catch (error) {
      this.logger.warn(`UX design generation error: ${String(error)}`);
      return {
        ux: buildFallbackUxDesign(input),
        source: 'fallback',
        warnings: [error instanceof Error ? error.message : 'Lỗi không xác định khi gen UX.'],
      };
    }
  }

  generateStyleOptions(
    profile: BrandProfile,
    options: {
      backgroundImageUrl?: string;
      backgroundImageUrls?: string[];
      pageKey: string;
      baseUx?: UxDesignProfile;
    },
  ): UxStyleOption[] {
    return buildStyleOptionsFromProfile(profile, options);
  }
}
