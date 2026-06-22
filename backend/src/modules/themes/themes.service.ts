import { Injectable } from '@nestjs/common';

import { ThemeLoaderService } from './runtime/theme-loader.service';
import { ThemesRepository } from './themes.repository';
import { ThemeCustomizerService } from './theme-customizer.service';
import { ThemeConfig, ThemeGenerationInput, ThemeGenerationResult, ThemeCustomizationRequest } from '@/shared/types/theme.types';

@Injectable()
export class ThemesService {
  constructor(
    private readonly themesRepository: ThemesRepository,
    private readonly themeLoaderService: ThemeLoaderService,
    private readonly customizer: ThemeCustomizerService,
  ) {}

  list() {
    return this.themesRepository.list();
  }

  get(id: string) {
    return this.themesRepository.get(id);
  }

  getDefaultId() {
    return this.themesRepository.getDefaultId();
  }

  create(payload: Record<string, unknown>) {
    return this.themesRepository.create(payload);
  }

  update(id: string, payload: Record<string, unknown>) {
    return this.themesRepository.update(id, payload);
  }

  rescan(baseDir?: string) {
    return this.themeLoaderService.scanAndLoad(baseDir);
  }

  enable(id: string) {
    return this.themesRepository.update(id, { enabled: true });
  }

  disable(id: string) {
    return this.themesRepository.update(id, { enabled: false });
  }

  remove(id: string) {
    return this.themesRepository.remove(id);
  }

  // Custom theme methods
  async generateThemeFromProfile(input: ThemeGenerationInput): Promise<ThemeGenerationResult> {
    return this.customizer.generateThemeFromProfile(input);
  }

  async customizeTheme(theme: ThemeConfig, customization: ThemeCustomizationRequest): Promise<ThemeConfig> {
    return this.customizer.customizeTheme(theme, customization);
  }

  generateThemeCSS(theme: ThemeConfig): string {
    return this.customizer.generateThemeCSS(theme);
  }

  async saveTheme(pageId: string, themeConfig: ThemeConfig): Promise<ThemeConfig> {
    return this.customizer.saveTheme(pageId, themeConfig);
  }

  async updateTheme(id: string, updates: Partial<ThemeConfig>): Promise<ThemeConfig | null> {
    return this.customizer.updateTheme(id, updates);
  }

  async getTheme(id: string): Promise<ThemeConfig | null> {
    return this.customizer.getTheme(id);
  }

  async listThemesForPage(pageId: string): Promise<ThemeConfig[]> {
    return this.customizer.listThemesForPage(pageId);
  }

  async deleteTheme(id: string): Promise<boolean> {
    return this.customizer.deleteTheme(id);
  }
}
