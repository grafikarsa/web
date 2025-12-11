import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 to-transparent" />
      
      <div className="container mx-auto px-4 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm text-primary">
            <Sparkles className="h-4 w-4" />
            Platform Portofolio SMKN 4 Malang
          </div>
          
          <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            Temukan Karya Terbaik{' '}
            <span className="text-primary">Warga SMKN 4 Malang</span>
          </h1>
          
          <p className="mb-8 text-lg text-muted-foreground md:text-xl">
            Jelajahi portofolio siswa & alumni, dan lihat bagaimana mereka berkarya hari ini!
          </p>
          
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/portfolios">
              <Button size="lg" className="gap-2">
                Jelajahi Portofolio
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
