import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@/core/database/database.service';
import { ThemeConfig } from '@/shared/types/theme.types';

export type ThemeRecord = {
  id: string;
  name: string;
  version: string;
  preview?: string;
  description?: string;
  cssDefaults?: Record<string, unknown>;
  fields?: Array<{
    key: string;
    type: string;
    label: string;
    help?: string;
    options?: string[];
  }>;
  layout: string;
  sourcePath: string;
  enabled: boolean;
};

@Injectable()
export class ThemesRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  private readonly entityName = 'themes';
  private readonly customThemeEntity = 'custom_themes';
  private readonly defaultThemeId = 'minimal';

  private buildDefaultTheme(): ThemeRecord {
    return {
      id: this.defaultThemeId,
      name: 'Minimal Theme',
      version: '1.0.0',
      preview: 'preview.png',
      description: 'Default minimal theme used by the editor.',
      cssDefaults: {
        colors: {
          headerTextAndIcon: '#0f172a',
          socialBlockBackground: '#ffffff',
          socialBlockText: '#0f172a',
          contentBlockBackground: '#ffffff',
          contentBlockText: '#0f172a',
          contentBlockButton: '#111827',
        },
        divLayout: {
          widthPercent: 92,
          border: { width: 1, style: 'solid', color: '#e6eef9', radius: 8 },
          boxShadow: { enabled: true, x: 0, y: 6, blur: 18, spread: 0, color: 'rgba(16,24,40,0.06)' },
        },
        typography: { fontFamily: 'Inter' },
      },
      fields: [
        { key: 'typography.fontFamily', type: 'font-select', label: 'Font chữ', options: ['Inter', 'Roboto', 'Poppins', 'Montserrat', 'Lora', 'Playfair Display', 'Noto Sans', 'System'] },
        { key: 'divLayout.widthPercent', type: 'number', label: 'Chiều ngang (%)' },
        { key: 'divLayout.border.width', type: 'number', label: 'Chiều rộng border (px)' },
        { key: 'divLayout.border.color', type: 'color', label: 'Màu border' },
        { key: 'divLayout.border.radius', type: 'number', label: 'Border radius' },
        { key: 'divLayout.boxShadow.enabled', type: 'boolean', label: 'Shadow mặc định theo theme' },
        { key: 'colors.headerTextAndIcon', type: 'color', label: 'Tiêu đề & biểu tượng' },
        { key: 'colors.socialBlockBackground', type: 'color', label: 'Nền khối social' },
        { key: 'colors.socialBlockText', type: 'color', label: 'Chữ khối social' },
      ],
      layout: 'default',
      sourcePath: 'themes/minimal-theme/theme.json',
      enabled: true,
    };
  }

  private async ensureDefaultTheme(): Promise<void> {
    const current = await this.get(this.defaultThemeId);
    if (current) {
      return;
    }

    const record = this.buildDefaultTheme();
    await this.databaseService.writeRecord(this.entityName, record.id, record as unknown as Record<string, unknown>);
  }

  async list() {
    await this.ensureDefaultTheme();
    const records = await this.databaseService.readEntity(this.entityName);
    return records.map((record) => record.data as ThemeRecord);
  }

  async get(id: string) {
    return (await this.databaseService.readRecord(this.entityName, id)) as ThemeRecord | null;
  }

  async getDefaultId() {
    await this.ensureDefaultTheme();
    return { defaultThemeId: this.defaultThemeId };
  }

  async create(payload: Record<string, unknown>) {
    const id = `theme-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const record: ThemeRecord = {
      id,
      name: String(payload.name ?? id),
      version: String(payload.version ?? '1.0.0'),
      layout: String(payload.layout ?? 'default'),
      sourcePath: String(payload.sourcePath ?? ''),
      enabled: Boolean(payload.enabled ?? true),
    };
    await this.databaseService.writeRecord(this.entityName, id, record);
    return record;
  }

  async update(id: string, payload: Record<string, unknown>) {
    const current = (await this.get(id)) as ThemeRecord | null;
    if (!current) {
      return null;
    }

    const next: ThemeRecord = {
      ...current,
      ...payload,
      id: current.id,
    } as ThemeRecord;
    await this.databaseService.writeRecord(this.entityName, id, next);

    return next;
  }

  async replaceAll(items: ThemeRecord[]): Promise<void> {
    await Promise.all(items.map((item) => this.databaseService.writeRecord(this.entityName, item.id, item)));
  }

  async remove(id: string): Promise<{ removed: boolean; id: string }> {
    return { removed: await this.databaseService.deleteRecord(this.entityName, id), id };
  }

  // Custom theme methods
  async createCustomTheme(themeConfig: ThemeConfig): Promise<ThemeConfig> {
    const id = `custom-theme-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const configData = {
      ...themeConfig,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await this.databaseService.writeRecord(this.customThemeEntity, id, configData as unknown as Record<string, unknown>);
    return configData;
  }

  async getCustomTheme(id: string): Promise<ThemeConfig | null> {
    return (await this.databaseService.readRecord(this.customThemeEntity, id)) as ThemeConfig | null;
  }

  async listCustomThemesByPage(pageId: string): Promise<ThemeConfig[]> {
    const records = await this.databaseService.readEntity(this.customThemeEntity);
    return records
      .map((record) => record.data as ThemeConfig)
      .filter((theme) => theme.pageId === pageId);
  }

  async updateCustomTheme(id: string, updates: Partial<ThemeConfig>): Promise<ThemeConfig | null> {
    const current = await this.getCustomTheme(id);
    if (!current) {
      return null;
    }

    const updated: ThemeConfig = {
      ...current,
      ...updates,
      id: current.id,
      pageId: current.pageId,
      createdAt: current.createdAt,
      updatedAt: new Date(),
    };
    await this.databaseService.writeRecord(this.customThemeEntity, id, updated as unknown as Record<string, unknown>);
    return updated;
  }

  async deleteCustomTheme(id: string): Promise<boolean> {
    return await this.databaseService.deleteRecord(this.customThemeEntity, id);
  }
}
