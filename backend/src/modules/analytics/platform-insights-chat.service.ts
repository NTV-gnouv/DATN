import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { buildPlatformInsightsSystemPrompt } from './prompts/platform-insights-chat.prompt';
import { PlatformInsightsContextService } from './platform-insights-context.service';
import type { PlatformInsightsChatInput } from './platform-insights.types';

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

@Injectable()
export class PlatformInsightsChatService {
  private readonly logger = new Logger(PlatformInsightsChatService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly contextService: PlatformInsightsContextService,
  ) {}

  async chat(input: PlatformInsightsChatInput) {
    const pageId = String(input.pageId ?? '').trim();
    if (!pageId) {
      throw new BadRequestException('pageId là bắt buộc.');
    }

    const messages = Array.isArray(input.messages) ? input.messages : [];
    const lastUserMessage = [...messages].reverse().find((message) => message.role === 'user');
    if (!lastUserMessage?.content?.trim()) {
      throw new BadRequestException('Tin nhắn người dùng không hợp lệ.');
    }

    const context = await this.contextService.buildContext({
      pageId,
      slug: input.slug,
      startDate: input.startDate,
      endDate: input.endDate,
      granularity: input.granularity,
    });

    const apiKey = this.configService.get<string>('GEMINI_API_KEY') ?? '';
    if (!apiKey) {
      return {
        reply: this.buildFallbackReply(context, lastUserMessage.content),
        grounded: true,
        usedModel: 'fallback',
      };
    }

    const model = this.configService.get<string>('GEMINI_MODEL') ?? 'gemini-2.5-flash';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const systemPrompt = buildPlatformInsightsSystemPrompt(context);

    const contents = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: 'Đã hiểu. Tôi sẽ chỉ trả lời dựa trên dữ liệu landing page được cung cấp.' }] },
      ...messages.slice(-12).map((message) => ({
        role: message.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: message.content }],
      })),
    ];

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.35,
            maxOutputTokens: 1024,
          },
        }),
      });

      const payload = (await response.json()) as GeminiGenerateContentResponse;
      if (!response.ok) {
        throw new Error(payload.error?.message ?? `Gemini request failed (${response.status})`);
      }

      const reply = String(payload.candidates?.[0]?.content?.parts?.[0]?.text ?? '').trim();
      if (!reply) {
        throw new Error('Gemini returned an empty response.');
      }

      return {
        reply,
        grounded: true,
        usedModel: model,
      };
    } catch (error) {
      this.logger.warn(`Platform insights chat failed: ${error instanceof Error ? error.message : String(error)}`);
      return {
        reply: this.buildFallbackReply(context, lastUserMessage.content),
        grounded: true,
        usedModel: 'fallback',
      };
    }
  }

  private buildFallbackReply(context: Awaited<ReturnType<PlatformInsightsContextService['buildContext']>>, question: string) {
    const normalized = question.toLowerCase();
    const { pageViews, contactForms, landingPage, conversionHints } = context;

    if (/tóm tắt|tong quan|overview|summary/.test(normalized)) {
      const topCountry = pageViews.countries[0];
      const topDevice = pageViews.devices[0];
      return [
        `**Tóm tắt** landing page \`/${landingPage.slug}\` (${context.dateRange.startDate} → ${context.dateRange.endDate}):`,
        `- Tổng lượt xem: **${pageViews.totalViews}**`,
        topCountry ? `- Quốc gia hàng đầu: **${topCountry.label}** (${topCountry.views} lượt xem)` : '- Chưa có dữ liệu quốc gia',
        topDevice ? `- Thiết bị hàng đầu: **${topDevice.label}** (${topDevice.views} lượt xem)` : '- Chưa có dữ liệu thiết bị',
        contactForms.totalSubmissions > 0
          ? `- Form liên hệ: **${contactForms.totalSubmissions}** submission`
          : '- Chưa có submission form liên hệ',
        conversionHints.viewsToSubmissionRate != null
          ? `- Tỷ lệ chuyển đổi view → submission: **${conversionHints.viewsToSubmissionRate}%**`
          : '',
      ]
        .filter(Boolean)
        .join('\n');
    }

    if (/quốc gia|country/.test(normalized)) {
      if (pageViews.countries.length === 0) {
        return 'Chưa có dữ liệu quốc gia trong phạm vi đã chọn.';
      }
      return pageViews.countries
        .slice(0, 6)
        .map((row) => `- **${row.label}**: ${row.views} lượt xem`)
        .join('\n');
    }

    if (/thiết bị|device|mobile|desktop/.test(normalized)) {
      if (pageViews.devices.length === 0) {
        return 'Chưa có dữ liệu thiết bị trong phạm vi đã chọn.';
      }
      return pageViews.devices.map((row) => `- **${row.label}**: ${row.views} lượt xem`).join('\n');
    }

    if (/chuyển đổi|conversion|form|submission/.test(normalized)) {
      if (!conversionHints.hasContactForm) {
        return 'Landing page chưa có block form liên hệ, nên chưa thể phân tích chuyển đổi từ form.';
      }
      return [
        `- Tổng lượt xem: **${pageViews.totalViews}**`,
        `- Tổng submission: **${contactForms.totalSubmissions}**`,
        conversionHints.viewsToSubmissionRate != null
          ? `- Tỷ lệ chuyển đổi ước tính: **${conversionHints.viewsToSubmissionRate}%**`
          : '- Chưa đủ dữ liệu để tính tỷ lệ chuyển đổi',
      ].join('\n');
    }

    return [
      `Tôi chỉ phân tích dữ liệu của landing page \`/${landingPage.slug}\` trong ShotVN.`,
      `Hiện có **${pageViews.totalViews}** lượt xem và **${contactForms.totalSubmissions}** submission form.`,
      'Bạn có thể hỏi: tóm tắt hiệu suất, quốc gia nào truy cập nhiều, thiết bị nào phổ biến, hoặc tỷ lệ chuyển đổi form.',
    ].join('\n');
  }
}
