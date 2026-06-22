import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { BrandProfile, BrandProfileInput } from '@/shared/types/brand-profile.types';

import { buildBrandProfilePrompt, BRAND_PROFILE_LIMITS } from './prompts/brand-profile.prompt';
import { normalizeBrandProfileInput, sanitizePersonalityTraits } from './utils/normalize-chat-input';

function truncateText(value: unknown, maxLength: number, fallback = ''): string {
  const text = String(value ?? fallback).trim();
  if (text.length <= maxLength) {
    return text;
  }

  const sliced = text.slice(0, maxLength);
  const lastSpace = sliced.lastIndexOf(' ');
  if (lastSpace > Math.floor(maxLength * 0.6)) {
    return sliced.slice(0, lastSpace).trim();
  }

  return sliced.trim();
}

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

function isHexColor(value: string): boolean {
  return /^#([0-9a-fA-F]{6})$/.test(value.trim());
}

function normalizeHex(value: unknown, fallback: string): string {
  if (typeof value !== 'string' || !isHexColor(value)) {
    return fallback;
  }
  return value.trim().toLowerCase();
}

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

  throw new BadRequestException('Gemini không trả về JSON hợp lệ.');
}

@Injectable()
export class BrandProfileService {
  private readonly logger = new Logger(BrandProfileService.name);

  constructor(private readonly configService: ConfigService) {}

  async generateProfile(input: BrandProfileInput): Promise<BrandProfile> {
    const normalizedInput = normalizeBrandProfileInput(input);
    const apiKey = this.configService.get<string>('GEMINI_API_KEY') ?? '';
    if (!apiKey) {
      throw new BadRequestException('GEMINI_API_KEY chưa được cấu hình trên server.');
    }

    const model = this.configService.get<string>('GEMINI_MODEL') ?? 'gemini-2.5-flash';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const prompt = buildBrandProfilePrompt(normalizedInput);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          responseMimeType: 'application/json',
        },
      }),
    });

    const data = (await response.json()) as GeminiGenerateContentResponse;
    if (!response.ok) {
      const message = data.error?.message ?? `Gemini trả về lỗi ${response.status}`;
      this.logger.warn(`Brand profile generation failed: ${message}`);
      throw new BadRequestException(message);
    }

    const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('') ?? '';
    if (!text.trim()) {
      throw new BadRequestException('Gemini không trả về nội dung hồ sơ.');
    }

    return this.normalizeProfile(extractJsonPayload(text), normalizedInput);
  }

  private normalizeProfile(raw: unknown, input: BrandProfileInput): BrandProfile {
    const payload = (raw ?? {}) as Record<string, unknown>;
    const palette = (payload.color_palette ?? {}) as Record<string, unknown>;
    const swatch = (value: unknown, fallbackName: string, fallbackHex: string) => {
      const item = (value ?? {}) as Record<string, unknown>;
      return {
        name: String(item.name ?? fallbackName).slice(0, 40),
        hex: normalizeHex(item.hex, fallbackHex),
      };
    };

    const galleryRaw = Array.isArray(payload.gallery) ? payload.gallery : [];
    const gallery = [0, 1, 2].map((index) => {
      const item = (galleryRaw[index] ?? {}) as Record<string, unknown>;
      return {
        title: truncateText(item.title, BRAND_PROFILE_LIMITS.galleryTitle, `Ảnh thương hiệu ${index + 1}`),
        description: truncateText(item.description, BRAND_PROFILE_LIMITS.galleryDescription, input.description),
      };
    });

    const keywordsRaw = Array.isArray(payload.image_keywords) ? payload.image_keywords : [];
    const image_keywords = keywordsRaw
      .map((item) => String(item ?? '').trim())
      .filter((item) => item.length > 0)
      .slice(0, 8);

    while (image_keywords.length < 4) {
      image_keywords.push(`${input.occupation} lifestyle`.trim());
    }

    const traitsRaw = Array.isArray(payload.personality_traits)
      ? payload.personality_traits.map((item) => String(item).trim()).filter(Boolean)
      : [];

    return {
      name: String(payload.name ?? input.name).trim() || input.name,
      occupation: String(payload.occupation ?? input.occupation).trim() || input.occupation,
      personality_traits: sanitizePersonalityTraits(traitsRaw),
      brand_style: truncateText(payload.brand_style, BRAND_PROFILE_LIMITS.brandStyle, 'Hiện đại và cá nhân hóa'),
      short_bio: truncateText(payload.short_bio, BRAND_PROFILE_LIMITS.shortBio, input.description),
      long_bio: truncateText(payload.long_bio, BRAND_PROFILE_LIMITS.longBio, input.description),
      color_palette: {
        primary: swatch(palette.primary, 'Primary', '#1d4ed8'),
        secondary_1: swatch(palette.secondary_1, 'Secondary', '#2563eb'),
        secondary_2: swatch(palette.secondary_2, 'Accent', '#22c55e'),
        contrast: swatch(palette.contrast, 'Contrast', '#0f172a'),
      },
      image_keywords,
      gallery,
    };
  }
}
