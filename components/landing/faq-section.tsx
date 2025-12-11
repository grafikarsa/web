'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const faqs = [
  {
    question: 'Apa itu Grafikarsa?',
    answer:
      'Grafikarsa adalah platform katalog portofolio dan social network khusus untuk warga SMKN 4 Malang. Di sini, siswa dan alumni dapat menampilkan karya mereka dan terhubung dengan komunitas.',
  },
  {
    question: 'Siapa yang bisa menggunakan Grafikarsa?',
    answer:
      'Grafikarsa dapat digunakan oleh siswa aktif dan alumni SMKN 4 Malang. Akun dibuat oleh admin sekolah, jadi tidak ada registrasi mandiri.',
  },
  {
    question: 'Bagaimana cara membuat portofolio?',
    answer:
      'Setelah login, kamu bisa membuat portofolio baru dengan menambahkan judul, thumbnail, dan berbagai blok konten seperti teks, gambar, video YouTube, tabel, dan lainnya.',
  },
  {
    question: 'Apakah portofolio langsung tampil di publik?',
    answer:
      'Tidak. Setelah kamu submit portofolio, admin akan mereview terlebih dahulu. Jika disetujui, portofolio akan tampil di publik.',
  },
  {
    question: 'Bagaimana cara mendapatkan akun?',
    answer:
      'Akun dibuat oleh admin sekolah. Hubungi guru atau admin yang bertanggung jawab untuk mendapatkan kredensial login.',
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="bg-muted/50 py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Pertanyaan Umum</h2>
          <p className="text-lg text-muted-foreground">
            Temukan jawaban untuk pertanyaan yang sering diajukan
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-3xl space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-lg border bg-background"
            >
              <button
                className="flex w-full items-center justify-between p-4 text-left font-medium transition-colors hover:bg-muted/50"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                aria-expanded={openIndex === index}
              >
                {faq.question}
                <ChevronDown
                  className={cn(
                    'h-5 w-5 text-muted-foreground transition-transform',
                    openIndex === index && 'rotate-180'
                  )}
                />
              </button>
              <div
                className={cn(
                  'grid transition-all duration-200',
                  openIndex === index ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                )}
              >
                <div className="overflow-hidden">
                  <p className="border-t p-4 text-muted-foreground">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
