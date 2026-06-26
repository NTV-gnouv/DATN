import { apiRequest } from './api';

export type AiChatMessage = {
  role: 'assistant' | 'user';
  content: string;
  createdAt: string;
};

export type AiChatSession = {
  id: string;
  userId: string;
  username: string;
  pageId?: string;
  status: 'collecting' | 'ready' | 'generating' | 'choosing_style' | 'completed' | 'applied';
  currentStep: number;
  answers: Record<string, string>;
  messages: AiChatMessage[];
  styleOptions?: AiChatStyleOption[];
  selectedStyleId?: string;
};

export type AiChatStyleOption = {
  id: string;
  label: string;
  description: string;
  preview: {
    themeTokens: Record<string, unknown>;
    headerPatch: Record<string, unknown>;
  };
};

export type AiChatInputType = 'text' | 'socials' | 'none';

export type AiChatStartResult = {
  session: AiChatSession;
  newMessages: AiChatMessage[];
  awaitingInput: boolean;
  canGenerate: boolean;
  inputType?: AiChatInputType;
};

export type AiChatMessageResult = {
  session: AiChatSession;
  newMessages: AiChatMessage[];
  awaitingInput: boolean;
  canGenerate: boolean;
  inputType?: AiChatInputType;
};

export type AiChatSocialSubmitResult = {
  session: AiChatSession;
  newMessages: AiChatMessage[];
  awaitingInput: boolean;
  canGenerate: boolean;
  inputType?: AiChatInputType;
  avatarUrl?: string;
  displayName?: string;
  formError?: string;
  socialErrors?: Partial<Record<'tiktok' | 'instagram' | 'youtube' | 'x', string>>;
};

export type AiChatSocialPrefill = {
  tiktok: string;
  instagram: string;
  youtube: string;
  x: string;
};

export type AiChatBackResult = {
  session: AiChatSession;
  newMessages: AiChatMessage[];
  awaitingInput: boolean;
  canGenerate: boolean;
  inputType?: AiChatInputType;
  prefillValue?: string;
  socialPrefill?: AiChatSocialPrefill;
};

export type AiChatGenerateResult = {
  session: AiChatSession;
  pageId?: string;
  slug?: string;
  profile: Record<string, unknown>;
  styleOptions?: AiChatStyleOption[];
  awaitingStyleChoice?: boolean;
  newMessages: AiChatMessage[];
};

export type AiChatApplyStyleResult = {
  session: AiChatSession;
  pageId: string;
  slug: string;
  profile: Record<string, unknown>;
  styleOptionId: string;
  newMessages: AiChatMessage[];
};

export function startAiChat(userId: string, username?: string, pageId?: string) {
  return apiRequest<AiChatStartResult>('/ai/chat/start', {
    method: 'POST',
    body: JSON.stringify({
      userId,
      username,
      ...(pageId ? { pageId } : {}),
    }),
  });
}

export function sendAiChatMessage(sessionId: string, message: string) {
  return apiRequest<AiChatMessageResult>(`/ai/chat/${encodeURIComponent(sessionId)}/message`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
}

export function submitAiChatSocials(
  sessionId: string,
  payload: {
    tiktok?: string;
    instagram?: string;
    youtube?: string;
    x?: string;
  },
) {
  const cleaned = Object.fromEntries(
    Object.entries(payload).filter(([, value]) => typeof value === 'string' && value.trim().length > 0),
  );

  return apiRequest<AiChatSocialSubmitResult>(`/ai/chat/${encodeURIComponent(sessionId)}/socials`, {
    method: 'POST',
    body: JSON.stringify(cleaned),
  });
}

export function goBackAiChat(sessionId: string) {
  return apiRequest<AiChatBackResult>(`/ai/chat/${encodeURIComponent(sessionId)}/back`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export function generateAiChatLandingPage(sessionId: string) {
  return apiRequest<AiChatGenerateResult>(`/ai/chat/${encodeURIComponent(sessionId)}/generate`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export function applyAiChatStyle(sessionId: string, styleOptionId: string) {
  return apiRequest<AiChatApplyStyleResult>(`/ai/chat/${encodeURIComponent(sessionId)}/style`, {
    method: 'POST',
    body: JSON.stringify({ styleOptionId }),
  });
}

export const AI_CHAT_SUGGESTED_DESCRIPTION =
  'Tôi thích thiên nhiên, tôi thích phượt, và yêu màu sắc sặc sỡ của ánh bình minh';
