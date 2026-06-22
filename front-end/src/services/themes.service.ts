import { apiRequest } from './api';

export type ThemeFieldDefinition = {
  key: string;
  type: 'color' | 'number' | 'select' | 'font-select' | 'box-shadow' | 'border' | 'boolean' | 'text' | 'url' | string;
  label: string;
  help?: string;
  options?: string[];
};

export type ThemeManifest = {
  id: string;
  name: string;
  version: string;
  preview?: string;
  description?: string;
  cssDefaults?: Record<string, unknown>;
  fields?: ThemeFieldDefinition[];
  layout?: string;
  sourcePath?: string;
  enabled?: boolean;
};

export async function listThemes() {
  return apiRequest<ThemeManifest[]>('/themes');
}

export async function rescanThemes() {
  return apiRequest<ThemeManifest[]>('/themes/admin/rescan', {
    method: 'POST',
    body: JSON.stringify({}),
  });
}
