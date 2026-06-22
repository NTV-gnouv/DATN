import type { HeaderBlock } from '@/models/editor.model';
import type { AiChatStyleOption } from '@/services/ai-chat.service';
import { buildPageBackgroundStyle } from '@/utils/page-background';

type StylePreviewState = {
  headerBlock: HeaderBlock;
  themeTokens: Record<string, unknown>;
};

export function mergeStyleOptionPreview(
  baseHeader: HeaderBlock,
  option: AiChatStyleOption,
  overrides?: {
    displayName?: string;
    bio?: string;
    avatarUrl?: string;
  },
): StylePreviewState {
  const patch = option.preview.headerPatch;
  const profilePatch = (patch.profile ?? {}) as Record<string, unknown>;
  const colorsPatch = (patch.colors ?? {}) as Record<string, unknown>;
  const typographyPatch = (patch.typography ?? {}) as Record<string, unknown>;
  const divLayoutPatch = (patch.divLayout ?? {}) as Record<string, unknown>;

  return {
    headerBlock: {
      ...baseHeader,
      fields: {
        ...baseHeader.fields,
        profile: {
          ...baseHeader.fields.profile,
          displayName: overrides?.displayName ?? baseHeader.fields.profile.displayName,
          bio: overrides?.bio ?? baseHeader.fields.profile.bio,
          avatarUrl: overrides?.avatarUrl ?? baseHeader.fields.profile.avatarUrl,
          avatarShape: (profilePatch.avatarShape as 'circle' | 'square' | undefined) ?? baseHeader.fields.profile.avatarShape,
          avatarDisplayStyle:
            (profilePatch.avatarDisplayStyle as HeaderBlock['fields']['profile']['avatarDisplayStyle']) ??
            baseHeader.fields.profile.avatarDisplayStyle,
          avatarSize: (profilePatch.avatarSize as number | undefined) ?? baseHeader.fields.profile.avatarSize,
          displayNameSize:
            (profilePatch.displayNameSize as number | undefined) ?? baseHeader.fields.profile.displayNameSize,
        },
        colors: {
          ...baseHeader.fields.colors,
          ...(colorsPatch as HeaderBlock['fields']['colors']),
        },
        typography: {
          ...baseHeader.fields.typography,
          ...(typographyPatch as HeaderBlock['fields']['typography']),
        },
        divLayout: {
          ...baseHeader.fields.divLayout,
          ...(divLayoutPatch as HeaderBlock['fields']['divLayout']),
        },
      },
    },
    themeTokens: option.preview.themeTokens,
  };
}

export function getStyleOptionBackgroundStyle(option: AiChatStyleOption) {
  const colorsPatch = (option.preview.headerPatch.colors ?? {}) as Record<string, unknown>;
  const pageBackground = colorsPatch.pageBackground;
  if (!pageBackground || typeof pageBackground !== 'object') {
    return {};
  }
  return buildPageBackgroundStyle(pageBackground as HeaderBlock['fields']['colors']['pageBackground']);
}

export function getStyleOptionAvatarStyle(option: AiChatStyleOption): string {
  const profilePatch = (option.preview.headerPatch.profile ?? {}) as Record<string, unknown>;
  return String(profilePatch.avatarDisplayStyle ?? profilePatch.avatarShape ?? 'circle');
}

export function getStyleOptionBlockShadow(option: AiChatStyleOption): string {
  const divLayoutPatch = (option.preview.headerPatch.divLayout ?? {}) as Record<string, unknown>;
  const shadow = divLayoutPatch.boxShadow as
    | { enabled?: boolean; x?: number; y?: number; blur?: number; spread?: number; color?: string }
    | undefined;
  if (!shadow?.enabled) {
    return 'none';
  }
  return `${shadow.x ?? 0}px ${shadow.y ?? 0}px ${shadow.blur ?? 0}px ${shadow.spread ?? 0}px ${shadow.color ?? 'rgba(0,0,0,0.15)'}`;
}

export function getStyleOptionBlockBackground(option: AiChatStyleOption): string {
  const colorsPatch = (option.preview.headerPatch.colors ?? {}) as Record<string, unknown>;
  return String(colorsPatch.contentBlockBackground ?? '#ffffff');
}
