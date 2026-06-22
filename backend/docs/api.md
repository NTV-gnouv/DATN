# API

Root prefix: `/api`

Nhom endpoints da scaffold:

- `/api/auth`
- `/api/users`
- `/api/pages`
- `/api/blocks`
- `/api/themes`
- `/api/plugins`
- `/api/media`
- `/api/analytics`
- `/api/admin`

Auth endpoints public:

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/refresh`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

Media endpoints:

- `POST /api/media/upload`
- `GET /api/media/:id/file`

Notification endpoints:

- `GET /api/notifications/email/logs`
- `POST /api/notifications/email/send`
- `POST /api/notifications/email/welcome`

Pages extras:

- `GET /api/pages/slug/:slug`
- `GET /api/pages/slug/:slug/available`
- `POST /api/pages/template`

Admin runtime endpoints (can role admin):

- `POST /api/plugins/admin/rescan`
- `POST /api/plugins/admin/:id/enable`
- `POST /api/plugins/admin/:id/disable`
- `POST /api/plugins/admin/:id/remove`
- `POST /api/themes/admin/rescan`
- `POST /api/themes/admin/:id/enable`
- `POST /api/themes/admin/:id/disable`
- `POST /api/themes/admin/:id/remove`
