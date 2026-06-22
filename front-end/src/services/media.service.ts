import { apiUploadRequest, getApiBaseUrl } from './api';

export type MediaUploadPurpose = 'avatar' | 'background';

export type MediaUploadResult = {
  record: {
    id: string;
    publicUrl: string;
    previewPath?: string;
    thumbPath?: string;
  };
  metadata: {
    width: number | null;
    height: number | null;
    format: string | null;
    size: number | null;
  };
  variants: Array<{
    key: 'thumb' | 'display';
    width?: number;
    height?: number;
    format: 'webp';
    filePath: string;
  }>;
  fileUrl: string;
};

export async function uploadMediaImage(file: File, purpose: MediaUploadPurpose, ownerId: string) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('purpose', purpose);
  formData.append('ownerId', ownerId);

  const result = await apiUploadRequest<MediaUploadResult>('/media/upload', {
    method: 'POST',
    body: formData,
  });

  return {
    ...result,
    fileUrl: result.fileUrl || result.record.publicUrl || `${getApiBaseUrl()}/media/${result.record.id}/file`,
  };
}