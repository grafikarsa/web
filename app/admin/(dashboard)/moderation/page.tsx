'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, X, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { adminPortfoliosApi } from '@/lib/api/admin';
import { PortfolioCard } from '@/lib/types';
import { BlockRenderer } from '@/components/portfolio/block-renderer';
import { portfoliosApi } from '@/lib/api';

export default function ModerationPage() {
  const queryClient = useQueryClient();
  const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioCard | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [portfolioToReject, setPortfolioToReject] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-moderation'],
    queryFn: () => adminPortfoliosApi.getPortfolios({ status: 'pending_review', limit: 50 }),
  });

  const { data: detailData, isLoading: detailLoading } = useQuery({
    queryKey: ['portfolio-detail', selectedPortfolio?.id],
    queryFn: () => portfoliosApi.getPortfolioById(selectedPortfolio!.id),
    enabled: !!selectedPortfolio,
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => adminPortfoliosApi.approvePortfolio(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-moderation'] });
      toast.success('Portfolio berhasil disetujui');
      setSelectedPortfolio(null);
    },
    onError: () => {
      toast.error('Gagal menyetujui portfolio');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) => adminPortfoliosApi.rejectPortfolio(id, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-moderation'] });
      toast.success('Portfolio berhasil ditolak');
      setShowRejectDialog(false);
      setRejectNote('');
      setPortfolioToReject(null);
      setSelectedPortfolio(null);
    },
    onError: () => {
      toast.error('Gagal menolak portfolio');
    },
  });

  const portfolios = data?.data || [];

  const handleReject = (id: string) => {
    setPortfolioToReject(id);
    setShowRejectDialog(true);
  };

  const confirmReject = () => {
    if (portfolioToReject && rejectNote.trim()) {
      rejectMutation.mutate({ id: portfolioToReject, note: rejectNote });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Moderation</h1>
        <Badge variant="outline">{portfolios.length} pending</Badge>
      </div>

      {portfolios.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Tidak ada portfolio yang menunggu review</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {portfolios.map((portfolio) => (
            <Card key={portfolio.id} className="overflow-hidden">
              <div className="aspect-video bg-muted">
                {portfolio.thumbnail_url ? (
                  <img
                    src={portfolio.thumbnail_url}
                    alt={portfolio.judul}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    No thumbnail
                  </div>
                )}
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="line-clamp-1 text-lg">{portfolio.judul}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={portfolio.user?.avatar_url} />
                    <AvatarFallback>{portfolio.user?.nama?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">{portfolio.user?.nama}</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setSelectedPortfolio(portfolio)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => approveMutation.mutate(portfolio.id)}
                    disabled={approveMutation.isPending}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleReject(portfolio.id)}>
                    <X className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!selectedPortfolio} onOpenChange={() => setSelectedPortfolio(null)}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPortfolio?.judul}</DialogTitle>
            <DialogDescription>
              Oleh {selectedPortfolio?.user?.nama} (@{selectedPortfolio?.user?.username})
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {detailLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : detailData?.data?.content_blocks ? (
              <BlockRenderer blocks={detailData.data.content_blocks} />
            ) : (
              <p className="text-muted-foreground">Tidak ada konten</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedPortfolio(null)}>
              Tutup
            </Button>
            <Button
              onClick={() => approveMutation.mutate(selectedPortfolio!.id)}
              disabled={approveMutation.isPending}
            >
              {approveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Approve
            </Button>
            <Button variant="destructive" onClick={() => handleReject(selectedPortfolio!.id)}>
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Portfolio</DialogTitle>
            <DialogDescription>Berikan alasan penolakan untuk pemilik portfolio</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reject-note">Catatan Penolakan</Label>
              <Textarea
                id="reject-note"
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                placeholder="Jelaskan alasan penolakan..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={confirmReject}
              disabled={!rejectNote.trim() || rejectMutation.isPending}
            >
              {rejectMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Tolak
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
