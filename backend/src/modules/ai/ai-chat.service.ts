import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';

import { MediaService } from '@/modules/media/media.service';
import { SocialProfilesService } from '@/modules/social-profiles/social-profiles.service';
import type { SocialProfileLookupResult, SupportedSocialPlatform } from '@/modules/social-profiles/social-profiles.types';

import { BrandProfileService } from './brand-profile.service';
import { AiChatMessage, AiChatRepository, AiChatSessionRecord } from './ai-chat.repository';
import { LandingBuilderService } from './landing-builder.service';
import { UxDesignService } from './ux-design.service';
import { normalizeDescription, normalizeOccupation, normalizePersonName } from './utils/normalize-chat-input';

type ChatStep = {
  key: string;
  inputType: 'text' | 'socials';
  getMessages: (answers: Record<string, string>) => string[];
  validate: (value: string) => boolean;
  invalidMessage: string;
};

const SOCIAL_PLATFORMS: SupportedSocialPlatform[] = ['tiktok', 'instagram', 'youtube', 'x'];

const AVATAR_PRIORITY: SupportedSocialPlatform[] = ['tiktok', 'instagram', 'youtube', 'x'];

const CHAT_STEPS: ChatStep[] = [
  {
    key: 'socials',
    inputType: 'socials',
    getMessages: () => [
      'Xin chào 👋',
      'Mình sẽ giúp bạn tạo landing page cá nhân.',
      'Hãy thêm ít nhất một tài khoản mạng xã hội',
    ],
    validate: () => true,
    invalidMessage: '',
  },
  {
    key: 'occupation',
    inputType: 'text',
    getMessages: (answers) => [
      answers.name
        ? `Rất vui được gặp bạn ${answers.name}, bạn đang làm công việc gì?`
        : 'Bạn đang làm công việc gì?',
    ],
    validate: (value) => value.trim().length >= 2,
    invalidMessage: 'Bạn mô tả ngắn công việc của mình nhé.',
  },
  {
    key: 'description',
    inputType: 'text',
    getMessages: () => [
      'Tuyệt! Hãy mô tả thêm về bản thân bạn.',
      'Ví dụ: Tôi thích thiên nhiên, tôi thích phượt, và yêu màu sắc sặc sỡ của ánh bình minh.',
    ],
    validate: (value) => value.trim().length >= 15,
    invalidMessage: 'Bạn mô tả chi tiết hơn về sở thích và phong cách của mình nhé.',
  },
];

function normalizeSocialHandle(raw: string): string {
  const trimmed = String(raw ?? '').trim();
  if (!trimmed) {
    return '';
  }
  const withoutAt = trimmed.replace(/^@+/, '');
  return withoutAt ? `@${withoutAt}` : '';
}

function formatSocialSummary(answers: Record<string, string>): string {
  const labels: Record<SupportedSocialPlatform, string> = {
    tiktok: 'TikTok',
    instagram: 'Instagram',
    youtube: 'YouTube',
    x: 'X',
  };

  const parts = SOCIAL_PLATFORMS.map((platform) => {
    const handle = answers[`social_${platform}`];
    return handle ? `${labels[platform]}: ${handle}` : '';
  }).filter(Boolean);

  return parts.length > 0 ? parts.join('\n') : 'Bỏ qua mạng xã hội';
}

function normalizeStepAnswer(key: string, value: string, answers: Record<string, string> = {}): string {
  if (key === 'name') {
    return normalizePersonName(value);
  }
  if (key === 'occupation') {
    return normalizeOccupation(value);
  }
  if (key === 'description') {
    return normalizeDescription(value, answers.name);
  }
  return value.trim();
}

function clearSocialAnswers(answers: Record<string, string>) {
  for (const platform of SOCIAL_PLATFORMS) {
    delete answers[`social_${platform}`];
  }
  delete answers.social_avatar_url;
}

function buildSocialPrefill(answers: Record<string, string>) {
  return {
    tiktok: answers.social_tiktok || '',
    instagram: answers.social_instagram || '',
    youtube: answers.social_youtube || '',
    x: answers.social_x || '',
  };
}

function cleanSocialDisplayName(raw: string): string {
  return normalizePersonName(
    String(raw ?? '')
      .replace(/\s*\(@[^)]+\)\s*on\s+X\s*$/i, '')
      .replace(/\s*\(@[^)]+\)\s*$/g, '')
      .replace(/\s*on Instagram.*$/i, '')
      .replace(/\s*•\s*Instagram.*$/i, '')
      .replace(/\s*\|\s*TikTok.*$/i, '')
      .replace(/\s*-\s*YouTube.*$/i, '')
      .trim(),
  );
}

type SocialLookupItem = {
  platform: SupportedSocialPlatform;
  handle: string;
  result: SocialProfileLookupResult;
};

function extractProfileFromLookups(
  lookupResults: SocialLookupItem[],
  handles: Partial<Record<SupportedSocialPlatform, string>>,
): { avatarUrl?: string; displayName?: string } {
  let avatarUrl = '';
  let displayName = '';

  for (const platform of AVATAR_PRIORITY) {
    const match = lookupResults.find((item) => item.platform === platform && item.result.exists);
    if (!match) {
      continue;
    }
    if (!avatarUrl && match.result.avatarUrl) {
      avatarUrl = match.result.avatarUrl;
    }
    if (!displayName && match.result.displayName) {
      displayName = cleanSocialDisplayName(match.result.displayName);
    }
    if (avatarUrl && displayName) {
      break;
    }
  }

  if (!displayName) {
    for (const platform of AVATAR_PRIORITY) {
      const handle = handles[platform];
      if (handle) {
        displayName = normalizePersonName(handle.replace(/^@+/, ''));
        break;
      }
    }
  }

  return {
    avatarUrl: avatarUrl || undefined,
    displayName: displayName || undefined,
  };
}

@Injectable()
export class AiChatService {
  private readonly logger = new Logger(AiChatService.name);

  constructor(
    private readonly aiChatRepository: AiChatRepository,
    private readonly brandProfileService: BrandProfileService,
    private readonly landingBuilderService: LandingBuilderService,
    private readonly uxDesignService: UxDesignService,
    private readonly mediaService: MediaService,
    private readonly socialProfilesService: SocialProfilesService,
  ) {}

  getCurrentInputType(currentStep: number): 'text' | 'socials' | 'none' {
    const step = CHAT_STEPS[currentStep];
    if (!step) {
      return 'none';
    }
    return step.inputType;
  }

  private buildSessionPayload(session: AiChatSessionRecord, extras: Record<string, unknown> = {}) {
    return {
      session,
      inputType: this.getCurrentInputType(session.currentStep),
      ...extras,
    };
  }

  async startChat(userId: string, username: string) {
    const firstMessages = CHAT_STEPS[0].getMessages({});
    const session = await this.aiChatRepository.create(userId, username, firstMessages);

    return {
      ...this.buildSessionPayload(session),
      newMessages: firstMessages.map((content) => this.toAssistantMessage(content)),
      awaitingInput: true,
      canGenerate: false,
    };
  }

  async getChatSession(sessionId: string) {
    const session = await this.requireSession(sessionId);
    return {
      ...this.buildSessionPayload(session),
      canGenerate: session.status === 'ready',
      styleOptions: session.styleOptions ?? [],
      awaitingStyleChoice: session.status === 'choosing_style',
    };
  }

  async sendChatMessage(sessionId: string, message: string) {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      throw new BadRequestException('Tin nhắn không được để trống.');
    }

    let session = await this.requireSession(sessionId);
    if (session.status === 'completed' || session.status === 'applied') {
      return {
        ...this.buildSessionPayload(session),
        newMessages: [this.toAssistantMessage('Landing page của bạn đã được tạo. Bạn có thể mở editor để chỉnh sửa thêm.')],
        awaitingInput: false,
        canGenerate: false,
      };
    }

    if (session.status === 'choosing_style') {
      return {
        ...this.buildSessionPayload(session),
        styleOptions: session.styleOptions ?? [],
        awaitingStyleChoice: true,
        newMessages: [this.toAssistantMessage('Hãy chọn một trong 3 kiểu giao diện để mình hoàn tất trang nhé!')],
        awaitingInput: false,
        canGenerate: false,
      };
    }

    if (session.status === 'ready') {
      return {
        ...this.buildSessionPayload(session),
        newMessages: [this.toAssistantMessage('Mình đã có đủ thông tin. Hãy bấm "Tạo trang" để mình bắt đầu nhé!')],
        awaitingInput: false,
        canGenerate: true,
      };
    }

    const step = CHAT_STEPS[session.currentStep];
    if (!step) {
      session.status = 'ready';
      session = await this.aiChatRepository.save(session);
      return {
        ...this.buildSessionPayload(session),
        newMessages: [this.toAssistantMessage('Cảm ơn bạn! Mình đã có đủ thông tin để tạo trang.')],
        awaitingInput: false,
        canGenerate: true,
      };
    }

    if (step.inputType === 'socials') {
      return {
        ...this.buildSessionPayload(session),
        newMessages: [this.toAssistantMessage('Hãy điền username mạng xã hội ở form bên dưới nhé.')],
        awaitingInput: true,
        canGenerate: false,
      };
    }

    session = await this.appendMessage(session, 'user', trimmedMessage);

    const normalizedValue = normalizeStepAnswer(step.key, trimmedMessage, session.answers);

    if (!step.validate(normalizedValue)) {
      const retryMessages = [step.invalidMessage, ...step.getMessages(session.answers)];
      session = await this.appendMessages(session, retryMessages);
      return {
        ...this.buildSessionPayload(session),
        newMessages: retryMessages.map((content) => this.toAssistantMessage(content)),
        awaitingInput: true,
        canGenerate: false,
      };
    }

    session.answers = {
      ...session.answers,
      [step.key]: normalizedValue,
    };
    session.currentStep += 1;

    const nextStep = CHAT_STEPS[session.currentStep];
    if (!nextStep) {
      session.status = 'ready';
      const readyMessages = [
        'Cảm ơn bạn! Mình đã hiểu rõ phong cách của bạn.',
        'Bấm "Tạo trang" để mình phân tích, chọn ảnh và hoàn thiện landing page cho bạn nhé ✨',
      ];
      session = await this.appendMessages(session, readyMessages);
      session = await this.aiChatRepository.save(session);
      return {
        ...this.buildSessionPayload(session),
        newMessages: readyMessages.map((content) => this.toAssistantMessage(content)),
        awaitingInput: false,
        canGenerate: true,
      };
    }

    const nextMessages = nextStep.getMessages(session.answers);
    session = await this.appendMessages(session, nextMessages);
    session = await this.aiChatRepository.save(session);

    return {
      ...this.buildSessionPayload(session),
      newMessages: nextMessages.map((content) => this.toAssistantMessage(content)),
      awaitingInput: true,
      canGenerate: false,
    };
  }

  async submitSocials(
    sessionId: string,
    payload: { tiktok?: string; instagram?: string; youtube?: string; x?: string },
  ) {
    let session = await this.requireSession(sessionId);
    const step = CHAT_STEPS[session.currentStep];

    if (session.status !== 'collecting' || step?.key !== 'socials') {
      throw new BadRequestException('Phiên chat hiện không ở bước nhập mạng xã hội.');
    }

    const handles: Partial<Record<SupportedSocialPlatform, string>> = {
      tiktok: normalizeSocialHandle(payload.tiktok ?? ''),
      instagram: normalizeSocialHandle(payload.instagram ?? ''),
      youtube: normalizeSocialHandle(payload.youtube ?? ''),
      x: normalizeSocialHandle(payload.x ?? ''),
    };

    const providedPlatforms = SOCIAL_PLATFORMS.filter((platform) => Boolean(handles[platform]));
    if (providedPlatforms.length === 0) {
      return {
        ...this.buildSessionPayload(session),
        newMessages: [],
        awaitingInput: true,
        canGenerate: false,
        formError: 'Vui lòng điền ít nhất một nền tảng mạng xã hội.',
      };
    }

    const lookupResults = await Promise.all(
      providedPlatforms.map(async (platform) => ({
        platform,
        handle: handles[platform] as string,
        result: await this.socialProfilesService.lookup(platform, handles[platform] as string),
      })),
    );

    const socialErrors: Partial<Record<SupportedSocialPlatform, string>> = {};
    for (const item of lookupResults) {
      if (!item.result.exists) {
        socialErrors[item.platform] = `Tài khoản ${item.handle} không tồn tại trên ${item.platform}.`;
      }
    }

    if (Object.keys(socialErrors).length > 0) {
      return {
        ...this.buildSessionPayload(session),
        newMessages: [],
        awaitingInput: true,
        canGenerate: false,
        socialErrors,
      };
    }

    const socialAnswers: Record<string, string> = {};
    for (const platform of SOCIAL_PLATFORMS) {
      socialAnswers[`social_${platform}`] = handles[platform] ?? '';
    }

    const profile = extractProfileFromLookups(lookupResults, handles);
    if (profile.avatarUrl) {
      profile.avatarUrl = await this.persistSocialAvatar(profile.avatarUrl, session.userId);
      socialAnswers.social_avatar_url = profile.avatarUrl;
    }

    session = await this.appendMessage(session, 'user', formatSocialSummary(socialAnswers));
    return this.completeSocialStep(session, socialAnswers, profile);
  }

  async goBack(sessionId: string) {
    const session = await this.requireSession(sessionId);

    if (
      session.status === 'completed' ||
      session.status === 'applied' ||
      session.status === 'generating' ||
      session.status === 'choosing_style'
    ) {
      throw new BadRequestException('Không thể quay lại ở trạng thái hiện tại.');
    }

    let targetStep: number;
    if (session.status === 'ready') {
      targetStep = CHAT_STEPS.length - 1;
    } else if (session.currentStep <= 0) {
      throw new BadRequestException('Bạn đang ở bước đầu tiên.');
    } else {
      targetStep = session.currentStep - 1;
    }

    const step = CHAT_STEPS[targetStep];
    if (!step) {
      throw new BadRequestException('Không thể quay lại.');
    }

    const prefillValue = session.answers[step.key] || '';
    const socialPrefill = step.inputType === 'socials' ? buildSocialPrefill(session.answers) : undefined;

    const nextAnswers = { ...session.answers };
    for (let index = targetStep; index < CHAT_STEPS.length; index += 1) {
      delete nextAnswers[CHAT_STEPS[index].key];
    }
    if (targetStep === 0) {
      clearSocialAnswers(nextAnswers);
      delete nextAnswers.name;
    }

    const nextSession = await this.aiChatRepository.save({
      ...session,
      answers: nextAnswers,
      currentStep: targetStep,
      status: 'collecting',
    });

    const backMessages = ['Bạn có thể chỉnh sửa lại thông tin nhé.', ...step.getMessages(nextSession.answers)];

    return {
      ...this.buildSessionPayload(nextSession),
      newMessages: backMessages.map((content) => this.toAssistantMessage(content)),
      awaitingInput: true,
      canGenerate: false,
      prefillValue: step.inputType === 'text' ? prefillValue : undefined,
      socialPrefill,
    };
  }

  private async completeSocialStep(
    session: AiChatSessionRecord,
    socialAnswers: Record<string, string>,
    profile: { avatarUrl?: string; displayName?: string },
  ) {
    const name = profile.displayName ? normalizePersonName(profile.displayName) : '';
    session.answers = {
      ...session.answers,
      ...socialAnswers,
      ...(name ? { name } : {}),
    };
    session.currentStep += 1;

    const nextStep = CHAT_STEPS[session.currentStep];
    if (!nextStep) {
      session.status = 'ready';
      session = await this.aiChatRepository.save(session);
      return {
        ...this.buildSessionPayload(session),
        newMessages: [this.toAssistantMessage('Mình đã có đủ thông tin để tạo trang.')],
        awaitingInput: false,
        canGenerate: true,
        avatarUrl: profile.avatarUrl,
        displayName: name || undefined,
      };
    }

    session.status = 'collecting';
    const nextMessages = nextStep.getMessages(session.answers);
    session = await this.appendMessages(session, nextMessages);
    session = await this.aiChatRepository.save(session);

    return {
      ...this.buildSessionPayload(session),
      newMessages: nextMessages.map((content) => this.toAssistantMessage(content)),
      awaitingInput: true,
      canGenerate: false,
      avatarUrl: profile.avatarUrl,
      displayName: name || undefined,
    };
  }

  async generateLandingPage(sessionId: string) {
    let session = await this.requireSession(sessionId);
    if (session.status === 'choosing_style') {
      return {
        session,
        styleOptions: session.styleOptions ?? [],
        profile: session.profile ?? null,
        newMessages: [this.toAssistantMessage('Hãy chọn một trong 3 kiểu giao diện bên dưới nhé!')],
        awaitingStyleChoice: true,
      };
    }

    if (session.status !== 'ready' && session.status !== 'collecting') {
      if (session.pageId) {
        return {
          session,
          pageId: session.pageId,
          profile: session.profile ?? null,
          newMessages: [this.toAssistantMessage('Trang của bạn đã sẵn sàng!')],
        };
      }
    }

    const { name, occupation, description } = session.answers;
    if (!name || !occupation || !description) {
      throw new BadRequestException('Chưa đủ thông tin để tạo trang.');
    }

    session.status = 'generating';
    session = await this.appendMessage(session, 'assistant', 'Mình đang phân tích thông tin và xây dựng hồ sơ thương hiệu cho bạn...');
    session = await this.aiChatRepository.save(session);

    const profile = await this.brandProfileService.generateProfile({ name, occupation, description });
    session.profile = profile as unknown as Record<string, unknown>;
    session = await this.appendMessage(session, 'assistant', 'Đang chuẩn bị 3 phương án giao diện khác nhau cho bạn lựa chọn...');
    session = await this.aiChatRepository.save(session);

    const socialHandles = {
      tiktok: session.answers.social_tiktok || '',
      instagram: session.answers.social_instagram || '',
      youtube: session.answers.social_youtube || '',
      x: session.answers.social_x || '',
    };

    const images = await this.landingBuilderService.resolveBrandImages(profile, session.userId, socialHandles);
    session.backgroundImageUrl = images.backgroundUrl;

    const { ux: baseUx, warnings: uxWarnings } = await this.uxDesignService.generateUxDesign(profile);
    const styleOptions = this.uxDesignService.generateStyleOptions(profile, {
      backgroundImageUrl: images.backgroundUrl,
      pageKey: sessionId,
      baseUx,
    });

    session.styleOptions = styleOptions.map((option) => ({
      id: option.id,
      label: option.label,
      description: option.description,
      preview: option.preview,
    }));
    session.status = 'choosing_style';
    session = await this.appendMessage(
      session,
      'assistant',
      'Mình đã chuẩn bị 3 kiểu giao diện — mỗi kiểu có nền, bóng block và avatar khác nhau. Hãy chọn kiểu bạn thích nhất!',
    );
    session = await this.aiChatRepository.save(session);

    if (uxWarnings.length) {
      this.logger.warn(`UX design warnings for session ${sessionId}: ${uxWarnings.join('; ')}`);
    }

    return {
      session,
      profile,
      styleOptions: session.styleOptions,
      baseUx,
      images,
      newMessages: [
        this.toAssistantMessage('Mình đã chuẩn bị 3 kiểu giao diện — mỗi kiểu có nền, bóng block và avatar khác nhau. Hãy chọn kiểu bạn thích nhất!'),
      ],
      awaitingStyleChoice: true,
    };
  }

  async applyStyleChoice(sessionId: string, styleOptionId: string) {
    let session = await this.requireSession(sessionId);
    if (session.status !== 'choosing_style') {
      throw new BadRequestException('Phiên chat hiện không ở bước chọn kiểu giao diện.');
    }

    const profile = session.profile as unknown as import('@/shared/types/brand-profile.types').BrandProfile | undefined;
    if (!profile?.name) {
      throw new BadRequestException('Không tìm thấy hồ sơ thương hiệu để tạo trang.');
    }

    const styleOptions = this.uxDesignService.generateStyleOptions(profile, {
      backgroundImageUrl: session.backgroundImageUrl,
      pageKey: sessionId,
    });
    const selected = styleOptions.find((option) => option.id === styleOptionId);
    if (!selected) {
      throw new BadRequestException('Kiểu giao diện không hợp lệ.');
    }

    session.status = 'generating';
    session.selectedStyleId = styleOptionId;
    session = await this.appendMessage(session, 'assistant', `Đang áp dụng kiểu "${selected.label}" và hoàn thiện landing page...`);
    session = await this.aiChatRepository.save(session);

    const built = await this.landingBuilderService.buildFromProfile(profile, session.userId, session.username, {
      avatarUrl: session.answers.social_avatar_url || undefined,
      socialHandles: {
        tiktok: session.answers.social_tiktok || '',
        instagram: session.answers.social_instagram || '',
        youtube: session.answers.social_youtube || '',
        x: session.answers.social_x || '',
      },
      uxDesign: selected.uxDesign,
    });

    session.pageId = built.pageId;
    session.status = 'completed';
    const successMessages = built.updatedExisting
      ? [
          `Xong rồi! Landing page "${profile.name}" đã được cập nhật với kiểu ${selected.label}.`,
          'Bạn có thể mở editor để tinh chỉnh thêm nhé 🎉',
        ]
      : [
          `Xong rồi! Landing page "${profile.name}" đã được tạo với kiểu ${selected.label}.`,
          'Bạn có thể mở editor để tinh chỉnh thêm nhé 🎉',
        ];
    session = await this.appendMessages(session, successMessages);
    session = await this.aiChatRepository.save(session);

    return {
      session,
      pageId: built.pageId,
      slug: built.slug,
      profile,
      uxDesign: selected.uxDesign,
      styleOptionId,
      images: built.images,
      newMessages: successMessages.map((content) => this.toAssistantMessage(content)),
    };
  }

  private async persistSocialAvatar(sourceUrl: string, ownerId: string): Promise<string> {
    if (this.mediaService.isHostedPublicUrl(sourceUrl)) {
      return sourceUrl;
    }

    try {
      return await this.mediaService.uploadFromUrl(sourceUrl, ownerId, 'avatar', 'social-avatar');
    } catch (error) {
      this.logger.warn(`Failed to upload social avatar for ${ownerId}: ${String(error)}`);
      return sourceUrl;
    }
  }

  private async requireSession(sessionId: string): Promise<AiChatSessionRecord> {
    const session = await this.aiChatRepository.get(sessionId);
    if (!session) {
      throw new NotFoundException('Phiên chat AI không tồn tại.');
    }
    return session;
  }

  private toAssistantMessage(content: string): AiChatMessage {
    return {
      role: 'assistant',
      content,
      createdAt: new Date().toISOString(),
    };
  }

  private async appendMessage(session: AiChatSessionRecord, role: AiChatMessage['role'], content: string) {
    const nextSession = {
      ...session,
      messages: [
        ...session.messages,
        {
          role,
          content,
          createdAt: new Date().toISOString(),
        },
      ],
    };
    return this.aiChatRepository.save(nextSession);
  }

  private async appendMessages(session: AiChatSessionRecord, contents: string[]) {
    let nextSession = session;
    for (const content of contents) {
      nextSession = await this.appendMessage(nextSession, 'assistant', content);
    }
    return nextSession;
  }
}
