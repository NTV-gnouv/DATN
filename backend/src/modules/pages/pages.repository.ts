import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

import { DatabaseService } from '@/core/database/database.service';
import { resolveBlockReferences } from '@/core/database/block-reference.util';
import { normalizeJsonPayload, toJsonColumn } from '@/core/database/json-payload.util';

import { isPageOwnedBy } from './page-ownership.util';

type PageRow = RowDataPacket & {
  id: string;
  title: string;
  slug: string;
  username: string;
  owner_id: string | null;
  theme_id: string;
  status: string;
  template: string;
  theme_tokens: unknown;
  header_block_id: string | null;
  editor_config: unknown;
  created_at: Date;
  updated_at: Date;
};

type PageBlockRow = RowDataPacket & {
  id: string;
  page_id: string;
  block_type: string;
  sort_order: number;
  visible: 0 | 1;
  data: unknown;
};

@Injectable()
export class PagesRepository {
  constructor(private readonly databaseService: DatabaseService) {}

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

  private mapPageRow(row: PageRow, blocks: Record<string, unknown>[]): Record<string, unknown> {
    const editorConfig = normalizeJsonPayload(row.editor_config);
    const themeTokens = row.theme_tokens ?? editorConfig.themeTokens ?? null;

    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      username: row.username,
      ...(row.owner_id ? { ownerId: row.owner_id } : {}),
      themeId: this.normalizeThemeId(row.theme_id),
      status: row.status,
      template: row.template,
      blocks,
      themeTokens,
      editorConfig: Object.keys(editorConfig).length > 0 ? editorConfig : undefined,
      createdAt: row.created_at?.toISOString?.() ?? undefined,
      updatedAt: row.updated_at?.toISOString?.() ?? undefined,
    };
  }

  private mapBlockRow(row: PageBlockRow): Record<string, unknown> {
    const data = normalizeJsonPayload(row.data);
    return {
      id: row.id,
      type: row.block_type,
      visible: row.visible === 1,
      ...data,
    };
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

  private mergeHeaderIntoBlocks(current: Record<string, unknown>, incomingBlocks: Array<Record<string, unknown>>) {
    const editorConfig = (current.editorConfig as Record<string, unknown> | undefined) ?? {};
    const headerFromConfig =
      editorConfig.headerBlock && typeof editorConfig.headerBlock === 'object'
        ? (editorConfig.headerBlock as Record<string, unknown>)
        : null;
    const headerFromBlocks = incomingBlocks.find((block) => String(block.type ?? '') === 'header') ?? null;
    const headerBlock = headerFromBlocks ?? headerFromConfig;
    const contentBlocks = incomingBlocks.filter((block) => String(block.type ?? '') !== 'header');

    return headerBlock ? [headerBlock, ...contentBlocks] : contentBlocks;
  }

  async listBlocksByType(pageId: string, blockType: string): Promise<Record<string, unknown>[]> {
    const [rows] = await this.databaseService.execute<PageBlockRow[]>(
      `SELECT id, page_id, block_type, sort_order, visible, data
       FROM page_blocks
       WHERE page_id = ? AND block_type = ?
       ORDER BY sort_order ASC`,
      [pageId, blockType],
    );
    return rows.map((row) => this.mapBlockRow(row));
  }

  async countBlocksByType(pageId: string, blockType: string): Promise<number> {
    const [rows] = await this.databaseService.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS total FROM page_blocks WHERE page_id = ? AND block_type = ?`,
      [pageId, blockType],
    );
    return Number(rows[0]?.total ?? 0);
  }

  private async loadBlocks(pageId: string): Promise<Record<string, unknown>[]> {
    const [rows] = await this.databaseService.execute<PageBlockRow[]>(
      `SELECT id, page_id, block_type, sort_order, visible, data
       FROM page_blocks
       WHERE page_id = ?
       ORDER BY sort_order ASC`,
      [pageId],
    );

    return rows.map((row) => this.mapBlockRow(row));
  }

  private async saveBlocks(pageId: string, blocks: Array<Record<string, unknown>>): Promise<void> {
    await this.databaseService.withTransaction(async () => {
      await this.databaseService.execute(`DELETE FROM page_blocks WHERE page_id = ?`, [pageId]);

      for (let index = 0; index < blocks.length; index += 1) {
        const block = this.normalizeContentBlock(blocks[index], index);
        const blockId = String(block.id ?? `${pageId}-block-${index}`);
        const blockType = String(block.type ?? 'custom');
        const { id: _id, type: _type, visible, ...rest } = block;
        const refs = resolveBlockReferences(blockType, rest);

        await this.databaseService.execute(
          `INSERT INTO page_blocks (id, page_id, block_type, definition_id, ref_entity, ref_id, sort_order, visible, data)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            blockId,
            pageId,
            blockType,
            refs.definitionId,
            refs.refEntity,
            refs.refId,
            index,
            block.visible === false ? 0 : 1,
            JSON.stringify(rest),
          ],
        );
      }
    });
  }

  private async loadPage(pageId: string): Promise<Record<string, unknown> | null> {
    const [rows] = await this.databaseService.execute<PageRow[]>(
      `SELECT id, title, slug, username, owner_id, theme_id, status, template, theme_tokens, header_block_id, editor_config, created_at, updated_at
       FROM pages WHERE id = ? LIMIT 1`,
      [pageId],
    );

    const row = rows[0];
    if (!row) {
      return null;
    }

    const blocks = await this.loadBlocks(pageId);
    return this.mapPageRow(row, blocks);
  }

  private async readAllPages() {
    const [rows] = await this.databaseService.execute<PageRow[]>(
      `SELECT id, title, slug, username, owner_id, theme_id, status, template, theme_tokens, header_block_id, editor_config, created_at, updated_at
       FROM pages
       ORDER BY updated_at DESC`,
    );

    const pages: Record<string, unknown>[] = [];
    for (const row of rows) {
      const blocks = await this.loadBlocks(row.id);
      pages.push(this.mapPageRow(row, blocks));
    }
    return pages;
  }

  private buildTemplate(payload: Record<string, unknown>) {
    const title = String(payload.title ?? 'My Landing Page');
    const slug = this.normalizeSlug(String(payload.slug ?? title));
    const username = String(payload.username ?? 'creator');
    const ownerId = String(payload.ownerId ?? '').trim();

    return {
      id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title,
      slug,
      username,
      ...(ownerId ? { ownerId } : {}),
      themeId: this.normalizeThemeId(payload.themeId),
      status: String(payload.status ?? 'draft'),
      template: String(payload.template ?? 'starter'),
      blocks: payload.blocks ?? [],
      createdAt: new Date().toISOString(),
    };
  }

  async findBySlug(slug: string) {
    const nextSlug = this.normalizeSlug(slug);
    const [rows] = await this.databaseService.execute<PageRow[]>(
      `SELECT id FROM pages WHERE slug = ? LIMIT 1`,
      [nextSlug],
    );
    const row = rows[0];
    return row ? this.loadPage(row.id) : null;
  }

  async findByUsername(username: string) {
    const nextUsername = this.normalizeSlug(username);
    const [rows] = await this.databaseService.execute<PageRow[]>(
      `SELECT id FROM pages WHERE username = ? LIMIT 1`,
      [nextUsername],
    );
    const row = rows[0];
    return row ? this.loadPage(row.id) : null;
  }

  async isUsernameAvailable(username: string, excludeId?: string) {
    const nextUsername = this.normalizeSlug(username);
    if (!nextUsername) {
      return false;
    }

    const [rows] = await this.databaseService.execute<RowDataPacket[]>(
      `SELECT id FROM pages WHERE username = ? LIMIT 1`,
      [nextUsername],
    );
    const existing = rows[0];
    if (!existing) {
      return true;
    }
    return Boolean(excludeId && existing.id === excludeId);
  }

  private buildUniqueSuffix(seed: string) {
    const compact = String(seed ?? '')
      .replace(/[^a-z0-9]/gi, '')
      .toLowerCase();
    const tail = compact.slice(-4) || Math.random().toString(36).slice(2, 6);
    return tail.padStart(4, '0').slice(0, 4);
  }

  async suggestUniqueSlug(base: string, ownerId?: string) {
    const normalizedBase = this.normalizeSlug(base) || 'creator';
    const suffix = this.buildUniqueSuffix(ownerId ?? normalizedBase);

    const candidates = [
      normalizedBase,
      `${normalizedBase}-${suffix}`,
      `${normalizedBase}-${Math.random().toString(36).slice(2, 6)}`,
      `${normalizedBase}-${Date.now().toString(36).slice(-4)}`,
    ];

    for (const candidate of candidates) {
      const slugAvailable = await this.isSlugAvailable(candidate);
      const usernameAvailable = await this.isUsernameAvailable(candidate);
      if (slugAvailable && usernameAvailable) {
        return {
          slug: candidate,
          username: candidate,
        };
      }
    }

    const fallback = `${normalizedBase}-${Math.random().toString(36).slice(2, 8)}`;
    return {
      slug: this.normalizeSlug(fallback),
      username: this.normalizeSlug(fallback),
    };
  }

  async isSlugAvailable(slug: string, excludeId?: string) {
    const nextSlug = this.normalizeSlug(slug);
    const [rows] = await this.databaseService.execute<RowDataPacket[]>(
      `SELECT id FROM pages WHERE slug = ? LIMIT 1`,
      [nextSlug],
    );
    const existing = rows[0];
    if (!existing) {
      return true;
    }
    return Boolean(excludeId && existing.id === excludeId);
  }

  async create(payload: Record<string, unknown>) {
    const record = this.buildTemplate(payload);
    if (!(await this.isSlugAvailable(String(record.slug), record.id))) {
      throw new ConflictException('Slug đã tồn tại');
    }
    if (!(await this.isUsernameAvailable(String(record.username), record.id))) {
      throw new ConflictException('Username đã được sử dụng');
    }

    await this.databaseService.execute(
      `INSERT INTO pages (id, title, slug, username, owner_id, theme_id, status, template)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        record.id,
        record.title,
        record.slug,
        record.username,
        record.ownerId ?? null,
        record.themeId,
        record.status,
        record.template,
      ],
    );

    if (Array.isArray(record.blocks) && record.blocks.length > 0) {
      await this.saveBlocks(record.id, record.blocks as Array<Record<string, unknown>>);
    }

    return (await this.loadPage(record.id)) ?? record;
  }

  async list() {
    return this.readAllPages();
  }

  async get(id: string) {
    const page = await this.loadPage(id);
    return (
      page ?? {
        id,
        title: 'My Landing Page',
        slug: 'my-landing-page',
      }
    );
  }

  async getBySlug(slug: string) {
    const page = await this.findBySlug(slug);
    if (!page) {
      return { slug: this.normalizeSlug(slug), title: 'Không tìm thấy trang đích', status: 'missing' };
    }
    return page;
  }

  async getByUsername(username: string) {
    const page = await this.findByUsername(username);
    if (!page) {
      return { username: this.normalizeSlug(username), title: 'Không tìm thấy trang theo tài khoản', status: 'missing' };
    }
    return page;
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

    const merged = { ...current, ...nextPayload, id } as Record<string, unknown>;
    const themeId = this.normalizeThemeId(merged.themeId);
    const editorConfig = (merged.editorConfig as Record<string, unknown> | undefined) ?? {};

    await this.databaseService.execute(
      `UPDATE pages
       SET title = ?, slug = ?, username = ?, owner_id = ?, theme_id = ?, status = ?, template = ?, theme_tokens = ?, header_block_id = ?, editor_config = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        String(merged.title ?? 'My Landing Page'),
        this.normalizeSlug(String(merged.slug ?? id)),
        String(merged.username ?? ''),
        merged.ownerId ? String(merged.ownerId) : null,
        themeId,
        String(merged.status ?? 'draft'),
        String(merged.template ?? 'starter'),
        toJsonColumn(merged.themeTokens ?? null),
        String(editorConfig.headerBlockId ?? merged.headerBlockId ?? 'block-header-default'),
        toJsonColumn(editorConfig),
        id,
      ],
    );

    if (Array.isArray(merged.blocks)) {
      await this.saveBlocks(id, merged.blocks as Array<Record<string, unknown>>);
    }

    return this.get(id);
  }

  async updateSlug(id: string, slug: string) {
    const current = (await this.get(id)) as Record<string, unknown>;
    const nextSlug = this.normalizeSlug(slug);

    if (!(await this.isSlugAvailable(nextSlug, id))) {
      throw new ConflictException('Slug đã tồn tại');
    }

    await this.databaseService.execute(`UPDATE pages SET slug = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [
      nextSlug,
      id,
    ]);

    return { ...current, id, slug: nextSlug, updatedAt: new Date().toISOString() };
  }

  async updateSlugByUsername(username: string, slug: string, ownerId: string) {
    const normalizedUsername = this.normalizeSlug(username);
    const existing = (await this.findByUsername(normalizedUsername)) as Record<string, unknown> | null;

    if (!existing) {
      throw new NotFoundException('Không tìm thấy trang theo username.');
    }

    if (!isPageOwnedBy(existing, ownerId)) {
      throw new ForbiddenException('Bạn không có quyền cập nhật slug của trang này.');
    }

    return this.updateSlug(String(existing.id), slug);
  }

  async getOwned(id: string, ownerId: string) {
    const page = await this.loadPage(id);
    if (!page) {
      throw new NotFoundException('Không tìm thấy trang.');
    }
    if (!isPageOwnedBy(page, ownerId)) {
      throw new ForbiddenException('Bạn không có quyền truy cập trang này.');
    }
    return page;
  }

  async findByOwnerId(ownerId: string) {
    const [rows] = await this.databaseService.execute<PageRow[]>(
      `SELECT id FROM pages WHERE owner_id = ? LIMIT 1`,
      [ownerId],
    );
    const row = rows[0];
    return row ? this.loadPage(row.id) : null;
  }

  async findForAccount(user: { id?: string; name: string; email: string }) {
    if (!user.id) {
      return null;
    }
    return this.findByOwnerId(user.id);
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
      themeTokens:
        (editorConfig.themeTokens as Record<string, unknown> | undefined) ??
        (page.themeTokens as Record<string, unknown> | undefined) ??
        null,
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
    const editorConfig = (current.editorConfig as Record<string, unknown> | undefined) ?? {};

    await this.databaseService.execute(
      `UPDATE pages
       SET theme_id = ?, theme_tokens = ?, header_block_id = ?, editor_config = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        nextThemeId,
        toJsonColumn(payload.themeTokens ?? current.themeTokens ?? null),
        nextHeaderBlockId,
        toJsonColumn({
          themeId: nextThemeId,
          headerBlockId: nextHeaderBlockId,
          themeTokens: payload.themeTokens ?? editorConfig.themeTokens ?? null,
        }),
        id,
      ],
    );

    await this.saveBlocks(id, nextBlocks);

    return this.getEditorConfig(id);
  }

  async createTemplate(payload: Record<string, unknown>) {
    return this.create({ ...payload, template: payload.template ?? 'starter' });
  }

  async remove(id: string) {
    const [result] = await this.databaseService.execute<ResultSetHeader>(
      `DELETE FROM pages WHERE id = ?`,
      [id],
    );
    return { id, removed: result.affectedRows > 0 };
  }
}
