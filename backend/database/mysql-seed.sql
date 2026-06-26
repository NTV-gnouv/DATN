-- ShotVN seed data (optional — backend cũng seed khi khởi động lần đầu)
-- Thứ tự insert tuân theo foreign key

INSERT IGNORE INTO auth_users (id, email, name, role, password_hash, onboarding_completed)
VALUES (
  'u-admin',
  'admin@shotvn.local',
  'System Admin',
  'admin',
  '$2b$10$E0SsGvHLXFZ5vboPfsM/9ODAOifan3kqqmMHEAcGFbWKQdJYNscji',
  1
);

INSERT IGNORE INTO user_profiles (id, name, role)
VALUES ('u-demo', 'Demo User', 'creator');

INSERT IGNORE INTO themes (id, name, version, enabled)
VALUES
  ('minimal', 'Minimal Theme', '1.0.0', 1),
  ('theme-demo', 'Minimal Theme', '1.0.0', 1);

INSERT IGNORE INTO plugins (id, name, version, plugin_type, enabled)
VALUES ('plugin-demo', 'Hero Block', '1.0.0', 'block', 1);

INSERT IGNORE INTO pages (id, title, slug, username, theme_id, status)
VALUES ('p-demo', 'My Landing Page', 'my-landing-page', 'demo', 'minimal', 'draft');

INSERT IGNORE INTO block_definitions (id, block_type, name, version, is_default, default_data)
VALUES (
  'block-header-default',
  'header',
  'header',
  '1.0.0',
  1,
  JSON_OBJECT('fields', JSON_OBJECT())
);
