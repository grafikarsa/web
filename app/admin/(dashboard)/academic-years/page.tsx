'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DataTable, Column } from '@/components/admin/data-table';
import { adminAcademicYearsApi, AcademicYear } from '@/lib/api/admin';

export default function AdminAcademicYearsPage() {
  const queryClient = useQueryClient();
  const [editYear, setEditYear] = useState<AcademicYear | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-academic-years'],
    queryFn: () => adminAcademicYearsApi.getAcademicYears(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminAcademicYearsApi.deleteAcademicYear(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-academic-years'] });
      toast.success('Tahun ajaran berhasil dihapus');
    },
    onError: () => {
      toast.error('Gagal menghapus tahun ajaran');
    },
  });

  const setActiveMutation = useMutation({
    mutationFn: (id: string) => adminAcademicYearsApi.setActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-academic-years'] });
      toast.success('Tahun ajaran aktif berhasil diubah');
    },
    onError: () => {
      toast.error('Gagal mengubah tahun ajaran aktif');
    },
  });

  const years = data?.data || [];

  const columns: Column<AcademicYear>[] = [
    {
      key: 'tahun',
      header: 'Tahun Ajaran',
      render: (y) => `${y.tahun}/${y.tahun + 1}`,
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (y) =>
        y.is_active ? (
          <Badge variant="default" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            Aktif
          </Badge>
        ) : (
          <Badge variant="secondary">Tidak Aktif</Badge>
        ),
    },
  ];

  const handleDelete = (year: AcademicYear) => {
    if (year.is_active) {
      toast.error('Tidak dapat menghapus tahun ajaran yang aktif');
      return;
    }
    if (confirm(`Yakin ingin menghapus tahun ajaran ${year.tahun}/${year.tahun + 1}?`)) {
      deleteMutation.mutate(year.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tahun Ajaran</h1>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Tahun Ajaran
        </Button>
      </div>

      <DataTable
        data={years}
        columns={columns}
        isLoading={isLoading}
        onEdit={setEditYear}
        onDelete={handleDelete}
        actions={(year) =>
          !year.is_active ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveMutation.mutate(year.id)}
              disabled={setActiveMutation.isPending}
            >
              Set Aktif
            </Button>
          ) : null
        }
      />

      <AcademicYearFormDialog
        year={editYear}
        open={isCreateOpen || !!editYear}
        onClose={() => {
          setIsCreateOpen(false);
          setEditYear(null);
        }}
      />
    </div>
  );
}

function AcademicYearFormDialog({
  year,
  open,
  onClose,
}: {
  year: AcademicYear | null;
  open: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const isEdit = !!year;
  const currentYear = new Date().getFullYear();
  const [tahun, setTahun] = useState(year?.tahun?.toString() || currentYear.toString());

  const createMutation = useMutation({
    mutationFn: () => adminAcademicYearsApi.createAcademicYear({ tahun: parseInt(tahun) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-academic-years'] });
      toast.success('Tahun ajaran berhasil dibuat');
      onClose();
      setTahun(currentYear.toString());
    },
    onError: () => {
      toast.error('Gagal membuat tahun ajaran');
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => adminAcademicYearsApi.updateAcademicYear(year!.id, { tahun: parseInt(tahun) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-academic-years'] });
      toast.success('Tahun ajaran berhasil diperbarui');
      onClose();
    },
    onError: () => {
      toast.error('Gagal memperbarui tahun ajaran');
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
  const tahunNum = parseInt(tahun);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Tahun Ajaran' : 'Tambah Tahun Ajaran'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tahun">Tahun Mulai</Label>
            <Input
              id="tahun"
              type="number"
              min="2000"
              max="2100"
              value={tahun}
              onChange={(e) => setTahun(e.target.value)}
              required
            />
            {tahunNum && (
              <p className="text-sm text-muted-foreground">
                Tahun Ajaran: {tahunNum}/{tahunNum + 1}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? 'Simpan' : 'Buat'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
