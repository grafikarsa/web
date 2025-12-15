# Grafikarsa Web Client

Platform Katalog Portofolio & Social Network untuk Warga SMKN 4 Malang.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **UI Components:** shadcn/ui + Radix UI
- **State Management:** Zustand + TanStack Query
- **Forms:** React Hook Form + Zod
- **Animation:** Framer Motion

## Prerequisites

- Node.js 18+
- npm or pnpm
- Backend API running (see [grafikarsa-backend](https://github.com/grafikarsa/backend))

## Getting Started

### 1. Clone Repository

```bash
git clone https://github.com/grafikarsa/web.git
cd grafikarsa-web
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── (main)/            # Public routes (landing, profiles, portfolios)
│   ├── admin/             # Admin dashboard
│   ├── api/               # API routes (upload proxy)
│   └── layout.tsx         # Root layout
├── components/
│   ├── admin/             # Admin-specific components
│   ├── landing/           # Landing page sections
│   ├── layout/            # Layout components (navbar, footer)
│   ├── portfolio/         # Portfolio-related components
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── api/               # API client & functions
│   ├── types/             # TypeScript types
│   └── utils.ts           # Utility functions
├── stores/                # Zustand stores
└── public/                # Static assets
```

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8080/api/v1` |
| `NEXT_PUBLIC_APP_URL` | Frontend URL | `http://localhost:3000` |
| `NEXT_PUBLIC_STORAGE_URL` | CDN/Storage URL (optional) | `http://localhost:9000/grafikarsa` |

## Deployment

### Cloudflare Pages

1. Connect repository to Cloudflare Pages
2. Build settings:
   - Framework preset: `Next.js`
   - Build command: `npm run build`
   - Build output: `.next`
3. Add environment variables in Cloudflare dashboard

### Vercel

```bash
npm i -g vercel
vercel
```

## Related Repositories

- [grafikarsa-backend](https://github.com/rafapradana/grafikarsa-backend) - Go/Fiber API

## License

Proprietary - All rights reserved.

## Contact

- Email: rafapradana.com@gmail.com
