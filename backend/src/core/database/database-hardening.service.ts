import { Injectable, Logger } from '@nestjs/common';
import { Pool, RowDataPacket } from 'mysql2/promise';

import { normalizeJsonPayload } from './json-payload.util';
import { resolveBlockReferences } from './block-reference.util';
import { persistSubmissionFields } from './submission-fields.util';

@Injectable()
export class DatabaseHardeningService {
  private readonly logger = new Logger(DatabaseHardeningService.name);

  async ensureEnhancements(pool: Pool): Promise<void> {
    await this.ensureSubmissionFieldsTable(pool);
    await this.ensurePageBlockReferenceColumns(pool);
    await this.ensureContactFormPageLink(pool);
    await this.ensurePerformanceIndexes(pool);
    await this.ensureReferentialIntegrity(pool);
    await this.backfillSubmissionFields(pool);
    await this.backfillPageBlockReferences(pool);
    await this.sanitizeEditorConfigSnapshots(pool);
    this.logger.log('Database hardening enhancements applied');
  }

  private async ensureSubmissionFieldsTable(pool: Pool): Promise<void> {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS contact_form_submission_fields (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        submission_id VARCHAR(191) NOT NULL,
        form_id VARCHAR(191) NOT NULL,
        field_key VARCHAR(128) NOT NULL,
        field_type VARCHAR(32) NOT NULL DEFAULT 'text',
        value_text TEXT NULL,
        value_number DECIMAL(20, 4) NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_submission_fields_form_field (form_id, field_key),
        KEY idx_submission_fields_submission (submission_id),
        KEY idx_submission_fields_form_submitted (form_id, created_at),
        CONSTRAINT fk_submission_fields_submission
          FOREIGN KEY (submission_id) REFERENCES contact_form_submissions (id) ON DELETE CASCADE,
        CONSTRAINT fk_submission_fields_form
          FOREIGN KEY (form_id) REFERENCES contact_forms (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  private async ensurePageBlockReferenceColumns(pool: Pool): Promise<void> {
    if (!(await this.columnExists(pool, 'page_blocks', 'definition_id'))) {
      await pool.execute(`ALTER TABLE page_blocks ADD COLUMN definition_id VARCHAR(191) NULL AFTER block_type`);
    }
    if (!(await this.columnExists(pool, 'page_blocks', 'ref_entity'))) {
      await pool.execute(`ALTER TABLE page_blocks ADD COLUMN ref_entity VARCHAR(32) NULL AFTER definition_id`);
    }
    if (!(await this.columnExists(pool, 'page_blocks', 'ref_id'))) {
      await pool.execute(`ALTER TABLE page_blocks ADD COLUMN ref_id VARCHAR(191) NULL AFTER ref_entity`);
    }
  }

  private async ensureContactFormPageLink(pool: Pool): Promise<void> {
    if (!(await this.columnExists(pool, 'contact_forms', 'page_id'))) {
      await pool.execute(`ALTER TABLE contact_forms ADD COLUMN page_id VARCHAR(191) NULL AFTER status`);
    }
  }

  private async ensurePerformanceIndexes(pool: Pool): Promise<void> {
    await this.addIndexIfMissing(pool, 'page_blocks', 'idx_page_blocks_page_type_order', 'page_id, block_type, sort_order');
    await this.addIndexIfMissing(pool, 'page_blocks', 'idx_page_blocks_ref', 'ref_entity, ref_id');
    await this.addIndexIfMissing(pool, 'page_blocks', 'idx_page_blocks_definition', 'definition_id');
    await this.addIndexIfMissing(pool, 'page_view_events', 'idx_page_views_page_viewed_at', 'page_id, viewed_at');
    await this.addIndexIfMissing(pool, 'page_view_events', 'idx_page_views_page_country', 'page_id, country_code');
    await this.addIndexIfMissing(pool, 'page_view_events', 'idx_page_views_page_device', 'page_id, device');
    await this.addIndexIfMissing(pool, 'contact_form_submissions', 'idx_contact_submissions_form_submitted', 'form_id, submitted_at');
    await this.addIndexIfMissing(pool, 'pages', 'idx_pages_status_owner', 'status, owner_id');
    await this.addIndexIfMissing(pool, 'custom_themes', 'idx_custom_themes_page_active', 'page_id, is_active');
    await this.addIndexIfMissing(pool, 'media', 'idx_media_owner_created', 'owner_id, created_at');
  }

  private async ensureReferentialIntegrity(pool: Pool): Promise<void> {
    await pool.execute(`
      UPDATE media
      SET owner_id = NULL
      WHERE owner_id IS NOT NULL
        AND owner_id NOT IN (SELECT id FROM auth_users)
    `);

    await pool.execute(`
      UPDATE pages
      SET theme_id = 'minimal'
      WHERE theme_id IS NOT NULL
        AND theme_id NOT IN (SELECT id FROM themes)
    `);

    await pool.execute(`
      UPDATE page_blocks
      SET definition_id = NULL
      WHERE definition_id IS NOT NULL
        AND definition_id NOT IN (SELECT id FROM block_definitions)
    `);

    await this.addForeignKeyIfMissing(
      pool,
      'fk_pages_theme',
      'pages',
      'theme_id',
      'themes',
      'id',
      'RESTRICT',
    );

    await this.addForeignKeyIfMissing(
      pool,
      'fk_media_owner',
      'media',
      'owner_id',
      'auth_users',
      'id',
      'SET NULL',
    );

    await this.addForeignKeyIfMissing(
      pool,
      'fk_block_definitions_plugin',
      'block_definitions',
      'plugin_id',
      'plugins',
      'id',
      'SET NULL',
    );

    await this.addForeignKeyIfMissing(
      pool,
      'fk_page_blocks_definition',
      'page_blocks',
      'definition_id',
      'block_definitions',
      'id',
      'SET NULL',
    );

    await this.addForeignKeyIfMissing(
      pool,
      'fk_contact_forms_page',
      'contact_forms',
      'page_id',
      'pages',
      'id',
      'SET NULL',
    );
  }

  private async backfillSubmissionFields(pool: Pool): Promise<void> {
    const [countRows] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS total FROM contact_form_submission_fields`,
    );
    if (Number(countRows[0]?.total ?? 0) > 0) {
      return;
    }

    const [submissions] = await pool.execute<RowDataPacket[]>(
      `SELECT id, form_id, payload FROM contact_form_submissions ORDER BY submitted_at ASC`,
    );

    for (const row of submissions) {
      await persistSubmissionFields(
        async (sql, params) => {
          await pool.execute(sql, params ?? []);
        },
        String(row.id),
        String(row.form_id),
        normalizeJsonPayload(row.payload),
      );
    }
  }

  private async backfillPageBlockReferences(pool: Pool): Promise<void> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, block_type, data FROM page_blocks WHERE ref_entity IS NULL OR definition_id IS NULL`,
    );

    for (const row of rows) {
      const data = normalizeJsonPayload(row.data);
      const refs = this.resolveBlockReferences(String(row.block_type), data);
      await pool.execute(
        `UPDATE page_blocks
         SET definition_id = COALESCE(definition_id, ?),
             ref_entity = COALESCE(ref_entity, ?),
             ref_id = COALESCE(ref_id, ?)
         WHERE id = ?`,
        [refs.definitionId, refs.refEntity, refs.refId, row.id],
      );
    }
  }

  private async sanitizeEditorConfigSnapshots(pool: Pool): Promise<void> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, editor_config FROM pages WHERE editor_config IS NOT NULL`,
    );

    for (const row of rows) {
      const editorConfig = normalizeJsonPayload(row.editor_config);
      if (!('headerBlock' in editorConfig)) {
        continue;
      }

      const { headerBlock: _headerBlock, ...leanConfig } = editorConfig;
      await pool.execute(`UPDATE pages SET editor_config = ? WHERE id = ?`, [
        JSON.stringify(leanConfig),
        row.id,
      ]);
    }
  }

  resolveBlockReferences(blockType: string, data: Record<string, unknown>) {
    return resolveBlockReferences(blockType, data);
  }

  private async addIndexIfMissing(
    pool: Pool,
    tableName: string,
    indexName: string,
    columns: string,
  ): Promise<void> {
    if (await this.indexExists(pool, tableName, indexName)) {
      return;
    }

    await pool.execute(`ALTER TABLE ${tableName} ADD INDEX ${indexName} (${columns})`);
  }

  private async addForeignKeyIfMissing(
    pool: Pool,
    constraintName: string,
    tableName: string,
    columnName: string,
    refTable: string,
    refColumn: string,
    onDelete: 'CASCADE' | 'SET NULL' | 'RESTRICT',
  ): Promise<void> {
    if (await this.foreignKeyExists(pool, tableName, constraintName)) {
      return;
    }

    if (!(await this.columnExists(pool, tableName, columnName))) {
      return;
    }

    try {
      await pool.execute(`
        ALTER TABLE ${tableName}
        ADD CONSTRAINT ${constraintName}
        FOREIGN KEY (${columnName}) REFERENCES ${refTable} (${refColumn})
        ON DELETE ${onDelete}
      `);
    } catch (error) {
      this.logger.warn(`Skipped FK ${constraintName}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async columnExists(pool: Pool, tableName: string, columnName: string): Promise<boolean> {
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

  private async indexExists(pool: Pool, tableName: string, indexName: string): Promise<boolean> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS total
       FROM information_schema.STATISTICS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = ?
         AND INDEX_NAME = ?`,
      [tableName, indexName],
    );
    return Number(rows[0]?.total ?? 0) > 0;
  }

  private async foreignKeyExists(pool: Pool, tableName: string, constraintName: string): Promise<boolean> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS total
       FROM information_schema.TABLE_CONSTRAINTS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = ?
         AND CONSTRAINT_NAME = ?
         AND CONSTRAINT_TYPE = 'FOREIGN KEY'`,
      [tableName, constraintName],
    );
    return Number(rows[0]?.total ?? 0) > 0;
  }
}
