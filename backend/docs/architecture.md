# Architecture

Backend NestJS theo mô hình module: mỗi domain có controller → service → repository.

- **Core** — config, kết nối MySQL, logger
- **Modules** — auth, pages, blocks, themes, media, analytics, AI, ...
- **Bootstrap** — quét plugin/theme từ thư mục `plugins/` và `themes/` khi start
- **Shared** — guards JWT, decorators, filters, interceptors

Dữ liệu chính lưu trên MySQL 8+. Media xử lý qua Sharp, email qua SMTP/Nodemailer.
