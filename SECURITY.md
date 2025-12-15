# Security Policy

## Reporting a Vulnerability

Jika Anda menemukan kerentanan keamanan pada project ini, mohon **JANGAN** membuat public issue.

Silakan laporkan secara privat ke:
- Email: rafapradana.com@gmail.com

Kami akan merespons dalam waktu 48 jam dan bekerja sama dengan Anda untuk memahami dan mengatasi masalah tersebut.

## Security Best Practices

### Environment Variables

- Jangan pernah commit file `.env.local` ke repository
- Gunakan environment variables untuk semua konfigurasi sensitif
- Pastikan `NEXT_PUBLIC_` prefix hanya untuk variabel yang aman di-expose ke client

### Authentication

- Access token disimpan di memory (bukan localStorage)
- Refresh token menggunakan HttpOnly cookie
- Implementasi auto-refresh untuk expired tokens

### API Calls

- Semua API calls menggunakan HTTPS di production
- CORS dikonfigurasi dengan whitelist origin yang spesifik
- Rate limiting diaktifkan di backend

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
