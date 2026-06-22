import { apiRequest } from './api';

export type GenerateAiBackgroundResult = {
  imageUrl: string;
  prompt: string;
  model: string;
};

export function generateAiBackground(prompt: string, ownerId: string) {
  return apiRequest<GenerateAiBackgroundResult>('/ai/background/generate', {
    method: 'POST',
    body: JSON.stringify({ prompt, ownerId }),
  });
}

export const AI_BACKGROUND_SUGGESTED_PROMPT =
  'hãy tạo cho tôi backgroud là một hình ảnh thiên nhiên núi tuyết';
