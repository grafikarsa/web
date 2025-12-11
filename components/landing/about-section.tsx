import { Palette, Upload, Users, LayoutGrid, Rss, Star } from 'lucide-react';
import { GridPattern } from '@/components/ui/grid-pattern';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: Palette,
    title: 'Temukan Karya Kreatif',
    description: 'Jelajahi portofolio siswa dan alumni yang unik dan inspiratif.',
  },
  {
    icon: Upload,
    title: 'Buat Portofolio Sendiri',
    description: 'Unggah karya dengan mudah dan tampilkan gaya kreatifmu.',
  },
  {
    icon: Users,
    title: 'Terhubung dengan Komunitas',
    description: 'Ikuti teman, alumni, dan temukan kreator lain di sekolahmu.',
  },
  {
    icon: LayoutGrid,
    title: 'Konten Modular',
    description: 'Tambahkan teks, gambar, video, dan blok interaktif untuk portofoliomu.',
  },
  {
    icon: Rss,
    title: 'Feed & Explore Inspiratif',
    description: 'Pantau karya terbaru dan temukan inspirasi setiap hari.',
  },
  {
    icon: Star,
    title: 'Ekspresikan Dirimu',
    description: 'Tampilkan bakat, minat, dan karya terbaikmu dengan cara yang unik.',
  },
];

function FeatureCard({
  feature,
  className,
}: {
  feature: (typeof features)[0];
  className?: string;
}) {
  const Icon = feature.icon;
  return (
    <div className={cn('relative overflow-hidden p-6', className)}>
      <div className="pointer-events-none absolute left-1/2 top-0 -ml-20 -mt-2 size-full [mask-image:radial-gradient(farthest-side_at_top,white,transparent)]">
        <GridPattern
          className="absolute inset-0 size-full stroke-foreground/20"
          height={40}
          width={40}
          x={5}
        />
      </div>
      <Icon aria-hidden className="size-6 text-foreground/75" strokeWidth={1} />
      <h3 className="mt-10 text-sm md:text-base">{feature.title}</h3>
      <p className="relative z-20 mt-2 text-xs font-light text-muted-foreground">
        {feature.description}
      </p>
    </div>
  );
}

export function AboutSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Tentang Grafikarsa</h2>
          <p className="text-lg text-muted-foreground">
            Platform untuk menampilkan portofolio dan membangun jaringan komunitas warga SMKN 4
            Malang
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl divide-y border md:grid-cols-2 md:divide-x md:divide-y-0 lg:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              feature={feature}
              className={cn(
                index >= 3 && 'md:border-t',
                index % 3 !== 0 && 'lg:border-l',
                index >= 3 && 'lg:border-t'
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
