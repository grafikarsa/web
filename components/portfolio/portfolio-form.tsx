'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Plus, Save, Send, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Portfolio, Tag, ContentBlock, ContentBlockType } from '@/lib/types';
import { portfoliosApi, tagsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/auth-store';
import { BlockEditor } from './block-editor';

const portfolioSchema = z.object({
  judul: z.string().min(3, 'Judul minimal 3 karakter').max(200),
  thumbnail_url: z.string().url('URL tidak valid').optional().or(z.literal('')),
});

type PortfolioFormData = z.infer<typeof portfolioSchema>;

interface PortfolioFormProps {
  portfolio?: Portfolio;
  isEdit?: boolean;
}

export function PortfolioForm({ portfolio, isEdit = false }: PortfolioFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [selectedTags, setSelectedTags] = useState<Tag[]>(portfolio?.tags || []);
  const [blocks, setBlocks] = useState<ContentBlock[]>(portfolio?.content_blocks || []);

  const form = useForm<PortfolioFormData>({
    resolver: zodResolver(portfolioSchema),
    defaultValues: {
      judul: portfolio?.judul || '',
      thumbnail_url: portfolio?.thumbnail_url || '',
    },
  });

  const { data: tagsData } = useQuery({
    queryKey: ['tags'],
    queryFn: () => tagsApi.getTags(),
  });

  const availableTags = tagsData?.data || [];

  const createMutation = useMutation({
    mutationFn: (data: { judul: string; tag_ids?: string[] }) => portfoliosApi.createPortfolio(data),
    onSuccess: (response) => {
      if (response.data) {
        toast.success('Portfolio berhasil dibuat');
        router.push(`/${user?.username}/${response.data.slug}/edit`);
      }
    },
    onError: () => {
      toast.error('Gagal membuat portfolio');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { judul?: string; thumbnail_url?: string; tag_ids?: string[] }) =>
      portfoliosApi.updatePortfolio(portfolio!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio', portfolio?.slug] });
      toast.success('Portfolio berhasil diperbarui');
    },
    onError: () => {
      toast.error('Gagal memperbarui portfolio');
    },
  });

  const submitMutation = useMutation({
    mutationFn: () => portfoliosApi.submitPortfolio(portfolio!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio', portfolio?.slug] });
      toast.success('Portfolio berhasil diajukan untuk review');
      router.push(`/${user?.username}/${portfolio?.slug}`);
    },
    onError: () => {
      toast.error('Gagal mengajukan portfolio');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => portfoliosApi.deletePortfolio(portfolio!.id),
    onSuccess: () => {
      toast.success('Portfolio berhasil dihapus');
      router.push(`/${user?.username}`);
    },
    onError: () => {
      toast.error('Gagal menghapus portfolio');
    },
  });

  const handleSubmit = (data: PortfolioFormData) => {
    const tagIds = selectedTags.map((t) => t.id);
    if (isEdit && portfolio) {
      updateMutation.mutate({
        judul: data.judul,
        thumbnail_url: data.thumbnail_url || undefined,
        tag_ids: tagIds,
      });
    } else {
      createMutation.mutate({
        judul: data.judul,
        tag_ids: tagIds,
      });
    }
  };

  const toggleTag = (tag: Tag) => {
    setSelectedTags((prev) =>
      prev.some((t) => t.id === tag.id) ? prev.filter((t) => t.id !== tag.id) : [...prev, tag]
    );
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const canSubmit = isEdit && portfolio?.status === 'draft' && blocks.length > 0;
  const canDelete = isEdit && portfolio?.status === 'draft';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? 'Edit Portfolio' : 'Buat Portfolio Baru'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="judul">Judul Portfolio</Label>
              <Input id="judul" {...form.register('judul')} placeholder="Masukkan judul portfolio" />
              {form.formState.errors.judul && (
                <p className="text-sm text-destructive">{form.formState.errors.judul.message}</p>
              )}
            </div>

            {isEdit && (
              <div className="space-y-2">
                <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
                <Input
                  id="thumbnail_url"
                  {...form.register('thumbnail_url')}
                  placeholder="https://example.com/image.jpg"
                />
                {form.formState.errors.thumbnail_url && (
                  <p className="text-sm text-destructive">{form.formState.errors.thumbnail_url.message}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant={selectedTags.some((t) => t.id === tag.id) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag.nama}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                {isEdit ? 'Simpan' : 'Buat Portfolio'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {isEdit && portfolio && (
        <>
          <Separator />
          <BlockEditor portfolioId={portfolio.id} blocks={blocks} setBlocks={setBlocks} />
          <Separator />
          <Card>
            <CardContent className="flex flex-wrap gap-2 pt-6">
              {canSubmit && (
                <Button onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending}>
                  {submitMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Send className="mr-2 h-4 w-4" />
                  Ajukan Review
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (confirm('Yakin ingin menghapus portfolio ini?')) {
                      deleteMutation.mutate();
                    }
                  }}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus
                </Button>
              )}
              {portfolio.status === 'rejected' && portfolio.admin_review_note && (
                <div className="w-full rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                  <p className="text-sm font-medium text-destructive">Catatan Admin:</p>
                  <p className="text-sm">{portfolio.admin_review_note}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
