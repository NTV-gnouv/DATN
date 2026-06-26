import { Injectable, Logger } from '@nestjs/common';
import { Pool, RowDataPacket } from 'mysql2/promise';
import type { ExecuteValues } from 'mysql2/promise';

import { normalizeJsonPayload, toJsonColumn } from './json-payload.util';
import { DatabaseHardeningService } from './database-hardening.service';

type LegacyRow = RowDataPacket & {
  record_id: string;
  payload: unknown;
};

@Injectable()
export class RelationalSchemaService {
  private readonly logger = new Logger(RelationalSchemaService.name);
  private readonly hardeningService = new DatabaseHardeningService();

  async ensureSchema(pool: Pool): Promise<void> {
    const hasLegacyPages = await this.tableHasColumn(pool, 'pages', 'payload');

    if (hasLegacyPages) {
      await this.migrateFromLegacyJson(pool);
      return;
    }

    await this.createAllTables(pool);
    await this.hardeningService.ensureEnhancements(pool);
    await this.seedDemoData(pool);
  }

  private async finalizeSchema(pool: Pool): Promise<void> {
    await this.hardeningService.ensureEnhancements(pool);
  }

  private async createAllTables(pool: Pool): Promise<void> {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS pages (
        id VARCHAR(191) NOT NULL,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(80) NOT NULL,
        username VARCHAR(80) NOT NULL DEFAULT '',
        owner_id VARCHAR(191) NULL,
        theme_id VARCHAR(191) NOT NULL DEFAULT 'minimal',
        status VARCHAR(32) NOT NULL DEFAULT 'draft',
        template VARCHAR(64) NOT NULL DEFAULT 'starter',
        theme_tokens JSON NULL,
        header_block_id VARCHAR(191) NULL DEFAULT 'block-header-default',
        editor_config JSON NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uk_pages_slug (slug),
        KEY idx_pages_username (username),
        KEY idx_pages_owner (owner_id),
        CONSTRAINT fk_pages_owner FOREIGN KEY (owner_id) REFERENCES auth_users (id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS page_blocks (
        id VARCHAR(191) NOT NULL,
        page_id VARCHAR(191) NOT NULL,
        block_type VARCHAR(64) NOT NULL,
        sort_order INT NOT NULL DEFAULT 0,
        visible TINYINT(1) NOT NULL DEFAULT 1,
        data JSON NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_page_blocks_page (page_id),
        KEY idx_page_blocks_type (block_type),
        CONSTRAINT fk_page_blocks_page FOREIGN KEY (page_id) REFERENCES pages (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS block_definitions (
        id VARCHAR(191) NOT NULL,
        block_type VARCHAR(64) NOT NULL,
        name VARCHAR(191) NOT NULL,
        version VARCHAR(32) NOT NULL DEFAULT '1.0.0',
        plugin_id VARCHAR(191) NULL,
        is_default TINYINT(1) NOT NULL DEFAULT 0,
        default_data JSON NULL,
        source VARCHAR(32) NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_block_definitions_type (block_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS themes (
        id VARCHAR(191) NOT NULL,
        name VARCHAR(191) NOT NULL,
        version VARCHAR(32) NOT NULL DEFAULT '1.0.0',
        layout VARCHAR(64) NOT NULL DEFAULT 'default',
        source_path VARCHAR(512) NOT NULL DEFAULT '',
        preview VARCHAR(255) NULL,
        description TEXT NULL,
        enabled TINYINT(1) NOT NULL DEFAULT 1,
        css_defaults JSON NULL,
        theme_tokens JSON NULL,
        field_schema JSON NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS custom_themes (
        id VARCHAR(191) NOT NULL,
        page_id VARCHAR(191) NOT NULL,
        name VARCHAR(191) NOT NULL,
        version VARCHAR(32) NOT NULL DEFAULT '1.0.0',
        is_default TINYINT(1) NOT NULL DEFAULT 0,
        is_active TINYINT(1) NOT NULL DEFAULT 0,
        config JSON NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_custom_themes_page (page_id),
        CONSTRAINT fk_custom_themes_page FOREIGN KEY (page_id) REFERENCES pages (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS plugins (
        id VARCHAR(191) NOT NULL,
        name VARCHAR(191) NOT NULL,
        version VARCHAR(32) NOT NULL DEFAULT '1.0.0',
        plugin_type VARCHAR(64) NOT NULL DEFAULT 'block',
        entry VARCHAR(255) NOT NULL DEFAULT '',
        source_path VARCHAR(512) NOT NULL DEFAULT '',
        enabled TINYINT(1) NOT NULL DEFAULT 1,
        permissions JSON NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS contact_forms (
        id VARCHAR(191) NOT NULL,
        name VARCHAR(191) NOT NULL,
        description TEXT NULL,
        submit_label VARCHAR(128) NOT NULL DEFAULT 'Gửi',
        success_message TEXT NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'active',
        fields JSON NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS contact_form_submissions (
        id VARCHAR(191) NOT NULL,
        form_id VARCHAR(191) NOT NULL,
        payload JSON NOT NULL,
        ip VARCHAR(64) NOT NULL DEFAULT '',
        user_agent TEXT NULL,
        page_url TEXT NULL,
        field_labels JSON NULL,
        submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_contact_submissions_form (form_id),
        CONSTRAINT fk_contact_submissions_form FOREIGN KEY (form_id) REFERENCES contact_forms (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS media (
        id VARCHAR(191) NOT NULL,
        owner_id VARCHAR(191) NULL,
        original_name VARCHAR(255) NOT NULL,
        mime_type VARCHAR(128) NOT NULL,
        size BIGINT NOT NULL DEFAULT 0,
        purpose VARCHAR(32) NULL,
        width INT NULL,
        height INT NULL,
        storage_key VARCHAR(512) NOT NULL,
        preview_path VARCHAR(512) NULL,
        thumb_path VARCHAR(512) NULL,
        public_url TEXT NOT NULL,
        variants JSON NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_media_owner (owner_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS page_view_events (
        id VARCHAR(191) NOT NULL,
        page_id VARCHAR(191) NOT NULL,
        slug VARCHAR(80) NOT NULL DEFAULT '',
        viewed_at TIMESTAMP NOT NULL,
        country_code VARCHAR(8) NOT NULL DEFAULT '',
        device VARCHAR(16) NOT NULL DEFAULT 'unknown',
        user_agent TEXT NULL,
        referrer TEXT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_page_views_page (page_id),
        KEY idx_page_views_viewed_at (viewed_at),
        CONSTRAINT fk_page_views_page FOREIGN KEY (page_id) REFERENCES pages (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS onboarding_sessions (
        id VARCHAR(191) NOT NULL,
        user_id VARCHAR(191) NOT NULL,
        page_id VARCHAR(191) NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'in_progress',
        current_step TINYINT NOT NULL DEFAULT 1,
        session_data JSON NOT NULL,
        started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_onboarding_user (user_id),
        KEY idx_onboarding_status (status),
        CONSTRAINT fk_onboarding_user FOREIGN KEY (user_id) REFERENCES auth_users (id) ON DELETE CASCADE,
        CONSTRAINT fk_onboarding_page FOREIGN KEY (page_id) REFERENCES pages (id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS ai_chat_sessions (
        id VARCHAR(191) NOT NULL,
        user_id VARCHAR(191) NOT NULL,
        username VARCHAR(80) NOT NULL DEFAULT '',
        page_id VARCHAR(191) NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'collecting',
        current_step INT NOT NULL DEFAULT 0,
        session_data JSON NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_ai_chat_user (user_id),
        KEY idx_ai_chat_page (page_id),
        CONSTRAINT fk_ai_chat_user FOREIGN KEY (user_id) REFERENCES auth_users (id) ON DELETE CASCADE,
        CONSTRAINT fk_ai_chat_page FOREIGN KEY (page_id) REFERENCES pages (id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS email_logs (
        id VARCHAR(191) NOT NULL,
        recipient VARCHAR(191) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        template VARCHAR(64) NOT NULL DEFAULT '',
        status VARCHAR(16) NOT NULL DEFAULT 'queued',
        error_message TEXT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_email_logs_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id VARCHAR(191) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(32) NOT NULL DEFAULT 'creator',
        deleted TINYINT(1) NOT NULL DEFAULT 0,
        metadata JSON NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    this.logger.log('Relational content schema ensured');
  }

  private async migrateFromLegacyJson(pool: Pool): Promise<void> {
    this.logger.warn('Migrating legacy JSON document tables to relational schema');

    const legacyPages = await this.readLegacyTable(pool, 'pages');
    const legacyBlocks = await this.readLegacyTable(pool, 'blocks');
    const legacyThemes = await this.readLegacyTable(pool, 'themes');
    const legacyCustomThemes = await this.readLegacyTable(pool, 'custom_themes');
    const legacyPlugins = await this.readLegacyTable(pool, 'plugins');
    const legacyForms = await this.readLegacyTable(pool, 'contact_forms');
    const legacySubmissions = await this.readLegacyTable(pool, 'contact_form_submissions');
    const legacyMedia = await this.readLegacyTable(pool, 'media');
    const legacyPageViews = await this.readLegacyTable(pool, 'page_view_events');
    const legacyOnboarding = await this.readLegacyTable(pool, 'onboarding_sessions');
    const legacyAiChat = await this.readLegacyTable(pool, 'ai_chat_sessions');
    const legacyEmailLogs = await this.readLegacyTable(pool, 'email_logs');
    const legacyUsers = await this.readLegacyTable(pool, 'users');

    await pool.execute('SET FOREIGN_KEY_CHECKS = 0');
    const legacyTables = [
      'ai_chat_sessions',
      'onboarding_sessions',
      'page_view_events',
      'contact_form_submissions',
      'custom_themes',
      'page_blocks',
      'pages',
      'block_definitions',
      'blocks',
      'themes',
      'plugins',
      'contact_forms',
      'media',
      'email_logs',
      'user_profiles',
      'users',
    ];
    for (const table of legacyTables) {
      await pool.execute(`DROP TABLE IF EXISTS ${table}`);
    }
    await pool.execute('SET FOREIGN_KEY_CHECKS = 1');

    await this.createAllTables(pool);

    for (const row of legacyPages) {
      const page = normalizeJsonPayload(row.payload);
      const id = String(page.id ?? row.record_id);
      const editorConfig = (page.editorConfig as Record<string, unknown> | undefined) ?? {};
      const ownerId = String(page.ownerId ?? '').trim() || null;

      await pool.execute(
        `INSERT INTO pages (id, title, slug, username, owner_id, theme_id, status, template, theme_tokens, header_block_id, editor_config, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP), COALESCE(?, CURRENT_TIMESTAMP))`,
        [
          id,
          String(page.title ?? 'My Landing Page'),
          String(page.slug ?? id),
          String(page.username ?? ''),
          ownerId,
          String(page.themeId ?? editorConfig.themeId ?? 'minimal'),
          String(page.status ?? 'draft'),
          String(page.template ?? 'starter'),
          toJsonColumn(page.themeTokens ?? editorConfig.themeTokens ?? null),
          String(editorConfig.headerBlockId ?? 'block-header-default'),
          toJsonColumn(editorConfig),
          page.createdAt ? String(page.createdAt) : null,
          page.updatedAt ? String(page.updatedAt) : null,
        ] as ExecuteValues,
      );

      const blocks = Array.isArray(page.blocks) ? page.blocks : [];
      for (let index = 0; index < blocks.length; index += 1) {
        const block = blocks[index] as Record<string, unknown>;
        const blockId = String(block.id ?? `${id}-block-${index}`);
        const blockType = String(block.type ?? 'custom');
        const { id: _id, type: _type, visible, ...rest } = block;
        await pool.execute(
          `INSERT INTO page_blocks (id, page_id, block_type, sort_order, visible, data)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            blockId,
            id,
            blockType,
            index,
            block.visible === false ? 0 : 1,
            JSON.stringify(rest),
          ],
        );
      }
    }

    for (const row of legacyBlocks) {
      const block = normalizeJsonPayload(row.payload);
      const id = String(block.id ?? row.record_id);
      await pool.execute(
        `INSERT INTO block_definitions (id, block_type, name, version, is_default, default_data, source)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          String(block.type ?? 'custom'),
          String(block.name ?? id),
          String(block.version ?? '1.0.0'),
          block.isDefault === true ? 1 : 0,
          toJsonColumn(block.fields ?? block),
          block.source ? String(block.source) : null,
        ],
      );
    }

    for (const row of legacyThemes) {
      const theme = normalizeJsonPayload(row.payload);
      const id = String(theme.id ?? row.record_id);
      await pool.execute(
        `INSERT INTO themes (id, name, version, layout, source_path, preview, description, enabled, css_defaults, theme_tokens, field_schema)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          String(theme.name ?? id),
          String(theme.version ?? '1.0.0'),
          String(theme.layout ?? 'default'),
          String(theme.sourcePath ?? ''),
          theme.preview ? String(theme.preview) : null,
          theme.description ? String(theme.description) : null,
          theme.enabled === false ? 0 : 1,
          toJsonColumn(theme.cssDefaults ?? null),
          toJsonColumn(theme.themeTokens ?? null),
          toJsonColumn(theme.fields ?? null),
        ],
      );
    }

    for (const row of legacyCustomThemes) {
      const theme = normalizeJsonPayload(row.payload);
      const id = String(theme.id ?? row.record_id);
      const pageId = String(theme.pageId ?? '');
      if (!pageId) {
        continue;
      }
      const [pageRows] = await pool.execute<RowDataPacket[]>(`SELECT id FROM pages WHERE id = ? LIMIT 1`, [pageId]);
      if (pageRows.length === 0) {
        continue;
      }

      await pool.execute(
        `INSERT INTO custom_themes (id, page_id, name, version, is_default, is_active, config, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP), COALESCE(?, CURRENT_TIMESTAMP))`,
        [
          id,
          pageId,
          String(theme.name ?? id),
          String(theme.version ?? '1.0.0'),
          theme.isDefault === true ? 1 : 0,
          theme.isActive === true ? 1 : 0,
          JSON.stringify(theme),
          theme.createdAt ? String(theme.createdAt) : null,
          theme.updatedAt ? String(theme.updatedAt) : null,
        ] as ExecuteValues,
      );
    }

    for (const row of legacyPlugins) {
      const plugin = normalizeJsonPayload(row.payload);
      const id = String(plugin.id ?? row.record_id);
      await pool.execute(
        `INSERT INTO plugins (id, name, version, plugin_type, entry, source_path, enabled, permissions)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          String(plugin.name ?? id),
          String(plugin.version ?? '1.0.0'),
          String(plugin.type ?? 'block'),
          String(plugin.entry ?? ''),
          String(plugin.sourcePath ?? ''),
          plugin.enabled === false ? 0 : 1,
          toJsonColumn(plugin.permissions ?? []),
        ],
      );
    }

    for (const row of legacyForms) {
      const form = normalizeJsonPayload(row.payload);
      const id = String(form.id ?? row.record_id);
      await pool.execute(
        `INSERT INTO contact_forms (id, name, description, submit_label, success_message, status, fields, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP), COALESCE(?, CURRENT_TIMESTAMP))`,
        [
          id,
          String(form.name ?? id),
          form.description ? String(form.description) : null,
          String(form.submitLabel ?? 'Gửi'),
          form.successMessage ? String(form.successMessage) : null,
          String(form.status ?? 'active'),
          JSON.stringify(form.fields ?? []),
          form.createdAt ? String(form.createdAt) : null,
          form.updatedAt ? String(form.updatedAt) : null,
        ] as ExecuteValues,
      );
    }

    for (const row of legacySubmissions) {
      const submission = normalizeJsonPayload(row.payload);
      const id = String(submission.id ?? row.record_id);
      const metadata = (submission.metadata as Record<string, unknown> | undefined) ?? {};
      await pool.execute(
        `INSERT INTO contact_form_submissions (id, form_id, payload, ip, user_agent, page_url, field_labels, submitted_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP))`,
        [
          id,
          String(submission.formId ?? ''),
          JSON.stringify(submission.payload ?? {}),
          String(metadata.ip ?? ''),
          metadata.userAgent ? String(metadata.userAgent) : null,
          metadata.pageUrl ? String(metadata.pageUrl) : null,
          toJsonColumn(metadata.fieldLabels ?? null),
          metadata.submittedAt ? String(metadata.submittedAt) : null,
        ] as ExecuteValues,
      );
    }

    for (const row of legacyMedia) {
      const media = normalizeJsonPayload(row.payload);
      const id = String(media.id ?? row.record_id);
      await pool.execute(
        `INSERT INTO media (id, owner_id, original_name, mime_type, size, purpose, width, height, storage_key, preview_path, thumb_path, public_url, variants)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          media.ownerId ? String(media.ownerId) : null,
          String(media.originalName ?? 'upload'),
          String(media.mimeType ?? 'application/octet-stream'),
          Number(media.size ?? 0),
          media.purpose ? String(media.purpose) : null,
          media.width == null ? null : Number(media.width),
          media.height == null ? null : Number(media.height),
          String(media.storageKey ?? `${id}/original`),
          media.previewPath ? String(media.previewPath) : null,
          media.thumbPath ? String(media.thumbPath) : null,
          String(media.publicUrl ?? ''),
          toJsonColumn(media.variants ?? {}),
        ],
      );
    }

    for (const row of legacyPageViews) {
      const event = normalizeJsonPayload(row.payload);
      const id = String(event.id ?? row.record_id);
      const pageId = String(event.pageId ?? '');
      if (!pageId) {
        continue;
      }
      const [pageRows] = await pool.execute<RowDataPacket[]>(`SELECT id FROM pages WHERE id = ? LIMIT 1`, [pageId]);
      if (pageRows.length === 0) {
        continue;
      }

      await pool.execute(
        `INSERT INTO page_view_events (id, page_id, slug, viewed_at, country_code, device, user_agent, referrer)
         VALUES (?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP), ?, ?, ?, ?)`,
        [
          id,
          pageId,
          String(event.slug ?? ''),
          event.viewedAt ? String(event.viewedAt) : null,
          String(event.countryCode ?? ''),
          String(event.device ?? 'unknown'),
          event.userAgent ? String(event.userAgent) : null,
          event.referrer ? String(event.referrer) : null,
        ] as ExecuteValues,
      );
    }

    for (const row of legacyOnboarding) {
      const session = normalizeJsonPayload(row.payload);
      const id = String(session.id ?? row.record_id);
      const userId = String(session.userId ?? '');
      if (!userId) {
        continue;
      }
      const pageId = session.pageId ? String(session.pageId) : null;
      const { id: _id, userId: _userId, pageId: _pageId, status, currentStep, startedAt, completedAt, updatedAt, ...sessionData } =
        session;

      await pool.execute(
        `INSERT INTO onboarding_sessions (id, user_id, page_id, status, current_step, session_data, started_at, completed_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP), ?, COALESCE(?, CURRENT_TIMESTAMP))`,
        [
          id,
          userId,
          pageId,
          String(status ?? 'in_progress'),
          Number(currentStep ?? 1),
          JSON.stringify(sessionData),
          startedAt ? String(startedAt) : null,
          completedAt ? String(completedAt) : null,
          updatedAt ? String(updatedAt) : null,
        ] as ExecuteValues,
      );
    }

    for (const row of legacyAiChat) {
      const session = normalizeJsonPayload(row.payload);
      const id = String(session.id ?? row.record_id);
      const userId = String(session.userId ?? '');
      if (!userId) {
        continue;
      }
      const pageId = session.pageId ? String(session.pageId) : null;
      const {
        id: _id,
        userId: _userId,
        username,
        pageId: _pageId,
        status,
        currentStep,
        createdAt,
        updatedAt,
        ...sessionData
      } = session;

      await pool.execute(
        `INSERT INTO ai_chat_sessions (id, user_id, username, page_id, status, current_step, session_data, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP), COALESCE(?, CURRENT_TIMESTAMP))`,
        [
          id,
          userId,
          String(username ?? ''),
          pageId,
          String(status ?? 'collecting'),
          Number(currentStep ?? 0),
          JSON.stringify(sessionData),
          createdAt ? String(createdAt) : null,
          updatedAt ? String(updatedAt) : null,
        ] as ExecuteValues,
      );
    }

    for (const row of legacyEmailLogs) {
      const log = normalizeJsonPayload(row.payload);
      const id = String(log.id ?? row.record_id);
      await pool.execute(
        `INSERT INTO email_logs (id, recipient, subject, template, status, error_message, created_at)
         VALUES (?, ?, ?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP))`,
        [
          id,
          String(log.to ?? ''),
          String(log.subject ?? ''),
          String(log.template ?? ''),
          String(log.status ?? 'queued'),
          log.errorMessage ? String(log.errorMessage) : null,
          log.createdAt ? String(log.createdAt) : null,
        ] as ExecuteValues,
      );
    }

    for (const row of legacyUsers) {
      const user = normalizeJsonPayload(row.payload);
      const id = String(user.id ?? row.record_id);
      await pool.execute(
        `INSERT INTO user_profiles (id, name, role, deleted, metadata)
         VALUES (?, ?, ?, ?, ?)`,
        [
          id,
          String(user.name ?? 'User'),
          String(user.role ?? 'creator'),
          user.deleted === true ? 1 : 0,
          toJsonColumn(user),
        ],
      );
    }

    await this.seedDemoData(pool);
    await this.finalizeSchema(pool);
    this.logger.log('Legacy JSON to relational migration complete');
  }

  private async seedDemoData(pool: Pool): Promise<void> {
    await pool.execute(
      `INSERT IGNORE INTO user_profiles (id, name, role) VALUES ('u-demo', 'Demo User', 'creator')`,
    );
    await pool.execute(
      `INSERT IGNORE INTO themes (id, name, version, enabled)
       VALUES ('minimal', 'Minimal Theme', '1.0.0', 1), ('theme-demo', 'Minimal Theme', '1.0.0', 1)`,
    );
    await pool.execute(
      `INSERT IGNORE INTO plugins (id, name, version, plugin_type, enabled)
       VALUES ('plugin-demo', 'Hero Block', '1.0.0', 'block', 1)`,
    );
    await pool.execute(
      `INSERT IGNORE INTO pages (id, title, slug, username, theme_id, status)
       VALUES ('p-demo', 'My Landing Page', 'my-landing-page', 'demo', 'minimal', 'draft')`,
    );
  }

  private async readLegacyTable(pool: Pool, tableName: string): Promise<LegacyRow[]> {
    const exists = await this.tableExists(pool, tableName);
    if (!exists) {
      return [];
    }

    const hasPayload = await this.tableHasColumn(pool, tableName, 'payload');
    if (!hasPayload) {
      return [];
    }

    const [rows] = await pool.execute<LegacyRow[]>(`SELECT record_id, payload FROM ${tableName}`);
    return rows;
  }

  private async tableExists(pool: Pool, tableName: string): Promise<boolean> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS total
       FROM information_schema.TABLES
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
      [tableName],
    );
    return Number(rows[0]?.total ?? 0) > 0;
  }

  private async tableHasColumn(pool: Pool, tableName: string, columnName: string): Promise<boolean> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS total
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = ?
         AND COLUMN_NAME = ?`,
      [tableName, columnName],
    );
    return Number(rows[0]?.total ?? 0) > 0;
  }
}
