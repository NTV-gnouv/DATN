# Database

## MySQL 8+

Backend dùng MySQL với mô hình **JSON document store** (mỗi bảng: `record_id` + `payload` JSON).

### Thiết lập trên máy mới

1. Cài MySQL 8+ và mysql client.
2. Cấu hình `backend/.env` (copy từ `.env.example`):

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=shotvn
DB_USER=root
DB_PASS=your_password
```

3. Import schema + seed:

```bash
cd backend
npm run db:import
```

Script sẽ:
- Tạo database `shotvn` nếu chưa có
- Import `database/mysql-schema.sql` (17 bảng)
- Import `database/mysql-seed.sql` (admin + dữ liệu demo tối thiểu)

4. Chạy backend — tự động bổ sung bảng/seed thiếu và **rescan themes/plugins**:

```bash
npm run start:dev
```

### Bảng dữ liệu

| Bảng | Mục đích |
|------|----------|
| `auth_users` | Tài khoản đăng nhập |
| `auth_refresh_tokens` | Refresh token JWT |
| `auth_password_reset_tokens` | Reset mật khẩu |
| `users` | Profile user (legacy/demo) |
| `pages` | Trang landing |
| `blocks` | Block header/content |
| `themes` | Theme catalog (DB) |
| `custom_themes` | Theme tùy chỉnh / AI |
| `plugins` | Plugin catalog |
| `contact_forms` | Form liên hệ |
| `contact_form_submissions` | Submission form |
| `media` | Metadata file upload |
| `email_logs` | Log email |
| `analytics` | Analytics tổng hợp |
| `page_view_events` | Sự kiện xem trang |
| `admin_records` | Dữ liệu admin |
| `onboarding_sessions` | Onboarding wizard (legacy) |
| `ai_chat_sessions` | Phiên chat AI tạo giao diện |

### Seed mặc định

- **Admin:** `admin@shotvn.local` / `Admin@123` (`onboardingCompleted: true`)
- **Demo page:** `p-demo` (slug `my-landing-page`) — chỉ để dev/test
- User đăng ký mới: `onboardingCompleted: false`, không có trang sẵn

### Themes & plugins

Theme runtime load từ thư mục `backend/themes/` khi backend khởi động (không nằm hết trong SQL seed). Có thể gọi `POST /api/themes/admin/rescan` để nạp lại.

## Khác (đề xuất triển khai sau)

- Redis cho cache/session
- ClickHouse cho analytics quy mô lớn
- Cloudflare R2 cho media (xem `media-email-architecture.md`)
