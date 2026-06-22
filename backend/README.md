# ShotVN Backend

API NestJS cho nền tảng tạo trang đích ShotVN.

## Cấu trúc

- `src/main.ts` — bootstrap, CORS, validation, Swagger
- `src/core/` — config, database (MySQL), logger
- `src/modules/` — auth, pages, blocks, themes, media, analytics, AI, ...
- `src/bootstrap/` — quét plugin/theme khi khởi động
- `database/` — schema và seed SQL

## Chạy local

```bash
npm install
cp .env.example .env
npm run start:dev
```

Swagger: `http://localhost:3000/api/docs`

## Database

Cấu hình `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME` trong `.env`, rồi:

```bash
npm run db:import
```

## Tài khoản test

- Email: `admin@shotvn.local`
- Password: `Admin@123`
