import type { BrandProfile } from '@/shared/types/brand-profile.types';
import type { UxDesignProfile } from '@/shared/types/ux-design.types';
import {
  buildUxProfileFromPreset,
  selectDiverseStylePresetsForProfile,
  type UxStylePresetDefinition,
  type UxStyleOption,
} from '@/shared/style-presets/ux-style-presets';

import { mapUxDesignToPage } from './ux-design.mapper';

function brandProfileToUxInput(profile: BrandProfile) {
  return {
    name: profile.name,
    occupation: profile.occupation,
    description: profile.long_bio || profile.short_bio,
    brand_style: profile.brand_style,
    personality_traits: profile.personality_traits,
    color_palette: profile.color_palette,
  };
}

export function buildStyleOptionsFromProfile(
  profile: BrandProfile,
  options: { backgroundImageUrl?: string; pageKey: string; baseUx?: UxDesignProfile },
): UxStyleOption[] {
  const input = brandProfileToUxInput(profile);
  const presets = selectDiverseStylePresetsForProfile(input);

  return buildStyleOptionsForPresets(profile, presets, options);
}

export function buildStyleOptionsForPresets(
  profile: BrandProfile,
  presets: UxStylePresetDefinition[],
  options: {
    backgroundImageUrl?: string;
    backgroundImageUrls?: string[];
    pageKey: string;
    baseUx?: UxDesignProfile;
  },
): UxStyleOption[] {
  const input = brandProfileToUxInput(profile);
  const imageBackgroundUrls = [...(options.backgroundImageUrls ?? [])];
  let imageBackgroundIndex = 0;

  return presets.map((preset) => {
    const usesImageBackground = preset.overrides.background_style === 'image';
    const backgroundImageUrl = usesImageBackground
      ? imageBackgroundUrls[imageBackgroundIndex++] ?? options.backgroundImageUrl
      : options.backgroundImageUrl;
    const uxDesign = buildUxProfileFromPreset(preset, input, options.baseUx);
    const mapped = mapUxDesignToPage(uxDesign, input, {
      backgroundImageUrl,
      pageKey: `${options.pageKey}-${preset.id}`,
    });

    return {
      id: preset.id,
      label: preset.label,
      description: preset.description,
      uxDesign,
      backgroundImageUrl,
      preview: {
        themeTokens: mapped.themeTokens,
        headerPatch: mapped.headerPatch,
      },
    };
  });
}

export type { UxStyleOption };
