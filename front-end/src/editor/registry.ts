import { HEADER_BLOCK_SCHEMA, SOCIAL_PLATFORMS } from './blocks';
import { AI_THEME, MINIMAL_THEME } from './themes';

export const EDITOR_REGISTRY = {
  themes: [MINIMAL_THEME, AI_THEME],
  blocks: [HEADER_BLOCK_SCHEMA],
  socialPlatforms: SOCIAL_PLATFORMS,
};
