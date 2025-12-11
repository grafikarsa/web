'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Eye, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable, Column } from '@/components/admin/data-table';
import { adminPortfoliosApi } from '@/lib/api/admin';
import { PortfolioCard, PortfolioStatus } from '@/lib/types';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { formatDate } from '@/lib/utils/format';
import Link from 'next/link';

const statusOptions: { value: string; label: string }[] = [
  { value: 'all', label: 'Semua Status' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending_review', label: 'Pending Review' },
  { value: 'published', label: 'Published' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'archived', label: 'Archived' },
];

const statusVariants: Record<PortfolioStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'secondary',
  pending_review: 'outline',
  published: 'default',
  rejected: 'destructive',
  archived: 'secondary',
};

export default function AdminPortfoliosPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-portfolios', debouncedSearch, status, page],
    queryFn: () =>
      adminPortfoliosApi.getPortfolios({
        search: debouncedSearch || undefined,
        status: status === 'all' ? undefined : status,
        page,
        limit: 20,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminPortfoliosApi.deletePortfolio(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-portfolios'] });
      toast.success('Portfolio berhasil dihapus');
    },
    onError: () => {
      toast.error('Gagal menghapus portfolio');
    },
  });

  const portfolios = data?.data || [];
  const pagination = data?.pagination;

  const columns: Column<PortfolioCard>[] = [
    {
      key: 'thumbnail',
      header: '',
      render: (p) => (
        <div className="h-12 w-20 overflow-hidden rounded bg-muted">
          {p.thumbnail_url ? (
            <img src={p.thumbnail_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              No img
            </div>
          )}
        </div>
      ),
    },
    { key: 'judul', header: 'Judul' },
    {
      key: 'user',
      header: 'Owner',
      render: (p) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={p.user?.avatar_url} />
            <AvatarFallback>{p.user?.nama?.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-sm">{p.user?.nama}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (p) => (
        <Badge variant={statusVariants[p.status || 'draft']} className="capitalize">
          {p.status?.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      header: 'Dibuat',
      render: (p) => formatDate(p.created_at),
    },
  ];

  const handleDelete = (portfolio: PortfolioCard) => {
    if (confirm(`Yakin ingin menghapus portfolio "${portfolio.judul}"?`)) {
      deleteMutation.mutate(portfolio.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Portfolios</h1>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        data={portfolios}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Cari judul portfolio..."
        onSearch={setSearch}
        onDelete={handleDelete}
        page={page}
        totalPages={pagination?.total_pages || 1}
        onPageChange={setPage}
        actions={(p) => (
          <Link href={`/${p.user?.username}/${p.slug}`} target="_blank">
            <Button variant="ghost" size="icon" title="Lihat">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </Link>
        )}
      />
    </div>
  );
}
