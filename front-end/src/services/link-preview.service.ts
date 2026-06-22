import { apiRequest } from './api';

export type LinkPreviewResult = {
  url: string;
  title: string;
  description: string;
  thumbnailUrl: string;
};

export async function fetchLinkPreview(url: string) {
  return apiRequest<LinkPreviewResult>('/link-preview', {
    method: 'POST',
    body: JSON.stringify({ url }),
  });
}
