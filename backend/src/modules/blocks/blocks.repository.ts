import { Injectable } from '@nestjs/common';

import { DatabaseService } from '@/core/database/database.service';

export type HeaderBlockRecord = {
  id: string;
  type: 'header';
  name: string;
  version: string;
  isDefault: boolean;
  fields: {
    profile: {
      avatarUrl: string;
      displayName: string;
      bio: string;
          avatarShape: 'circle' | 'square';
          avatarDisplayStyle?: 'circle' | 'square' | 'arched' | 'ring' | 'horizontal';
          avatarSize: number;
          displayNameSize?: number;
    };
    theme: {
      defaultThemeId: string;
    };
    layout: {
      mode: string;
      config: Record<string, unknown>;
    };
    colors: {
      pageBackground: {
        mode: 'solid' | 'gradient' | 'image';
        solid: string;
        gradient: {
          start: string;
          end: string;
          type: 'linear' | 'radial' | 'diagonal';
        };
        imageUrl: string;
      };
      headerTextAndIcon: string;
      socialBlockBackground: string;
      socialBlockText: string;
      contentBlockBackground: string;
      contentBlockText: string;
      contentBlockButton: string;
    };
    typography: {
      fontFamily: string;
      displayFontFamily?: string;
      bodyFontFamily?: string;
      fontPairingId?: string;
      fontSize: number;
      fontWeight: number;
      headingSize?: number;
      headingWeight?: number;
      headingLetterSpacing?: number;
      headingTransform?: 'none' | 'uppercase';
      lineHeight?: number;
    };
    socials: {
      iconSize: number;
      displayMode: 'icons' | 'buttons' | 'both' | 'icon-only';
      items: Array<{
        platform: string;
        url: string;
        iconUrl: string;
      }>;
      customFaviconEnabled: boolean;
    };
    divLayout: {
      widthPercent: number;
      border: {
        width: number;
        style: 'solid' | 'dashed' | 'none';
        color: string;
        radius: number;
      };
      boxShadow: {
        enabled: boolean;
        x: number;
        y: number;
        blur: number;
        spread: number;
        color: string;
      };
    };
  };
  createdAt: string;
  updatedAt: string;
};

@Injectable()
export class BlocksRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  private readonly entityName = 'blocks';
  private readonly defaultHeaderBlockId = 'block-header-default';

  private readonly socialPlatforms = ['TikTok', 'Instagram', 'YouTube', 'X'];

  private normalizeId(value: string) {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private buildDefaultHeaderBlock(): HeaderBlockRecord {
    const now = new Date().toISOString();
    return {
      id: this.defaultHeaderBlockId,
      type: 'header',
      name: 'header',
      version: '1.0.0',
      isDefault: true,
      fields: {
        profile: {
          avatarUrl: '',
          displayName: '',
          bio: '',
          avatarShape: 'circle',
          avatarDisplayStyle: 'circle',
          avatarSize: 32,
          displayNameSize: 100,
        },
        theme: {
          defaultThemeId: 'minimal',
        },
        layout: {
          mode: 'default',
          config: {},
        },
        colors: {
          pageBackground: {
            mode: 'solid',
            solid: '#ffffff',
            gradient: {
              start: '#ffffff',
              end: '#cbd5e1',
              type: 'linear',
            },
            imageUrl: '',
          },
          headerTextAndIcon: '#000000',
          socialBlockBackground: '#ffffff',
          socialBlockText: '#000000',
          contentBlockBackground: '#ffffff',
          contentBlockText: '#000000',
          contentBlockButton: '#76b900',
        },
        typography: {
          fontFamily: 'Inter',
          displayFontFamily: 'Inter',
          bodyFontFamily: 'Inter',
          fontPairingId: 'modern-inter',
          fontSize: 16,
          fontWeight: 400,
          headingSize: 32,
          headingWeight: 700,
          headingLetterSpacing: -0.02,
          headingTransform: 'none',
          lineHeight: 1.5,
        },
        socials: {
          iconSize: 24,
          displayMode: 'icons',
          items: this.socialPlatforms.map((platform) => ({
            platform,
            url: '',
            iconUrl: '',
          })),
          customFaviconEnabled: true,
        },
        divLayout: {
          widthPercent: 100,
          border: {
            width: 1,
            style: 'solid',
            color: '#cccccc',
            radius: 2,
          },
          boxShadow: {
            enabled: false,
            x: 0,
            y: 0,
            blur: 5,
            spread: 0,
            color: 'rgba(0,0,0,0.3)',
          },
        },
      },
      createdAt: now,
      updatedAt: now,
    };
  }

  private async ensureDefaultHeaderBlock(): Promise<void> {
    const current = await this.get(this.defaultHeaderBlockId);
    if (current) {
      return;
    }

    const record = this.buildDefaultHeaderBlock();
    await this.databaseService.writeRecord(this.entityName, record.id, record as unknown as Record<string, unknown>);
  }

  async list() {
    await this.ensureDefaultHeaderBlock();
    const records = await this.databaseService.readEntity(this.entityName);
    return records.map((record) => ({ id: record.id, ...(record.data as Record<string, unknown>) }));
  }

  async get(id: string) {
    return this.databaseService.readRecord(this.entityName, id);
  }

  async getDefaultId() {
    await this.ensureDefaultHeaderBlock();
    return { defaultBlockId: this.defaultHeaderBlockId };
  }

  async getDefaultHeaderBlock() {
    await this.ensureDefaultHeaderBlock();
    return this.get(this.defaultHeaderBlockId);
  }

  async create(payload: Record<string, unknown>) {
    const id = `block-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();
    const record = {
      id,
      type: String(payload.type ?? 'custom'),
      name: String(payload.name ?? 'custom-block'),
      version: String(payload.version ?? '1.0.0'),
      isDefault: Boolean(payload.isDefault ?? false),
      fields: (payload.fields ?? {}) as Record<string, unknown>,
      createdAt: now,
      updatedAt: now,
    };

    await this.databaseService.writeRecord(this.entityName, id, record);
    return record;
  }

  async importDefinition(payload: Record<string, unknown>) {
    const source = (payload.block && typeof payload.block === 'object'
      ? (payload.block as Record<string, unknown>)
      : payload) as Record<string, unknown>;

    const requestedId = String(source.id ?? source.name ?? 'imported-block');
    const baseId = this.normalizeId(requestedId) || `block-${Date.now()}`;
    let id = baseId;

    const existing = await this.get(id);
    if (existing) {
      id = `${baseId}-${Math.random().toString(36).slice(2, 6)}`;
    }

    const now = new Date().toISOString();
    const record = {
      id,
      type: String(source.type ?? 'custom'),
      name: String(source.name ?? id),
      version: String(source.version ?? '1.0.0'),
      isDefault: false,
      fields: (source.fields ?? {}) as Record<string, unknown>,
      source: 'import',
      createdAt: now,
      updatedAt: now,
    };

    await this.databaseService.writeRecord(this.entityName, id, record);
    return record;
  }

  async update(id: string, payload: Record<string, unknown>) {
    const current = await this.get(id);
    if (!current) {
      return null;
    }

    const next = {
      ...current,
      ...payload,
      id,
      updatedAt: new Date().toISOString(),
    };

    await this.databaseService.writeRecord(this.entityName, id, next as Record<string, unknown>);
    return next;
  }
}
