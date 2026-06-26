"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateThemeDto = exports.UpdateThemeDto = exports.CreateThemeDto = exports.ThemesRepository = exports.ThemeCustomizerService = exports.ThemesService = exports.getAlternativePalettes = exports.getDefaultPaletteForIndustry = exports.AVAILABLE_FONTS = exports.THEME_TEMPLATES = exports.INDUSTRY_COLOR_PALETTES = void 0;
__exportStar(require("../../shared/types/theme.types"), exports);
var theme_presets_1 = require("./theme.presets");
Object.defineProperty(exports, "INDUSTRY_COLOR_PALETTES", { enumerable: true, get: function () { return theme_presets_1.INDUSTRY_COLOR_PALETTES; } });
Object.defineProperty(exports, "THEME_TEMPLATES", { enumerable: true, get: function () { return theme_presets_1.THEME_TEMPLATES; } });
Object.defineProperty(exports, "AVAILABLE_FONTS", { enumerable: true, get: function () { return theme_presets_1.AVAILABLE_FONTS; } });
Object.defineProperty(exports, "getDefaultPaletteForIndustry", { enumerable: true, get: function () { return theme_presets_1.getDefaultPaletteForIndustry; } });
Object.defineProperty(exports, "getAlternativePalettes", { enumerable: true, get: function () { return theme_presets_1.getAlternativePalettes; } });
var themes_service_1 = require("./themes.service");
Object.defineProperty(exports, "ThemesService", { enumerable: true, get: function () { return themes_service_1.ThemesService; } });
var theme_customizer_service_1 = require("./theme-customizer.service");
Object.defineProperty(exports, "ThemeCustomizerService", { enumerable: true, get: function () { return theme_customizer_service_1.ThemeCustomizerService; } });
var themes_repository_1 = require("./themes.repository");
Object.defineProperty(exports, "ThemesRepository", { enumerable: true, get: function () { return themes_repository_1.ThemesRepository; } });
var theme_dto_1 = require("./dto/theme.dto");
Object.defineProperty(exports, "CreateThemeDto", { enumerable: true, get: function () { return theme_dto_1.CreateThemeDto; } });
Object.defineProperty(exports, "UpdateThemeDto", { enumerable: true, get: function () { return theme_dto_1.UpdateThemeDto; } });
Object.defineProperty(exports, "GenerateThemeDto", { enumerable: true, get: function () { return theme_dto_1.GenerateThemeDto; } });
