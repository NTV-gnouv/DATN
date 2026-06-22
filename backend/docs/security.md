# Security

Yeu cau can hoan thien:

- JWT auth + refresh token (implemented)
- RBAC/ABAC (RBAC via Roles guard implemented)
- Rate limiting
- Input validation/sanitization (ValidationPipe + DTO for auth implemented)
- CSP/XSS/CSRF protections
- Plugin sandbox
- Audit logging

Da implement:

- Global JWT guard (except endpoint co `@Public`)
- Global roles guard voi `@Roles('admin')`
- Global exception filter response format
- Global response interceptor envelope data
