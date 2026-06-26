-- ShotVN MySQL schema (relational + hardening)
-- Đồng bộ với relational-schema.service.ts + database-hardening.service.ts

CREATE TABLE IF NOT EXISTS auth_users (
  id VARCHAR(191) NOT NULL,
  email VARCHAR(191) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('creator', 'admin') NOT NULL DEFAULT 'creator',
  password_hash VARCHAR(255) NOT NULL,
  onboarding_completed TINYINT(1) NOT NULL DEFAULT 0,
  metadata JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_auth_users_email (email),
  KEY idx_auth_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS auth_refresh_tokens (
  user_id VARCHAR(191) NOT NULL,
  refresh_token TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  CONSTRAINT fk_auth_refresh_tokens_user
    FOREIGN KEY (user_id) REFERENCES auth_users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS auth_password_reset_tokens (
  token VARCHAR(191) NOT NULL,
  user_id VARCHAR(191) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (token),
  KEY idx_auth_password_reset_user (user_id),
  KEY idx_auth_password_reset_expires (expires_at),
  CONSTRAINT fk_auth_password_reset_user
    FOREIGN KEY (user_id) REFERENCES auth_users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_profiles (
  id VARCHAR(191) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(32) NOT NULL DEFAULT 'creator',
  deleted TINYINT(1) NOT NULL DEFAULT 0,
  metadata JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  KEY idx_pages_status_owner (status, owner_id),
  CONSTRAINT fk_pages_owner FOREIGN KEY (owner_id) REFERENCES auth_users (id) ON DELETE SET NULL,
  CONSTRAINT fk_pages_theme FOREIGN KEY (theme_id) REFERENCES themes (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  KEY idx_block_definitions_type (block_type),
  CONSTRAINT fk_block_definitions_plugin FOREIGN KEY (plugin_id) REFERENCES plugins (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS page_blocks (
  id VARCHAR(191) NOT NULL,
  page_id VARCHAR(191) NOT NULL,
  block_type VARCHAR(64) NOT NULL,
  definition_id VARCHAR(191) NULL,
  ref_entity VARCHAR(32) NULL,
  ref_id VARCHAR(191) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  visible TINYINT(1) NOT NULL DEFAULT 1,
  data JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_page_blocks_page (page_id),
  KEY idx_page_blocks_type (block_type),
  KEY idx_page_blocks_page_type_order (page_id, block_type, sort_order),
  KEY idx_page_blocks_ref (ref_entity, ref_id),
  KEY idx_page_blocks_definition (definition_id),
  CONSTRAINT fk_page_blocks_page FOREIGN KEY (page_id) REFERENCES pages (id) ON DELETE CASCADE,
  CONSTRAINT fk_page_blocks_definition FOREIGN KEY (definition_id) REFERENCES block_definitions (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  KEY idx_custom_themes_page_active (page_id, is_active),
  CONSTRAINT fk_custom_themes_page FOREIGN KEY (page_id) REFERENCES pages (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS contact_forms (
  id VARCHAR(191) NOT NULL,
  name VARCHAR(191) NOT NULL,
  description TEXT NULL,
  submit_label VARCHAR(128) NOT NULL DEFAULT 'Gửi',
  success_message TEXT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  page_id VARCHAR(191) NULL,
  fields JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_contact_forms_page FOREIGN KEY (page_id) REFERENCES pages (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  KEY idx_contact_submissions_form_submitted (form_id, submitted_at),
  CONSTRAINT fk_contact_submissions_form FOREIGN KEY (form_id) REFERENCES contact_forms (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  KEY idx_media_owner (owner_id),
  KEY idx_media_owner_created (owner_id, created_at),
  CONSTRAINT fk_media_owner FOREIGN KEY (owner_id) REFERENCES auth_users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  KEY idx_page_views_page_viewed_at (page_id, viewed_at),
  KEY idx_page_views_page_country (page_id, country_code),
  KEY idx_page_views_page_device (page_id, device),
  CONSTRAINT fk_page_views_page FOREIGN KEY (page_id) REFERENCES pages (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS analytics (
  record_id VARCHAR(191) NOT NULL,
  payload JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (record_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admin_records (
  record_id VARCHAR(191) NOT NULL,
  payload JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (record_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
