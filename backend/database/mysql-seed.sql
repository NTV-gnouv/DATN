-- ShotVN seed data (optional — backend cũng seed khi khởi động lần đầu)
-- Dùng INSERT IGNORE để không ghi đè dữ liệu đã có

INSERT IGNORE INTO auth_users (record_id, payload)
VALUES ('admin@shotvn.local', JSON_OBJECT(
  'id', 'u-admin',
  'email', 'admin@shotvn.local',
  'name', 'System Admin',
  'role', 'admin',
  'onboardingCompleted', true,
  'passwordHash', '$2b$10$E0SsGvHLXFZ5vboPfsM/9ODAOifan3kqqmMHEAcGFbWKQdJYNscji'
));

INSERT IGNORE INTO users (record_id, payload)
VALUES ('u-demo', JSON_OBJECT('id', 'u-demo', 'name', 'Demo User', 'role', 'creator'));

INSERT IGNORE INTO pages (record_id, payload)
VALUES ('p-demo', JSON_OBJECT(
  'id', 'p-demo',
  'title', 'My Landing Page',
  'slug', 'my-landing-page',
  'username', 'demo',
  'status', 'draft'
));

INSERT IGNORE INTO themes (record_id, payload)
VALUES ('theme-demo', JSON_OBJECT('id', 'theme-demo', 'name', 'Minimal Theme', 'version', '1.0.0', 'enabled', true));

INSERT IGNORE INTO plugins (record_id, payload)
VALUES ('plugin-demo', JSON_OBJECT('id', 'plugin-demo', 'name', 'Hero Block', 'version', '1.0.0', 'type', 'block', 'enabled', true));
