# Database

De xuat:

- MySQL 8+ cho core data.
- Redis cho cache/session.
- ClickHouse cho analytics.
- JSON column cho block content dynamic.
- Plugin migration hooks cho custom schemas.

## Media storage

- Cloudflare R2 cho object storage.
- Sharp cho resize, convert WebP/AVIF, generate thumbnail.
- Luu metadata media trong bang `media_files` va `media_variants`.

## Email system

- Nodemailer cho outbound email.
- SMTP cho development va low-volume internal use.
- Provider production khuyen nghi: SES, Resend, SendGrid, Postmark.
