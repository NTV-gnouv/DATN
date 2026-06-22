import { apiRequest } from './api';

export type SupportedSocialPlatform = 'instagram' | 'tiktok' | 'youtube' | 'x';

export type SocialProfileLookupResult = {
  platform: SupportedSocialPlatform;
  username: string;
  exists: boolean;
  profileUrl: string;
  displayName?: string;
  avatarUrl?: string;
};

export function lookupSocialProfile(platform: SupportedSocialPlatform, username: string) {
  const normalized = username.trim().replace(/^@+/, '');
  return apiRequest<SocialProfileLookupResult>(`/social-profiles/${platform}/${encodeURIComponent(normalized)}`);
}

export function lookupSocialProfilePost(platform: SupportedSocialPlatform, username: string) {
  return apiRequest<SocialProfileLookupResult>('/social-profiles/lookup', {
    method: 'POST',
    body: JSON.stringify({ platform, username: username.trim().replace(/^@+/, '') }),
  });
}

export function lookupSocialProfilesBatch(
  profiles: Array<{ platform: SupportedSocialPlatform; username: string }>,
) {
  return apiRequest<{ results: SocialProfileLookupResult[] }>('/social-profiles/lookup/batch', {
    method: 'POST',
    body: JSON.stringify({
      profiles: profiles.map((item) => ({
        platform: item.platform,
        username: item.username.trim().replace(/^@+/, ''),
      })),
    }),
  });
}
