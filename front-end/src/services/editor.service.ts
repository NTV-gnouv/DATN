import { apiRequest } from './api';
import type { HeaderBlock } from '@/models/editor.model';

export async function getDefaultThemeId() {
  return apiRequest<{ defaultThemeId: string }>('/themes/defaults/id');
}

export async function getDefaultBlockId() {
  return apiRequest<{ defaultBlockId: string }>('/blocks/defaults/id');
}

export async function getDefaultHeaderBlock() {
  return apiRequest<HeaderBlock>('/blocks/defaults/header');
}

export async function importBlockDefinition(payload: Record<string, unknown>) {
  return apiRequest<{ id: string; type: string; name: string; fields: Record<string, unknown> }>('/blocks/import', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
