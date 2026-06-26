"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildStyleOptionsFromProfile = buildStyleOptionsFromProfile;
exports.buildStyleOptionsForPresets = buildStyleOptionsForPresets;
const ux_style_presets_1 = require("../../shared/style-presets/ux-style-presets");
const ux_design_mapper_1 = require("./ux-design.mapper");
function brandProfileToUxInput(profile) {
    return {
        name: profile.name,
        occupation: profile.occupation,
        description: profile.long_bio || profile.short_bio,
        brand_style: profile.brand_style,
        personality_traits: profile.personality_traits,
        color_palette: profile.color_palette,
    };
}
function buildStyleOptionsFromProfile(profile, options) {
    const input = brandProfileToUxInput(profile);
    const presets = (0, ux_style_presets_1.selectDiverseStylePresetsForProfile)(input);
    return buildStyleOptionsForPresets(profile, presets, options);
}
function buildStyleOptionsForPresets(profile, presets, options) {
    const input = brandProfileToUxInput(profile);
    const imageBackgroundUrls = [...(options.backgroundImageUrls ?? [])];
    let imageBackgroundIndex = 0;
    return presets.map((preset) => {
        const usesImageBackground = preset.overrides.background_style === 'image';
        const backgroundImageUrl = usesImageBackground
            ? imageBackgroundUrls[imageBackgroundIndex++] ?? options.backgroundImageUrl
            : options.backgroundImageUrl;
        const uxDesign = (0, ux_style_presets_1.buildUxProfileFromPreset)(preset, input, options.baseUx);
        const mapped = (0, ux_design_mapper_1.mapUxDesignToPage)(uxDesign, input, {
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
