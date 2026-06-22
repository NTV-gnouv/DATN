# DATN — ShotVN

Đồ án tốt nghiệp: nền tảng tạo trang đích cá nhân (link-in-bio / landing page builder), tương tự Beacons.ai.

## Công nghệ

| Phần | Stack |
|------|-------|
| Frontend | React 19, TypeScript, Vite, React Router |
| Backend | NestJS, MySQL, JWT |
| Khác | Sharp (xử lý ảnh), Nodemailer, Gemini AI, Cloudflare R2 |

## Cấu trúc thư mục

```
DATN/
├── backend/          # API NestJS
│   ├── src/          # source code
│   ├── database/     # schema & seed SQL
│   ├── plugins/      # block plugins
│   └── themes/     # theme runtime
└── front-end/        # giao diện React
    ├── src/
    └── public/
```

## Chạy local

### Backend

```bash
cd backend
npm install
cp .env.example .env   # điền DB, JWT, API keys
npm run db:import
npm run start:dev
```

API docs: http://localhost:3000/api/docs

### Frontend

```bash
cd front-end
npm install
npm run dev
```

Mặc định frontend gọi API tại `http://localhost:3000/api`.

## Tài khoản test

- Email: `admin@shotvn.local`
- Password: `Admin@123`

## Lưu ý

- Không commit file `.env` — chỉ dùng `.env.example` làm mẫu.
- Cần MySQL 8+ đang chạy trước khi start backend.
