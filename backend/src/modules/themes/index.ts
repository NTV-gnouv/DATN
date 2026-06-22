// Export all theme types
export * from '@/shared/types/theme.types';

// Export theme presets and utilities
export {
  INDUSTRY_COLOR_PALETTES,
  THEME_TEMPLATES,
  AVAILABLE_FONTS,
  getDefaultPaletteForIndustry,
  getAlternativePalettes,
} from './theme.presets';

// Export services
export { ThemesService } from './themes.service';
export { ThemeCustomizerService } from './theme-customizer.service';
export { ThemesRepository } from './themes.repository';

// Export DTOs
export { CreateThemeDto, UpdateThemeDto, GenerateThemeDto } from './dto/theme.dto';
