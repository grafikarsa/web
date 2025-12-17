'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Search,
  Bug,
  Lightbulb,
  MessageSquare,
  Clock,
  Eye,
  CheckCircle,
  Trash2,
  Loader2,
  MessageSquareText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
} from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { adminFeedbackApi, Feedback, FeedbackStatus } from '@/lib/api/admin';
import { formatDate } from '@/lib/utils/format';
import { cn } from '@/lib/utils';

const statusOptions = [
  { value: 'all', label: 'Semua Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'read', label: 'Dibaca' },
  { value: 'resolved', label: 'Selesai' },
];

const kategoriOptions = [
  { value: 'all', label: 'Semua Kategori' },
  { value: 'bug', label: 'Bug' },
  { value: 'saran', label: 'Saran' },
  { value: 'lainnya', label: 'Lainnya' },
];

const statusStyles: Record<FeedbackStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  read: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  resolved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

const kategoriIcons = {
  bug: Bug,
  saran: Lightbulb,
  lainnya: MessageSquare,
};

const kategoriColors = {
  bug: 'text-red-500',
  saran: 'text-amber-500',
  lainnya: 'text-blue-500',
};

export default function AdminFeedbackPage() {
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [kategori, setKategori] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Feedback | null>(null);

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const { data, isLoading } = useQuery({
    queryKey: ['admin-feedback', searchQuery, status, kategori, page],
    queryFn: () =>
      adminFeedbackApi.getFeedback({
        search: searchQuery || undefined,
        status: status === 'all' ? undefined : status,
        kategori: kategori === 'all' ? undefined : kategori,
        page,
        limit: 20,
      }),
  });

  const { data: statsData } = useQuery({
    queryKey: ['admin-feedback-stats'],
    queryFn: () => adminFeedbackApi.getStats(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status?: FeedbackStatus; admin_notes?: string } }) =>
      adminFeedbackApi.updateFeedback(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-feedback'] });
      queryClient.invalidateQueries({ queryKey: ['admin-feedback-stats'] });
      toast.success('Feedback diupdate');
    },
    onError: () => toast.error('Gagal mengupdate feedback'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminFeedbackApi.deleteFeedback(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-feedback'] });
      queryClient.invalidateQueries({ queryKey: ['admin-feedback-stats'] });
      toast.success('Feedback dihapus');
      setDeleteTarget(null);
    },
    onError: () => toast.error('Gagal menghapus feedback'),
  });

  const feedbacks = data?.data || [];
  const stats = statsData?.data;
  const pagination = data?.meta;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-48" />
        <div className="grid gap-4 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => (
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

  return (
    <div className="space-y-6">
      {/* Stats */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-muted p-2">
                <MessageSquareText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-yellow-100 p-2 dark:bg-yellow-900/30">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                <Eye className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.read}</p>
                <p className="text-sm text-muted-foreground">Dibaca</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.resolved}</p>
                <p className="text-sm text-muted-foreground">Selesai</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari feedback..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={kategori} onValueChange={(v) => { setKategori(v); setPage(1); }}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {kategoriOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="secondary" onClick={handleSearch}>
          <Search className="mr-2 h-4 w-4" />
          Cari
        </Button>
      </div>

      {/* Feedback List */}
      {feedbacks.length === 0 ? (
        <Card className="border-dashed py-16">
          <div className="flex flex-col items-center justify-center">
            <MessageSquareText className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Tidak ada feedback</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchQuery || status !== 'all' || kategori !== 'all'
                ? 'Tidak ada feedback yang sesuai filter'
                : 'Belum ada feedback masuk'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {feedbacks.map((feedback) => {
            const KategoriIcon = kategoriIcons[feedback.kategori];
            return (
              <Card
                key={feedback.id}
                className="cursor-pointer p-4 transition-shadow hover:shadow-md"
                onClick={() => setSelectedFeedback(feedback)}
              >
                <div className="flex items-start gap-4">
                  <div className={cn('rounded-lg bg-muted p-2', kategoriColors[feedback.kategori])}>
                    <KategoriIcon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', statusStyles[feedback.status])}>
                        {feedback.status === 'pending' ? 'Pending' : feedback.status === 'read' ? 'Dibaca' : 'Selesai'}
                      </span>
                      <span className="text-xs text-muted-foreground capitalize">{feedback.kategori}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{formatDate(feedback.created_at)}</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm">{feedback.pesan}</p>
                    {feedback.user && (
                      <div className="mt-2 flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={feedback.user.avatar_url} />
                          <AvatarFallback className="text-[10px]">{feedback.user.nama?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">{feedback.user.nama}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
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

      {/* Detail Dialog */}
      <FeedbackDetailDialog
        feedback={selectedFeedback}
        onClose={() => setSelectedFeedback(null)}
        onUpdate={(data) => {
          if (selectedFeedback) {
            updateMutation.mutate({ id: selectedFeedback.id, data });
          }
        }}
        onDelete={() => {
          if (selectedFeedback) {
            setDeleteTarget(selectedFeedback);
            setSelectedFeedback(null);
          }
        }}
        isUpdating={updateMutation.isPending}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Feedback"
        description="Yakin ingin menghapus feedback ini?"
        confirmText="Hapus"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
      />
    </div>
  );
}


// Feedback Detail Dialog
function FeedbackDetailDialog({
  feedback,
  onClose,
  onUpdate,
  onDelete,
  isUpdating,
}: {
  feedback: Feedback | null;
  onClose: () => void;
  onUpdate: (data: { status?: FeedbackStatus; admin_notes?: string }) => void;
  onDelete: () => void;
  isUpdating: boolean;
}) {
  const [adminNotes, setAdminNotes] = useState('');
  const [newStatus, setNewStatus] = useState<FeedbackStatus | ''>('');

  // Reset state when feedback changes
  useState(() => {
    if (feedback) {
      setAdminNotes(feedback.admin_notes || '');
      setNewStatus('');
    }
  });

  if (!feedback) return null;

  const KategoriIcon = kategoriIcons[feedback.kategori];

  const handleSave = () => {
    const data: { status?: FeedbackStatus; admin_notes?: string } = {};
    if (newStatus) data.status = newStatus;
    if (adminNotes !== (feedback.admin_notes || '')) data.admin_notes = adminNotes;
    if (Object.keys(data).length > 0) {
      onUpdate(data);
    }
  };

  return (
    <Dialog open={!!feedback} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KategoriIcon className={cn('h-5 w-5', kategoriColors[feedback.kategori])} />
            Feedback {feedback.kategori.charAt(0).toUpperCase() + feedback.kategori.slice(1)}
          </DialogTitle>
          <DialogDescription>
            Dikirim pada {formatDate(feedback.created_at)}
            {feedback.user && ` oleh ${feedback.user.nama}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status</span>
            <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium', statusStyles[feedback.status])}>
              {feedback.status === 'pending' ? 'Pending' : feedback.status === 'read' ? 'Dibaca' : 'Selesai'}
            </span>
          </div>

          {/* User Info */}
          {feedback.user && (
            <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={feedback.user.avatar_url} />
                <AvatarFallback>{feedback.user.nama?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{feedback.user.nama}</p>
                <p className="text-sm text-muted-foreground">@{feedback.user.username}</p>
              </div>
            </div>
          )}

          {/* Pesan */}
          <div className="space-y-2">
            <span className="text-sm font-medium">Pesan</span>
            <div className="rounded-lg bg-muted p-3">
              <p className="whitespace-pre-wrap text-sm">{feedback.pesan}</p>
            </div>
          </div>

          {/* Change Status */}
          <div className="space-y-2">
            <span className="text-sm font-medium">Ubah Status</span>
            <Select value={newStatus} onValueChange={(v) => setNewStatus(v as FeedbackStatus)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih status baru..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="read">Dibaca</SelectItem>
                <SelectItem value="resolved">Selesai</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Admin Notes */}
          <div className="space-y-2">
            <span className="text-sm font-medium">Catatan Admin</span>
            <Textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Tambahkan catatan internal..."
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="destructive" size="sm" onClick={onDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Hapus
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Tutup
            </Button>
            <Button onClick={handleSave} disabled={isUpdating}>
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
