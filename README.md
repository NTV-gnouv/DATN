# ShotVN — gói deploy

Thư mục này được tạo tự động bởi `npm run deploy:build`. Upload lên shared hosting hoặc chạy trực tiếp trên VPS.

## Cấu trúc

```
deploy/
├── backend/          # NestJS API (Node.js)
│   ├── dist/
│   ├── themes/
│   ├── plugins/
│   ├── database/     # schema SQL tham khảo
│   ├── .env          # cấu hình production
│   └── start.sh
├── frontend/         # React build tĩnh
│   ├── index.html
│   ├── assets/
│   ├── .htaccess     # Apache SPA fallback
│   ├── server.mjs    # Node static server (nếu host không có Apache)
│   └── start.sh
├── ports.env         # port & URL đã dùng khi build
└── start.sh          # chạy cả API + web
```

## Build lại từ máy dev

```bash
# Tùy chọn: copy và sửa domain/port
cp deploy.config.example deploy.config

npm run deploy:build
```

## Chạy trên server (VPS / host hỗ trợ Node)

```bash
# Sửa deploy/backend/.env (DB, JWT, SMTP, R2, Gemini...)
bash start.sh              # foreground + log ra màn hình
bash start.sh --daemon     # chạy nền
bash status.sh             # kiểm tra port / PID / log gần nhất
bash logs.sh               # xem log realtime
bash stop.sh               # dừng backend + frontend
```

Log ghi vào thư mục **`logs/`**:

| File | Nội dung |
|------|----------|
| `logs/backend.log` | NestJS API, lỗi DB, port |
| `logs/frontend.log` | Static server, request HTTP |
| `logs/backend.pid` | PID process API |
| `logs/frontend.pid` | PID process web |

Hoặc chạy riêng:

```bash
bash deploy/backend/start.sh    # API — port trong .env hoặc ports.env
bash deploy/frontend/start.sh   # Web — port 8080 (hoặc FRONTEND_PORT)
```

## Shared hosting (cPanel / Apache)

### Frontend (public_html)

1. Upload **toàn bộ nội dung** `deploy/frontend/` vào `public_html/`
2. Đảm bảo file `.htaccess` có mặt (SPA routing)
3. Không cần chạy Node cho frontend nếu Apache đã serve file tĩnh

### Backend (Node.js App)

1. Upload **toàn bộ** `deploy/backend/` lên thư mục app (ví dụ `shotvn-api/`)
2. Trong cPanel → **Setup Node.js App**:
   - **Application root**: thư mục backend
   - **Application startup file**: `dist/main.js`
   - **Application URL**: subdomain API (ví dụ `api.example.com`)
3. Thêm biến môi trường trong panel (hoặc dùng file `.env`):
   - `PORT` — port host cấp (thường tự inject)
   - `NODE_ENV=production`
   - `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`
   - `JWT_SECRET`
   - `PUBLIC_APP_URL=https://example.com`
   - `API_PUBLIC_URL=https://api.example.com/api`
4. Chạy `npm install --omit=dev` nếu panel yêu cầu (đã có sẵn `node_modules` sau build)

### Database

Import schema từ `deploy/backend/database/mysql-schema.sql` (và seed nếu cần).

### CORS / reverse proxy

- Frontend build mặc định dùng `VITE_API_BASE_URL=/api` (cùng host với web)
- `frontend/server.mjs` tự proxy `/api` → backend (`BACKEND_PORT`, mặc định 3000)
- Hoặc dùng Nginx: `scripts/nginx/landing.shotvn.com.conf` (`/` → 8080, `/api` → 3000)

### Lỗi đăng nhập "Failed to fetch" (không có log backend)

Request **không tới** NestJS — kiểm tra:

1. **F12 → Network** — URL login phải là `http(s)://<host-của-bạn>/api/auth/login`, không phải domain khác hoặc `http://` khi trang là `https://`
2. **Backend có chạy không:** `curl -s http://127.0.0.1:3000/api/docs | head`
3. **Proxy /api:** `curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:8080/api/docs` (hoặc port frontend bạn dùng)
4. Rebuild với `VITE_API_BASE_URL=/api` trong `deploy.config`, rồi `npm run deploy:build` và deploy lại

## Port mặc định

| Dịch vụ   | Port |
|-----------|------|
| Backend   | 3000 |
| Frontend  | 8080 |

Sửa trong `deploy.config` trước khi build, hoặc `deploy/ports.env` sau khi build.
