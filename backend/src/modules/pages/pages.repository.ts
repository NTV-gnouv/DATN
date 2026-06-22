import { ConflictException, Injectable } from '@nestjs/common';
import { DatabaseService } from '@/core/database/database.service';

@Injectable()
export class PagesRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  private readonly entityName = 'pages';
  private readonly defaultThemeId = 'minimal';

  private normalizeThemeId(value: unknown): string {
    const next = String(value ?? '').trim();
    if (!next || next === 'minimal-theme') {
      return this.defaultThemeId;
    }
    return next;
  }

  private normalizeSlug(value: string): string {
    return value
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'page';
  }

  private normalizeContentBlock(block: Record<string, unknown>, index: number): Record<string, unknown> {
    const type = String(block.type ?? 'block');
    if (type === 'header') {
      return block;
    }

    const id = String(block.id ?? '').trim() || `${type}-${index}-${Date.now().toString(36)}`;
    return {
      ...block,
      id,
      visible: block.visible !== false,
    };
  }

  private normalizePageRecord(page: Record<string, unknown>): Record<string, unknown> {
    if (!Array.isArray(page.blocks)) {
      return page;
    }

    const blocks = (page.blocks as Array<Record<string, unknown>>).map((block, index) =>
      this.normalizeContentBlock(block, index),
    );

    return { ...page, blocks };
  }

  private mergeHeaderIntoBlocks(current: Record<string, unknown>, incomingBlocks: Array<Record<string, unknown>>) {
    const editorConfig = (current.editorConfig as Record<string, unknown> | undefined) ?? {};
    const headerFromConfig =
      editorConfig.headerBlock && typeof editorConfig.headerBlock === 'object'
        ? (editorConfig.headerBlock as Record<string, unknown>)
        : null;
    const headerFromBlocks = incomingBlocks.find((block) => String(block.type ?? '') === 'header') ?? null;
    const headerBlock = headerFromConfig ?? headerFromBlocks;
    const contentBlocks = incomingBlocks.filter((block) => String(block.type ?? '') !== 'header');

    return headerBlock ? [headerBlock, ...contentBlocks] : contentBlocks;
  }

  private async readAllPages() {
    const records = await this.databaseService.readEntity(this.entityName);
    return records.map((record) => ({ id: record.id, ...(record.data as Record<string, unknown>) })) as any[];
  }

  private buildTemplate(payload: Record<string, unknown>) {
    const title = String(payload.title ?? 'My Landing Page');
    const slug = this.normalizeSlug(String(payload.slug ?? title));
    const username = String(payload.username ?? 'creator');

    return {
      id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title,
      slug,
      username,
      themeId: this.normalizeThemeId(payload.themeId),
      status: String(payload.status ?? 'draft'),
      template: String(payload.template ?? 'starter'),
      blocks:
        payload.blocks ??
        [
          { type: 'hero', headline: title, body: 'A fast creator landing page with a clean Beacons-style flow.' },
          { type: 'links', items: ['Link one', 'Link two', 'Link three'] },
          { type: 'socials', items: ['Instagram', 'TikTok', 'YouTube'] },
        ],
      createdAt: new Date().toISOString(),
    };
  }

  async findBySlug(slug: string) {
    const nextSlug = this.normalizeSlug(slug);
    const pages = await this.readAllPages();
    return pages.find((page: any) => this.normalizeSlug(String(page.slug ?? '')) === nextSlug) ?? null;
  }

  async findByUsername(username: string) {
    const nextUsername = this.normalizeSlug(username);
    const pages = await this.readAllPages();
    return pages.find((page: any) => this.normalizeSlug(String(page.username ?? '')) === nextUsername) ?? null;
  }

  async isSlugAvailable(slug: string, excludeId?: string) {
    const nextSlug = this.normalizeSlug(slug);
    const pages = await this.readAllPages();
    return !pages.some((page: any) => {
      if (excludeId && page.id === excludeId) {
        return false;
      }

      return this.normalizeSlug(String(page.slug ?? '')) === nextSlug;
    });
  }

  async create(payload: Record<string, unknown>) {
    const record = this.buildTemplate(payload);
    if (!(await this.isSlugAvailable(String(record.slug), record.id))) {
      throw new ConflictException('Slug đã tồn tại');
    }

    await this.databaseService.writeRecord(this.entityName, record.id, record);
    return record;
  }

  async list() {
    return this.readAllPages();
  }

  async get(id: string) {
    const record = (await this.databaseService.readRecord(this.entityName, id)) ?? {
      id,
      title: 'My Landing Page',
      slug: 'my-landing-page',
    };
    return this.normalizePageRecord(record as Record<string, unknown>);
  }

  async getBySlug(slug: string) {
    const page = await this.findBySlug(slug);
    if (!page) {
      return { slug: this.normalizeSlug(slug), title: 'Không tìm thấy trang đích', status: 'missing' };
    }
    return this.normalizePageRecord(page as Record<string, unknown>);
  }

  async getByUsername(username: string) {
    const page = await this.findByUsername(username);
    if (!page) {
      return { username: this.normalizeSlug(username), title: 'Không tìm thấy trang theo tài khoản', status: 'missing' };
    }
    return this.normalizePageRecord(page as Record<string, unknown>);
  }

  async update(id: string, payload: Record<string, unknown>) {
    const current = (await this.get(id)) as Record<string, unknown>;
    if (payload.slug && !(await this.isSlugAvailable(String(payload.slug), id))) {
      throw new ConflictException('Slug đã tồn tại');
    }

    const nextPayload = { ...payload };
    if (Array.isArray(nextPayload.blocks)) {
      nextPayload.blocks = this.mergeHeaderIntoBlocks(
        current,
        nextPayload.blocks as Array<Record<string, unknown>>,
      );
    }

    const next = this.normalizePageRecord({ ...current, ...nextPayload, id });
    await this.databaseService.writeRecord(this.entityName, id, next);
    return next;
  }

  async updateSlug(id: string, slug: string) {
    const current = (await this.get(id)) as Record<string, unknown>;
    const nextSlug = this.normalizeSlug(slug);

    if (!(await this.isSlugAvailable(nextSlug, id))) {
      throw new ConflictException('Slug đã tồn tại');
    }

    const next = {
      ...current,
      id,
      slug: nextSlug,
      updatedAt: new Date().toISOString(),
    };

    await this.databaseService.writeRecord(this.entityName, id, next);
    return next;
  }

  async updateSlugByUsername(username: string, slug: string) {
    const normalizedUsername = this.normalizeSlug(username);
    const existing = (await this.findByUsername(normalizedUsername)) as Record<string, unknown> | null;

    if (!existing) {
      const created = this.buildTemplate({
        title: `Landing page ${normalizedUsername}`,
        username: normalizedUsername,
        slug,
      });

      if (!(await this.isSlugAvailable(String(created.slug), created.id))) {
        throw new ConflictException('Slug đã tồn tại');
      }

      await this.databaseService.writeRecord(this.entityName, String(created.id), created as Record<string, unknown>);
      return created;
    }

    return this.updateSlug(String(existing.id), slug);
  }

  async getEditorConfig(id: string) {
    const page = (await this.get(id)) as Record<string, unknown>;
    const firstHeaderBlock = Array.isArray(page.blocks)
      ? (page.blocks as Array<Record<string, unknown>>).find((block) => String(block.type ?? '') === 'header')
      : null;

    const editorConfig = (page.editorConfig as Record<string, unknown> | undefined) ?? {};

    return {
      pageId: id,
      themeId: this.normalizeThemeId(editorConfig.themeId ?? page.themeId),
      // include persisted themeTokens if present so editor can load per-page theme overrides
      themeTokens: (editorConfig.themeTokens as Record<string, unknown> | undefined) ?? (page.themeTokens as Record<string, unknown> | undefined) ?? null,
      headerBlockId: String(editorConfig.headerBlockId ?? 'block-header-default'),
      headerBlock: (editorConfig.headerBlock as Record<string, unknown> | undefined) ?? firstHeaderBlock ?? null,
    };
  }

  async updateEditorConfig(id: string, payload: Record<string, unknown>) {
    const current = (await this.get(id)) as Record<string, unknown>;
    const currentBlocks = Array.isArray(current.blocks)
      ? ([...(current.blocks as Array<Record<string, unknown>>)] as Array<Record<string, unknown>>)
      : [];

    const nextThemeId = this.normalizeThemeId(payload.themeId ?? current.themeId);
    const nextHeaderBlockId = String(payload.headerBlockId ?? 'block-header-default');
    const nextHeaderBlock =
      payload.headerBlock && typeof payload.headerBlock === 'object'
        ? (payload.headerBlock as Record<string, unknown>)
        : null;

    const filteredBlocks = currentBlocks.filter((block) => String(block.type ?? '') !== 'header');
    const nextBlocks = nextHeaderBlock ? [nextHeaderBlock, ...filteredBlocks] : filteredBlocks;

    // ensure we preserve any existing editorConfig values
    const editorConfig = (current.editorConfig as Record<string, unknown> | undefined) ?? {};

    const next = {
      ...current,
      themeId: nextThemeId,
      blocks: nextBlocks,
      // Persist themeTokens if provided so published page uses the same tokens
      themeTokens: payload.themeTokens ?? current.themeTokens ?? null,
      editorConfig: {
        themeId: nextThemeId,
        headerBlockId: nextHeaderBlockId,
        headerBlock: nextHeaderBlock,
        themeTokens: payload.themeTokens ?? (editorConfig.themeTokens as Record<string, unknown> | undefined) ?? null,
      },
      id,
      updatedAt: new Date().toISOString(),
    };

    await this.databaseService.writeRecord(this.entityName, id, next);
    return this.getEditorConfig(id);
  }

  async createTemplate(payload: Record<string, unknown>) {
    const record = this.buildTemplate({ ...payload, template: payload.template ?? 'starter' });
    if (!(await this.isSlugAvailable(String(record.slug), record.id))) {
      throw new ConflictException('Slug đã tồn tại');
    }

    await this.databaseService.writeRecord(this.entityName, record.id, record);
    return record;
  }

  async remove(id: string) {
    const removed = await this.databaseService.deleteRecord(this.entityName, id);
    return { id, removed };
  }
}
