"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PagesRepository = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../core/database/database.service");
const block_reference_util_1 = require("../../core/database/block-reference.util");
const json_payload_util_1 = require("../../core/database/json-payload.util");
const page_ownership_util_1 = require("./page-ownership.util");
let PagesRepository = class PagesRepository {
    constructor(databaseService) {
        this.databaseService = databaseService;
        this.defaultThemeId = 'minimal';
    }
    normalizeThemeId(value) {
        const next = String(value ?? '').trim();
        if (!next || next === 'minimal-theme') {
            return this.defaultThemeId;
        }
        return next;
    }
    normalizeSlug(value) {
        return value
            .normalize('NFD')
            .replace(/\p{Diacritic}/gu, '')
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 80) || 'page';
    }
    mapPageRow(row, blocks) {
        const editorConfig = (0, json_payload_util_1.normalizeJsonPayload)(row.editor_config);
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
    mapBlockRow(row) {
        const data = (0, json_payload_util_1.normalizeJsonPayload)(row.data);
        return {
            id: row.id,
            type: row.block_type,
            visible: row.visible === 1,
            ...data,
        };
    }
    normalizeContentBlock(block, index) {
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
    mergeHeaderIntoBlocks(current, incomingBlocks) {
        const editorConfig = current.editorConfig ?? {};
        const headerFromConfig = editorConfig.headerBlock && typeof editorConfig.headerBlock === 'object'
            ? editorConfig.headerBlock
            : null;
        const headerFromBlocks = incomingBlocks.find((block) => String(block.type ?? '') === 'header') ?? null;
        const headerBlock = headerFromBlocks ?? headerFromConfig;
        const contentBlocks = incomingBlocks.filter((block) => String(block.type ?? '') !== 'header');
        return headerBlock ? [headerBlock, ...contentBlocks] : contentBlocks;
    }
    async listBlocksByType(pageId, blockType) {
        const [rows] = await this.databaseService.execute(`SELECT id, page_id, block_type, sort_order, visible, data
       FROM page_blocks
       WHERE page_id = ? AND block_type = ?
       ORDER BY sort_order ASC`, [pageId, blockType]);
        return rows.map((row) => this.mapBlockRow(row));
    }
    async countBlocksByType(pageId, blockType) {
        const [rows] = await this.databaseService.execute(`SELECT COUNT(*) AS total FROM page_blocks WHERE page_id = ? AND block_type = ?`, [pageId, blockType]);
        return Number(rows[0]?.total ?? 0);
    }
    async loadBlocks(pageId) {
        const [rows] = await this.databaseService.execute(`SELECT id, page_id, block_type, sort_order, visible, data
       FROM page_blocks
       WHERE page_id = ?
       ORDER BY sort_order ASC`, [pageId]);
        return rows.map((row) => this.mapBlockRow(row));
    }
    async saveBlocks(pageId, blocks) {
        await this.databaseService.withTransaction(async () => {
            await this.databaseService.execute(`DELETE FROM page_blocks WHERE page_id = ?`, [pageId]);
            for (let index = 0; index < blocks.length; index += 1) {
                const block = this.normalizeContentBlock(blocks[index], index);
                const blockId = String(block.id ?? `${pageId}-block-${index}`);
                const blockType = String(block.type ?? 'custom');
                const { id: _id, type: _type, visible, ...rest } = block;
                const refs = (0, block_reference_util_1.resolveBlockReferences)(blockType, rest);
                await this.databaseService.execute(`INSERT INTO page_blocks (id, page_id, block_type, definition_id, ref_entity, ref_id, sort_order, visible, data)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                    blockId,
                    pageId,
                    blockType,
                    refs.definitionId,
                    refs.refEntity,
                    refs.refId,
                    index,
                    block.visible === false ? 0 : 1,
                    JSON.stringify(rest),
                ]);
            }
        });
    }
    async loadPage(pageId) {
        const [rows] = await this.databaseService.execute(`SELECT id, title, slug, username, owner_id, theme_id, status, template, theme_tokens, header_block_id, editor_config, created_at, updated_at
       FROM pages WHERE id = ? LIMIT 1`, [pageId]);
        const row = rows[0];
        if (!row) {
            return null;
        }
        const blocks = await this.loadBlocks(pageId);
        return this.mapPageRow(row, blocks);
    }
    async readAllPages() {
        const [rows] = await this.databaseService.execute(`SELECT id, title, slug, username, owner_id, theme_id, status, template, theme_tokens, header_block_id, editor_config, created_at, updated_at
       FROM pages
       ORDER BY updated_at DESC`);
        const pages = [];
        for (const row of rows) {
            const blocks = await this.loadBlocks(row.id);
            pages.push(this.mapPageRow(row, blocks));
        }
        return pages;
    }
    buildTemplate(payload) {
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
    async findBySlug(slug) {
        const nextSlug = this.normalizeSlug(slug);
        const [rows] = await this.databaseService.execute(`SELECT id FROM pages WHERE slug = ? LIMIT 1`, [nextSlug]);
        const row = rows[0];
        return row ? this.loadPage(row.id) : null;
    }
    async findByUsername(username) {
        const nextUsername = this.normalizeSlug(username);
        const [rows] = await this.databaseService.execute(`SELECT id FROM pages WHERE username = ? LIMIT 1`, [nextUsername]);
        const row = rows[0];
        return row ? this.loadPage(row.id) : null;
    }
    async isUsernameAvailable(username, excludeId) {
        const nextUsername = this.normalizeSlug(username);
        if (!nextUsername) {
            return false;
        }
        const [rows] = await this.databaseService.execute(`SELECT id FROM pages WHERE username = ? LIMIT 1`, [nextUsername]);
        const existing = rows[0];
        if (!existing) {
            return true;
        }
        return Boolean(excludeId && existing.id === excludeId);
    }
    buildUniqueSuffix(seed) {
        const compact = String(seed ?? '')
            .replace(/[^a-z0-9]/gi, '')
            .toLowerCase();
        const tail = compact.slice(-4) || Math.random().toString(36).slice(2, 6);
        return tail.padStart(4, '0').slice(0, 4);
    }
    async suggestUniqueSlug(base, ownerId) {
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
    async isSlugAvailable(slug, excludeId) {
        const nextSlug = this.normalizeSlug(slug);
        const [rows] = await this.databaseService.execute(`SELECT id FROM pages WHERE slug = ? LIMIT 1`, [nextSlug]);
        const existing = rows[0];
        if (!existing) {
            return true;
        }
        return Boolean(excludeId && existing.id === excludeId);
    }
    async create(payload) {
        const record = this.buildTemplate(payload);
        if (!(await this.isSlugAvailable(String(record.slug), record.id))) {
            throw new common_1.ConflictException('Slug đã tồn tại');
        }
        if (!(await this.isUsernameAvailable(String(record.username), record.id))) {
            throw new common_1.ConflictException('Username đã được sử dụng');
        }
        await this.databaseService.execute(`INSERT INTO pages (id, title, slug, username, owner_id, theme_id, status, template)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
            record.id,
            record.title,
            record.slug,
            record.username,
            record.ownerId ?? null,
            record.themeId,
            record.status,
            record.template,
        ]);
        if (Array.isArray(record.blocks) && record.blocks.length > 0) {
            await this.saveBlocks(record.id, record.blocks);
        }
        return (await this.loadPage(record.id)) ?? record;
    }
    async list() {
        return this.readAllPages();
    }
    async get(id) {
        const page = await this.loadPage(id);
        return (page ?? {
            id,
            title: 'My Landing Page',
            slug: 'my-landing-page',
        });
    }
    async getBySlug(slug) {
        const page = await this.findBySlug(slug);
        if (!page) {
            return { slug: this.normalizeSlug(slug), title: 'Không tìm thấy trang đích', status: 'missing' };
        }
        return page;
    }
    async getByUsername(username) {
        const page = await this.findByUsername(username);
        if (!page) {
            return { username: this.normalizeSlug(username), title: 'Không tìm thấy trang theo tài khoản', status: 'missing' };
        }
        return page;
    }
    async update(id, payload) {
        const current = (await this.get(id));
        if (payload.slug && !(await this.isSlugAvailable(String(payload.slug), id))) {
            throw new common_1.ConflictException('Slug đã tồn tại');
        }
        const nextPayload = { ...payload };
        if (Array.isArray(nextPayload.blocks)) {
            nextPayload.blocks = this.mergeHeaderIntoBlocks(current, nextPayload.blocks);
        }
        const merged = { ...current, ...nextPayload, id };
        const themeId = this.normalizeThemeId(merged.themeId);
        const editorConfig = merged.editorConfig ?? {};
        await this.databaseService.execute(`UPDATE pages
       SET title = ?, slug = ?, username = ?, owner_id = ?, theme_id = ?, status = ?, template = ?, theme_tokens = ?, header_block_id = ?, editor_config = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`, [
            String(merged.title ?? 'My Landing Page'),
            this.normalizeSlug(String(merged.slug ?? id)),
            String(merged.username ?? ''),
            merged.ownerId ? String(merged.ownerId) : null,
            themeId,
            String(merged.status ?? 'draft'),
            String(merged.template ?? 'starter'),
            (0, json_payload_util_1.toJsonColumn)(merged.themeTokens ?? null),
            String(editorConfig.headerBlockId ?? merged.headerBlockId ?? 'block-header-default'),
            (0, json_payload_util_1.toJsonColumn)(editorConfig),
            id,
        ]);
        if (Array.isArray(merged.blocks)) {
            await this.saveBlocks(id, merged.blocks);
        }
        return this.get(id);
    }
    async updateSlug(id, slug) {
        const current = (await this.get(id));
        const nextSlug = this.normalizeSlug(slug);
        if (!(await this.isSlugAvailable(nextSlug, id))) {
            throw new common_1.ConflictException('Slug đã tồn tại');
        }
        await this.databaseService.execute(`UPDATE pages SET slug = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [
            nextSlug,
            id,
        ]);
        return { ...current, id, slug: nextSlug, updatedAt: new Date().toISOString() };
    }
    async updateSlugByUsername(username, slug, ownerId) {
        const normalizedUsername = this.normalizeSlug(username);
        const existing = (await this.findByUsername(normalizedUsername));
        if (!existing) {
            throw new common_1.NotFoundException('Không tìm thấy trang theo username.');
        }
        if (!(0, page_ownership_util_1.isPageOwnedBy)(existing, ownerId)) {
            throw new common_1.ForbiddenException('Bạn không có quyền cập nhật slug của trang này.');
        }
        return this.updateSlug(String(existing.id), slug);
    }
    async getOwned(id, ownerId) {
        const page = await this.loadPage(id);
        if (!page) {
            throw new common_1.NotFoundException('Không tìm thấy trang.');
        }
        if (!(0, page_ownership_util_1.isPageOwnedBy)(page, ownerId)) {
            throw new common_1.ForbiddenException('Bạn không có quyền truy cập trang này.');
        }
        return page;
    }
    async findByOwnerId(ownerId) {
        const [rows] = await this.databaseService.execute(`SELECT id FROM pages WHERE owner_id = ? LIMIT 1`, [ownerId]);
        const row = rows[0];
        return row ? this.loadPage(row.id) : null;
    }
    async findForAccount(user) {
        if (!user.id) {
            return null;
        }
        return this.findByOwnerId(user.id);
    }
    async getEditorConfig(id) {
        const page = (await this.get(id));
        const firstHeaderBlock = Array.isArray(page.blocks)
            ? page.blocks.find((block) => String(block.type ?? '') === 'header')
            : null;
        const editorConfig = page.editorConfig ?? {};
        return {
            pageId: id,
            themeId: this.normalizeThemeId(editorConfig.themeId ?? page.themeId),
            themeTokens: editorConfig.themeTokens ??
                page.themeTokens ??
                null,
            headerBlockId: String(editorConfig.headerBlockId ?? 'block-header-default'),
            headerBlock: editorConfig.headerBlock ?? firstHeaderBlock ?? null,
        };
    }
    async updateEditorConfig(id, payload) {
        const current = (await this.get(id));
        const currentBlocks = Array.isArray(current.blocks)
            ? [...current.blocks]
            : [];
        const nextThemeId = this.normalizeThemeId(payload.themeId ?? current.themeId);
        const nextHeaderBlockId = String(payload.headerBlockId ?? 'block-header-default');
        const nextHeaderBlock = payload.headerBlock && typeof payload.headerBlock === 'object'
            ? payload.headerBlock
            : null;
        const filteredBlocks = currentBlocks.filter((block) => String(block.type ?? '') !== 'header');
        const nextBlocks = nextHeaderBlock ? [nextHeaderBlock, ...filteredBlocks] : filteredBlocks;
        const editorConfig = current.editorConfig ?? {};
        await this.databaseService.execute(`UPDATE pages
       SET theme_id = ?, theme_tokens = ?, header_block_id = ?, editor_config = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`, [
            nextThemeId,
            (0, json_payload_util_1.toJsonColumn)(payload.themeTokens ?? current.themeTokens ?? null),
            nextHeaderBlockId,
            (0, json_payload_util_1.toJsonColumn)({
                themeId: nextThemeId,
                headerBlockId: nextHeaderBlockId,
                themeTokens: payload.themeTokens ?? editorConfig.themeTokens ?? null,
            }),
            id,
        ]);
        await this.saveBlocks(id, nextBlocks);
        return this.getEditorConfig(id);
    }
    async createTemplate(payload) {
        return this.create({ ...payload, template: payload.template ?? 'starter' });
    }
    async remove(id) {
        const [result] = await this.databaseService.execute(`DELETE FROM pages WHERE id = ?`, [id]);
        return { id, removed: result.affectedRows > 0 };
    }
};
exports.PagesRepository = PagesRepository;
exports.PagesRepository = PagesRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], PagesRepository);
