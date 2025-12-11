'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { portfoliosApi, tagsApi } from '@/lib/api';
import { PortfolioCard } from '@/components/portfolio/portfolio-card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

function PortfoliosSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-video w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export default function PortfoliosPage() {
  const [search, setSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { data: tagsData } = useQuery({
    queryKey: ['tags'],
    queryFn: () => tagsApi.getTags(),
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['portfolios', search, selectedTags],
    queryFn: () =>
      portfoliosApi.getPortfolios({
        search: search || undefined,
        tag_ids: selectedTags.length > 0 ? selectedTags.join(',') : undefined,
        limit: 50,
      }),
  });

  const portfolios = data?.data || [];
  const tags = tagsData?.data || [];

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Katalog Portofolio Siswa SMKN 4 Malang</h1>
        <p className="text-muted-foreground">Jelajahi karya-karya terbaik dari siswa dan alumni</p>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cari portofolio..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tags Filter */}
      {tags.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge
              key={tag.id}
              variant={selectedTags.includes(tag.id) ? 'default' : 'outline'}
              className={cn('cursor-pointer', selectedTags.includes(tag.id) && 'pr-1')}
              onClick={() => toggleTag(tag.id)}
            >
              {tag.nama}
              {selectedTags.includes(tag.id) && <X className="ml-1 h-3 w-3" />}
            </Badge>
          ))}
        </div>
      )}

      {/* Portfolios Grid */}
      {isLoading ? (
        <PortfoliosSkeleton />
      ) : error ? (
        <p className="text-muted-foreground">Gagal memuat data. Silakan coba lagi.</p>
      ) : portfolios.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">
            {search || selectedTags.length > 0
              ? 'Tidak ada portofolio yang ditemukan.'
              : 'Belum ada portofolio.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {portfolios.map((portfolio) => (
            <PortfolioCard key={portfolio.id} portfolio={portfolio} />
          ))}
        </div>
      )}
    </div>
  );
}
