'use client';

import { Palette, Upload, Users, LayoutGrid, Rss, Star } from 'lucide-react';

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
    title: 'Feed & Explore',
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
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-semibold tracking-tight">Tentang Grafikarsa</h2>
          <p className="mt-2 text-muted-foreground">
            Platform untuk menampilkan portofolio dan membangun jaringan komunitas warga SMKN 4 Malang
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group rounded-xl border bg-card p-6 transition-all hover:shadow-md"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-medium">{feature.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
