'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Search,
  Star,
  CheckCircle2,
  Clock,
  Loader2,
  Eye,
  ClipboardList,
  AlertCircle,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { adminAssessmentsApi, adminAssessmentMetricsApi } from '@/lib/api/admin';
import {
  PortfolioForAssessment,
  AssessmentMetric,
  AssessmentResponse,
  ScoreInput,
} from '@/lib/types';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'pending' | 'assessed';

const filterOptions = [
  { value: 'all', label: 'Semua Portfolio' },
  { value: 'pending', label: 'Belum Dinilai' },
  { value: 'assessed', label: 'Sudah Dinilai' },
];

export default function AdminAssessmentsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [page, setPage] = useState(1);
  const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioForAssessment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PortfolioForAssessment | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-assessments', debouncedSearch, filter, page],
    queryFn: () =>
      adminAssessmentsApi.getPortfolios({
        search: debouncedSearch || undefined,
        filter: filter === 'all' ? undefined : filter,
        page,
        limit: 20,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (portfolioId: string) => adminAssessmentsApi.deleteAssessment(portfolioId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-assessments'] });
      toast.success('Penilaian berhasil dihapus');
      setDeleteTarget(null);
    },
    onError: () => toast.error('Gagal menghapus penilaian'),
  });

  const portfolios = data?.data || [];
  const pagination = data?.meta;

  // Stats
  const totalCount = pagination?.total_count || 0;
  const assessedCount = portfolios.filter((p) => p.assessment).length;
  const pendingCount = portfolios.filter((p) => !p.assessment).length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-64" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Penilaian Portfolio</h1>
        <Card className="border-destructive/50 bg-destructive/5 p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <h3 className="mt-4 text-lg font-semibold">Gagal Memuat Data</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Terjadi kesalahan saat mengambil data portfolio
            </p>
            <Button onClick={() => refetch()} className="mt-4">
              Coba Lagi
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Penilaian Portfolio</h1>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-muted p-2">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalCount}</p>
              <p className="text-sm text-muted-foreground">Total Portfolio</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{assessedCount}</p>
              <p className="text-sm text-muted-foreground">Sudah Dinilai</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-100 p-2 dark:bg-yellow-900/30">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingCount}</p>
              <p className="text-sm text-muted-foreground">Belum Dinilai</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari portfolio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {filterOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Portfolio List */}
      {portfolios.length === 0 ? (
        <Card className="border-dashed py-16">
          <div className="flex flex-col items-center justify-center text-center">
            <ClipboardList className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Tidak Ada Portfolio</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {search || filter !== 'all'
                ? 'Tidak ada portfolio yang sesuai filter'
                : 'Belum ada portfolio yang dipublish'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {portfolios.map((portfolio) => (
            <PortfolioCard
              key={portfolio.id}
              portfolio={portfolio}
              onAssess={() => setSelectedPortfolio(portfolio)}
              onDelete={() => setDeleteTarget(portfolio)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Halaman {page} dari {pagination.total_pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(pagination.total_pages, p + 1))}
            disabled={page === pagination.total_pages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Assessment Sheet */}
      <AssessmentSheet
        portfolio={selectedPortfolio}
        onClose={() => setSelectedPortfolio(null)}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="Hapus Penilaian"
        description={
          <>
            Yakin ingin menghapus penilaian untuk portfolio{' '}
            <strong>&quot;{deleteTarget?.judul}&quot;</strong>?
          </>
        }
        confirmText="Hapus"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
      />
    </div>
  );
}


// Portfolio Card Component
function PortfolioCard({
  portfolio,
  onAssess,
  onDelete,
}: {
  portfolio: PortfolioForAssessment;
  onAssess: () => void;
  onDelete: () => void;
}) {
  const hasAssessment = !!portfolio.assessment;

  return (
    <Card className="overflow-hidden">
      {/* Thumbnail */}
      <div className="aspect-video bg-muted relative">
        {portfolio.thumbnail_url ? (
          <img
            src={portfolio.thumbnail_url}
            alt={portfolio.judul}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ClipboardList className="h-12 w-12 text-muted-foreground/50" />
          </div>
        )}
        {hasAssessment && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-green-500 hover:bg-green-500">
              <Star className="h-3 w-3 mr-1 fill-current" />
              {portfolio.assessment?.total_score?.toFixed(1) || '-'}
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="font-semibold line-clamp-1">{portfolio.judul}</h3>

        {/* User Info */}
        {portfolio.user && (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={portfolio.user.avatar_url} />
              <AvatarFallback className="text-xs">
                {portfolio.user.nama?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">{portfolio.user.nama}</span>
          </div>
        )}

        {/* Assessment Status */}
        <div className="flex items-center gap-2">
          {hasAssessment ? (
            <Badge variant="outline" className="text-green-600 border-green-600">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Sudah Dinilai
            </Badge>
          ) : (
            <Badge variant="outline" className="text-yellow-600 border-yellow-600">
              <Clock className="h-3 w-3 mr-1" />
              Belum Dinilai
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button size="sm" className="flex-1" onClick={onAssess}>
            {hasAssessment ? 'Edit Penilaian' : 'Nilai Portfolio'}
          </Button>
          {hasAssessment && (
            <Button size="sm" variant="outline" onClick={onDelete}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}


// Assessment Sheet Component
function AssessmentSheet({
  portfolio,
  onClose,
}: {
  portfolio: PortfolioForAssessment | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [scores, setScores] = useState<Record<string, { score: number; comment: string }>>({});
  const [finalComment, setFinalComment] = useState('');

  // Fetch metrics
  const { data: metricsData } = useQuery({
    queryKey: ['admin-assessment-metrics-active'],
    queryFn: () => adminAssessmentMetricsApi.getMetrics({ active_only: true }),
    enabled: !!portfolio,
  });

  // Fetch existing assessment
  const { data: assessmentData, isLoading: isLoadingAssessment } = useQuery({
    queryKey: ['admin-assessment', portfolio?.id],
    queryFn: () => adminAssessmentsApi.getAssessment(portfolio!.id),
    enabled: !!portfolio,
  });

  const metrics = metricsData?.data || [];
  const existingAssessment = assessmentData?.data?.assessment;

  // Initialize scores when data loads
  React.useEffect(() => {
    if (metrics.length > 0) {
      const initialScores: Record<string, { score: number; comment: string }> = {};
      metrics.forEach((metric) => {
        const existingScore = existingAssessment?.scores?.find(
          (s) => s.metric_id === metric.id
        );
        initialScores[metric.id] = {
          score: existingScore?.score || 5,
          comment: existingScore?.comment || '',
        };
      });
      setScores(initialScores);
      setFinalComment(existingAssessment?.final_comment || '');
    }
  }, [metrics, existingAssessment]);

  const submitMutation = useMutation({
    mutationFn: () => {
      const scoreInputs: ScoreInput[] = Object.entries(scores).map(([metricId, data]) => ({
        metric_id: metricId,
        score: data.score,
        comment: data.comment || undefined,
      }));
      return adminAssessmentsApi.createOrUpdateAssessment(portfolio!.id, {
        scores: scoreInputs,
        final_comment: finalComment || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-assessments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-assessment', portfolio?.id] });
      toast.success('Penilaian berhasil disimpan');
      onClose();
    },
    onError: () => toast.error('Gagal menyimpan penilaian'),
  });

  const handleScoreChange = (metricId: string, score: number) => {
    setScores((prev) => ({
      ...prev,
      [metricId]: { ...prev[metricId], score },
    }));
  };

  const handleCommentChange = (metricId: string, comment: string) => {
    setScores((prev) => ({
      ...prev,
      [metricId]: { ...prev[metricId], comment },
    }));
  };

  const totalScore =
    Object.values(scores).length > 0
      ? Object.values(scores).reduce((sum, s) => sum + s.score, 0) / Object.values(scores).length
      : 0;

  if (!portfolio) return null;

  return (
    <Sheet open={!!portfolio} onOpenChange={() => onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Penilaian Portfolio</SheetTitle>
          <SheetDescription>{portfolio.judul}</SheetDescription>
        </SheetHeader>

        {isLoadingAssessment ? (
          <div className="py-8 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6 py-6">
            {/* Portfolio Preview */}
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
              {portfolio.thumbnail_url ? (
                <img
                  src={portfolio.thumbnail_url}
                  alt={portfolio.judul}
                  className="w-20 h-14 object-cover rounded"
                />
              ) : (
                <div className="w-20 h-14 bg-muted rounded flex items-center justify-center">
                  <ClipboardList className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{portfolio.judul}</p>
                {portfolio.user && (
                  <p className="text-sm text-muted-foreground">oleh {portfolio.user.nama}</p>
                )}
              </div>
              <a
                href={`/${portfolio.user?.username}/${portfolio.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0"
              >
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  Lihat
                </Button>
              </a>
            </div>

            {/* Total Score Preview */}
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-center justify-between">
                <span className="font-medium">Total Nilai</span>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  <span className="text-2xl font-bold">{totalScore.toFixed(1)}</span>
                  <span className="text-muted-foreground">/ 10</span>
                </div>
              </div>
            </Card>

            {/* Metrics */}
            <div className="space-y-6">
              <h4 className="font-medium">Penilaian per Metrik</h4>
              {metrics.map((metric) => (
                <MetricScoreInput
                  key={metric.id}
                  metric={metric}
                  score={scores[metric.id]?.score || 5}
                  comment={scores[metric.id]?.comment || ''}
                  onScoreChange={(score) => handleScoreChange(metric.id, score)}
                  onCommentChange={(comment) => handleCommentChange(metric.id, comment)}
                />
              ))}
            </div>

            {/* Final Comment */}
            <div className="space-y-2">
              <Label>Komentar Akhir (Opsional)</Label>
              <Textarea
                value={finalComment}
                onChange={(e) => setFinalComment(e.target.value)}
                placeholder="Berikan komentar atau feedback untuk portfolio ini..."
                rows={3}
              />
            </div>

            {/* Submit */}
            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                Batal
              </Button>
              <Button
                className="flex-1"
                onClick={() => submitMutation.mutate()}
                disabled={submitMutation.isPending}
              >
                {submitMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Penilaian
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}


// Metric Score Input Component
function MetricScoreInput({
  metric,
  score,
  comment,
  onScoreChange,
  onCommentChange,
}: {
  metric: AssessmentMetric;
  score: number;
  comment: string;
  onScoreChange: (score: number) => void;
  onCommentChange: (comment: string) => void;
}) {
  const [showComment, setShowComment] = useState(!!comment);

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h5 className="font-medium">{metric.nama}</h5>
          {metric.deskripsi && (
            <p className="text-sm text-muted-foreground mt-1">{metric.deskripsi}</p>
          )}
        </div>
        <div className="text-right shrink-0">
          <span className="text-2xl font-bold text-primary">{score}</span>
          <span className="text-muted-foreground">/10</span>
        </div>
      </div>

      {/* Slider */}
      <div className="space-y-2">
        <Slider
          value={[score]}
          onValueChange={([value]) => onScoreChange(value)}
          min={1}
          max={10}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1</span>
          <span>5</span>
          <span>10</span>
        </div>
      </div>

      {/* Comment Toggle */}
      {!showComment ? (
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => setShowComment(true)}
        >
          + Tambah Komentar
        </Button>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Komentar</Label>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-muted-foreground"
              onClick={() => {
                setShowComment(false);
                onCommentChange('');
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <Textarea
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
            placeholder="Komentar untuk metrik ini..."
            rows={2}
            className="text-sm"
          />
        </div>
      )}
    </Card>
  );
}
