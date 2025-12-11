import { Palette, Upload, Users, LayoutGrid, Rss, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

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

export function AboutSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Tentang Grafikarsa</h2>
          <p className="text-lg text-muted-foreground">
            Platform untuk menampilkan portofolio dan membangun jaringan komunitas warga SMKN 4 Malang
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="border-2 transition-colors hover:border-primary/50">
                <CardContent className="p-6">
                  <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
