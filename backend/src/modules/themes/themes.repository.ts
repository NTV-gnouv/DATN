import { Injectable } from '@nestjs/common';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

import { DatabaseService } from '@/core/database/database.service';
import { normalizeJsonPayload, toJsonColumn } from '@/core/database/json-payload.util';
import { ThemeConfig } from '@/shared/types/theme.types';

export type ThemeRecord = {
  id: string;
  name: string;
  version: string;
  preview?: string;
  description?: string;
  cssDefaults?: Record<string, unknown>;
  themeTokens?: Record<string, unknown>;
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

type ThemeRow = RowDataPacket & {
  id: string;
  name: string;
  version: string;
  layout: string;
  source_path: string;
  preview: string | null;
  description: string | null;
  enabled: 0 | 1;
  css_defaults: unknown;
  theme_tokens: unknown;
  field_schema: unknown;
};

type CustomThemeRow = RowDataPacket & {
  id: string;
  page_id: string;
  name: string;
  version: string;
  is_default: 0 | 1;
  is_active: 0 | 1;
  config: unknown;
  created_at: Date;
  updated_at: Date;
};

@Injectable()
export class ThemesRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  private readonly defaultThemeId = 'minimal';

  private mapThemeRow(row: ThemeRow): ThemeRecord {
    return {
      id: row.id,
      name: row.name,
      version: row.version,
      layout: row.layout,
      sourcePath: row.source_path,
      ...(row.preview ? { preview: row.preview } : {}),
      ...(row.description ? { description: row.description } : {}),
      enabled: row.enabled === 1,
      ...(row.css_defaults ? { cssDefaults: normalizeJsonPayload(row.css_defaults) } : {}),
      ...(row.theme_tokens ? { themeTokens: normalizeJsonPayload(row.theme_tokens) } : {}),
      ...(row.field_schema
        ? { fields: normalizeJsonPayload(row.field_schema) as unknown as ThemeRecord['fields'] }
        : {}),
    };
  }

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
    await this.databaseService.execute(
      `INSERT INTO themes (id, name, version, layout, source_path, preview, description, enabled, css_defaults, field_schema)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
      [
        record.id,
        record.name,
        record.version,
        record.layout,
        record.sourcePath,
        record.preview ?? null,
        record.description ?? null,
        toJsonColumn(record.cssDefaults ?? null),
        toJsonColumn(record.fields ?? null),
      ],
    );
  }

  async list() {
    await this.ensureDefaultTheme();
    const [rows] = await this.databaseService.execute<ThemeRow[]>(
      `SELECT id, name, version, layout, source_path, preview, description, enabled, css_defaults, theme_tokens, field_schema
       FROM themes ORDER BY name ASC`,
    );
    return rows.map((row) => this.mapThemeRow(row));
  }

  async get(id: string) {
    const [rows] = await this.databaseService.execute<ThemeRow[]>(
      `SELECT id, name, version, layout, source_path, preview, description, enabled, css_defaults, theme_tokens, field_schema
       FROM themes WHERE id = ? LIMIT 1`,
      [id],
    );
    const row = rows[0];
    return row ? this.mapThemeRow(row) : null;
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

    await this.databaseService.execute(
      `INSERT INTO themes (id, name, version, layout, source_path, enabled)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, record.name, record.version, record.layout, record.sourcePath, record.enabled ? 1 : 0],
    );

    return record;
  }

  async update(id: string, payload: Record<string, unknown>) {
    const current = await this.get(id);
    if (!current) {
      return null;
    }

    const next: ThemeRecord = {
      ...current,
      ...payload,
      id: current.id,
    } as ThemeRecord;

    await this.databaseService.execute(
      `UPDATE themes
       SET name = ?, version = ?, layout = ?, source_path = ?, preview = ?, description = ?, enabled = ?, css_defaults = ?, theme_tokens = ?, field_schema = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        next.name,
        next.version,
        next.layout,
        next.sourcePath,
        next.preview ?? null,
        next.description ?? null,
        next.enabled ? 1 : 0,
        toJsonColumn(next.cssDefaults ?? null),
        toJsonColumn(next.themeTokens ?? null),
        toJsonColumn(next.fields ?? null),
        id,
      ],
    );

    return next;
  }

  async replaceAll(items: ThemeRecord[]): Promise<void> {
    for (const item of items) {
      await this.databaseService.execute(
        `INSERT INTO themes (id, name, version, layout, source_path, preview, description, enabled, css_defaults, theme_tokens, field_schema)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           version = VALUES(version),
           layout = VALUES(layout),
           source_path = VALUES(source_path),
           preview = VALUES(preview),
           description = VALUES(description),
           enabled = VALUES(enabled),
           css_defaults = VALUES(css_defaults),
           theme_tokens = VALUES(theme_tokens),
           field_schema = VALUES(field_schema),
           updated_at = CURRENT_TIMESTAMP`,
        [
          item.id,
          item.name,
          item.version,
          item.layout,
          item.sourcePath,
          item.preview ?? null,
          item.description ?? null,
          item.enabled ? 1 : 0,
          toJsonColumn(item.cssDefaults ?? null),
          toJsonColumn(item.themeTokens ?? null),
          toJsonColumn(item.fields ?? null),
        ],
      );
    }
  }

  async remove(id: string): Promise<{ removed: boolean; id: string }> {
    const [result] = await this.databaseService.execute<ResultSetHeader>(`DELETE FROM themes WHERE id = ?`, [id]);
    return { removed: result.affectedRows > 0, id };
  }

  async createCustomTheme(themeConfig: ThemeConfig): Promise<ThemeConfig> {
    const id = `custom-theme-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const configData = {
      ...themeConfig,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.databaseService.execute(
      `INSERT INTO custom_themes (id, page_id, name, version, is_default, is_active, config)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        themeConfig.pageId,
        themeConfig.name,
        themeConfig.version,
        themeConfig.isDefault ? 1 : 0,
        themeConfig.isActive ? 1 : 0,
        JSON.stringify(configData),
      ],
    );

    return configData;
  }

  async getCustomTheme(id: string): Promise<ThemeConfig | null> {
    const [rows] = await this.databaseService.execute<CustomThemeRow[]>(
      `SELECT id, page_id, name, version, is_default, is_active, config, created_at, updated_at
       FROM custom_themes WHERE id = ? LIMIT 1`,
      [id],
    );
    const row = rows[0];
    if (!row) {
      return null;
    }

    const config = normalizeJsonPayload(row.config) as unknown as ThemeConfig;
    return config;
  }

  async listCustomThemesByPage(pageId: string): Promise<ThemeConfig[]> {
    const [rows] = await this.databaseService.execute<CustomThemeRow[]>(
      `SELECT id, page_id, name, version, is_default, is_active, config, created_at, updated_at
       FROM custom_themes WHERE page_id = ? ORDER BY updated_at DESC`,
      [pageId],
    );

    return rows.map((row) => normalizeJsonPayload(row.config) as unknown as ThemeConfig);
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

    await this.databaseService.execute(
      `UPDATE custom_themes
       SET name = ?, version = ?, is_default = ?, is_active = ?, config = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        updated.name,
        updated.version,
        updated.isDefault ? 1 : 0,
        updated.isActive ? 1 : 0,
        JSON.stringify(updated),
        id,
      ],
    );

    return updated;
  }

  async deleteCustomTheme(id: string): Promise<boolean> {
    const [result] = await this.databaseService.execute<ResultSetHeader>(
      `DELETE FROM custom_themes WHERE id = ?`,
      [id],
    );
    return result.affectedRows > 0;
  }
}
