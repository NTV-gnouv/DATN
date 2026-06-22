import { apiRequest } from './api';

export type PlatformInsightsChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type PlatformInsightsChatRequest = {
  pageId: string;
  slug?: string;
  startDate?: string;
  endDate?: string;
  granularity?: 'hour' | 'day' | 'week' | 'month';
  messages: PlatformInsightsChatMessage[];
};

export type PlatformInsightsChatResponse = {
  reply: string;
  grounded: boolean;
  usedModel: string;
};

export function sendPlatformInsightsChat(request: PlatformInsightsChatRequest) {
  return apiRequest<PlatformInsightsChatResponse>('/analytics/insights/chat', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}
