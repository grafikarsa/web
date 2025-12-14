'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Loader2, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { DataTable, Column } from '@/components/admin/data-table';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { adminSeriesApi } from '@/lib/api/admin';
import { Series } from '@/lib/types';
import { useDebounce } from '@/lib/hooks/use-debounce';

export default function AdminSeriesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [editSeries, setEditSeries] = useState<Series | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteSeries, setDeleteSeries] = useState<Series | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-series', debouncedSearch],
    queryFn: () => adminSeriesApi.getSeries({ search: debouncedSearch || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminSeriesApi.deleteSeries(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-series'] });
      toast.success('Series berhasil dihapus');
      setDeleteSeries(null);
    },
    onError: () => {
      toast.error('Gagal menghapus series');
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      adminSeriesApi.updateSeries(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-series'] });
      toast.success('Status series diperbarui');
    },
    onError: () => {
      toast.error('Gagal memperbarui status');
    },
  });

  const series = data?.data || [];

  const columns: Column<Series>[] = [
    {
      key: 'nama',
      header: 'Nama Series',
      render: (s) => (
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{s.nama}</span>
        </div>
      ),
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (s) => (
        <div className="flex items-center gap-2">
          <Switch
            checked={s.is_active}
            onCheckedChange={(checked) =>
              toggleActiveMutation.mutate({ id: s.id, is_active: checked })
            }
          />
          <Badge variant={s.is_active ? 'default' : 'secondary'}>
            {s.is_active ? 'Aktif' : 'Nonaktif'}
          </Badge>
        </div>
      ),
    },
  ];


  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Series
        </Button>
      </div>

      <DataTable
        data={series}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Cari series..."
        onSearch={setSearch}
        onEdit={setEditSeries}
        onDelete={setDeleteSeries}
      />

      <SeriesFormDialog
        series={editSeries}
        open={isCreateOpen || !!editSeries}
        onClose={() => {
          setIsCreateOpen(false);
          setEditSeries(null);
        }}
      />

      <ConfirmDialog
        open={!!deleteSeries}
        onOpenChange={() => setDeleteSeries(null)}
        title="Hapus Series"
        description={
          <>
            Yakin ingin menghapus series <strong>&quot;{deleteSeries?.nama}&quot;</strong>? Portfolio
            yang menggunakan series ini tidak akan terhapus, hanya relasi series-nya yang dihapus.
          </>
        }
        confirmText="Hapus"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteSeries && deleteMutation.mutate(deleteSeries.id)}
      />
    </div>
  );
}


function SeriesFormDialog({
  series,
  open,
  onClose,
}: {
  series: Series | null;
  open: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const isEdit = !!series;
  const [nama, setNama] = useState('');
  const [isActive, setIsActive] = useState(true);

  React.useEffect(() => {
    if (open) {
      if (series) {
        setNama(series.nama);
        setIsActive(series.is_active);
      } else {
        setNama('');
        setIsActive(true);
      }
    }
  }, [series, open]);

  const createMutation = useMutation({
    mutationFn: () => adminSeriesApi.createSeries({ nama, is_active: isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-series'] });
      toast.success('Series berhasil dibuat');
      onClose();
      setNama('');
      setIsActive(true);
    },
    onError: () => {
      toast.error('Gagal membuat series');
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => adminSeriesApi.updateSeries(series!.id, { nama, is_active: isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-series'] });
      toast.success('Series berhasil diperbarui');
      onClose();
    },
    onError: () => {
      toast.error('Gagal memperbarui series');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;


  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <Layers className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>{isEdit ? 'Edit Series' : 'Tambah Series Baru'}</DialogTitle>
              <DialogDescription>
                {isEdit
                  ? 'Ubah nama atau status series'
                  : 'Buat series baru untuk kategorisasi event/tema'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="nama">
              Nama Series <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nama"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: PJBL Semester 1"
              required
            />
            <p className="text-xs text-muted-foreground">
              Gunakan nama yang deskriptif untuk event/tema
            </p>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label>Status Aktif</Label>
              <p className="text-xs text-muted-foreground">
                Series aktif akan ditampilkan ke user
              </p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending || !nama.trim()}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? 'Simpan Perubahan' : 'Buat Series'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
