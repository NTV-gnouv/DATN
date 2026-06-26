# Database

## MySQL 8+

Backend dùng **schema relational chuẩn** với foreign key. Dữ liệu đa dạng theo loại (block data, theme config) vẫn lưu JSON nhưng **gắn FK** — không còn document store `record_id + payload` cho entity chính.

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

Script import `database/mysql-schema.sql` (đã gồm hardening: indexes, FK, `contact_form_submission_fields`, cột `page_blocks.definition_id/ref_*`).

4. Chạy backend — DB cũ (JSON `payload`) vẫn tự migrate khi start:

```bash
npm run start:dev
```

### Sơ đồ quan hệ chính

```
auth_users
  ├── auth_refresh_tokens (FK user_id)
  ├── auth_password_reset_tokens (FK user_id)
  ├── pages (FK owner_id)
  │     ├── page_blocks (FK page_id) — data JSON theo loại block
  │     ├── custom_themes (FK page_id)
  │     └── page_view_events (FK page_id)
  ├── onboarding_sessions (FK user_id, page_id)
  └── ai_chat_sessions (FK user_id, page_id)

block_definitions — registry block (metadata + default_data JSON)
themes — catalog theme (metadata + css_defaults/field_schema JSON)
plugins — catalog plugin
contact_forms → contact_form_submissions (FK form_id)
media — metadata file upload
email_logs
```

### Bảng dữ liệu

| Bảng | Mục đích |
|------|----------|
| `auth_users` | Tài khoản đăng nhập |
| `auth_refresh_tokens` | Refresh token JWT |
| `auth_password_reset_tokens` | Reset mật khẩu |
| `user_profiles` | Profile legacy/demo |
| `pages` | Trang landing (metadata + theme_tokens) |
| `page_blocks` | Block instance trên page (FK + data JSON) |
| `block_definitions` | Block registry / template mặc định |
| `themes` | Theme catalog |
| `custom_themes` | Theme tùy chỉnh theo page (FK) |
| `plugins` | Plugin catalog |
| `contact_forms` | Form liên hệ |
| `contact_form_submissions` | Submission form |
| `media` | Metadata file upload |
| `email_logs` | Log email |
| `page_view_events` | Sự kiện xem trang |
| `onboarding_sessions` | Onboarding wizard |
| `ai_chat_sessions` | Phiên chat AI |
| `analytics`, `admin_records` | JSON stub (chưa dùng đầy đủ) |

### Migration tự động

Khi khởi động, backend phát hiện bảng cũ có cột `payload` → migrate sang schema mới, giữ dữ liệu hiện có.

Sau đó `DatabaseHardeningService` tự chạy:

- Composite index cho truy vấn nhanh (`page_blocks`, `page_view_events`, `contact_form_submissions`, …)
- Foreign key bổ sung (`pages.theme_id`, `media.owner_id`, `page_blocks.definition_id`, …)
- Bảng `contact_form_submission_fields` — chuẩn hóa giá trị form để báo cáo bằng SQL `GROUP BY`
- Cột tham chiếu trên `page_blocks`: `definition_id`, `ref_entity`, `ref_id` (tìm block theo loại/liên kết không cần quét JSON)
- Gỡ snapshot `headerBlock` trùng trong `editor_config` (header chỉ nằm trong `page_blocks`)

### Giải quyết 4 rủi ro kỹ thuật

| Vấn đề | Giải pháp trong code |
|--------|----------------------|
| Hiệu suất truy vấn JSON | Index composite + cột `block_type`, `ref_*`; analytics dùng `COUNT/GROUP BY` SQL thay vì load toàn bộ events |
| Toàn vẹn dữ liệu | FK vật lý + `ON DELETE CASCADE`; transaction khi ghi blocks/submissions |
| Báo cáo submissions | Bảng `contact_form_submission_fields` + `aggregateSubmissionFields()` |
| Technical debt theme/block | Tách header khỏi `editor_config`; block instance vs definition tách bảng |

### Seed mặc định

- **Admin:** `admin@shotvn.local` / `Admin@123`
- **Demo page:** `p-demo` (slug `my-landing-page`)

### Themes & plugins

Theme runtime load từ `backend/themes/` khi backend khởi động. Gọi `POST /api/themes/admin/rescan` để nạp lại.
