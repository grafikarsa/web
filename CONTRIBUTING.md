# Contributing to Grafikarsa Web

Terima kasih atas minat Anda untuk berkontribusi pada project Grafikarsa!

## Sebelum Berkontribusi

Project ini bersifat **proprietary** dan hanya menerima kontribusi dari kontributor yang telah disetujui. Jika Anda ingin berkontribusi, silakan hubungi maintainer terlebih dahulu.

## Contact

Maintainer: rafapradana.com@gmail.com

## Code Style

- Gunakan TypeScript untuk semua file
- Ikuti ESLint rules yang sudah dikonfigurasi
- Gunakan Prettier untuk formatting
- Komponen menggunakan functional components dengan hooks
- Gunakan shadcn/ui untuk UI components

## Commit Messages

Format: `<type>: <description>`

Types:
- `feat`: Fitur baru
- `fix`: Bug fix
- `docs`: Dokumentasi
- `style`: Formatting, styling
- `refactor`: Refactoring
- `test`: Testing
- `chore`: Maintenance

Contoh:
```
feat: add portfolio gallery component
fix: resolve login redirect issue
docs: update README with deployment guide
```

## Pull Request

1. Fork repository (jika diizinkan)
2. Buat branch baru: `git checkout -b feat/nama-fitur`
3. Commit changes
4. Push ke branch
5. Buat Pull Request

## Development Guidelines

### Components

- Letakkan komponen di folder yang sesuai (`components/ui`, `components/layout`, dll)
- Gunakan TypeScript interfaces untuk props
- Export komponen sebagai named export

### API Calls

- Gunakan functions di `lib/api/` untuk API calls
- Handle loading dan error states
- Gunakan TanStack Query untuk data fetching

### Styling

- Gunakan Tailwind CSS classes
- Gunakan `cn()` utility untuk conditional classes
- Ikuti design system yang sudah ada
