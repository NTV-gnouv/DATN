# Media and Email Architecture

## Image processing

- Use Sharp for resize and format conversion.
- Generate variants for thumb, medium, large, WebP, and AVIF.
- Store originals and variants in object storage such as Cloudflare R2.
- Keep metadata in MySQL.
- Process heavy work in background workers when the project moves beyond the skeleton.

## Email delivery

- Use Nodemailer as the transport layer.
- Support SMTP in development and low-volume internal use.
- Prefer SES, Resend, SendGrid, or Postmark in production.
- Keep transactional email logs in the database.

## Recommended flow

```txt
Upload media
 ↓
Validate file
 ↓
Store original in object storage
 ↓
Generate variants with Sharp
 ↓
Persist metadata in MySQL
```

```txt
Application event
 ↓
Create email job
 ↓
Send via Nodemailer or provider API
 ↓
Log result
```