'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { adminMajorsApi, Major } from '@/lib/api/admin';

export default function AdminMajorsPage() {
  const queryClient = useQueryClient();
  const [editMajor, setEditMajor] = useState<Major | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-majors'],
    queryFn: () => adminMajorsApi.getMajors(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminMajorsApi.deleteMajor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-majors'] });
      toast.success('Jurusan berhasil dihapus');
    },
    onError: () => {
      toast.error('Gagal menghapus jurusan');
    },
  });

  const majors = data?.data || [];

  const columns: Column<Major>[] = [
    { key: 'kode', header: 'Kode' },
    { key: 'nama', header: 'Nama Jurusan' },
  ];

  const handleDelete = (major: Major) => {
    if (confirm(`Yakin ingin menghapus jurusan "${major.nama}"?`)) {
      deleteMutation.mutate(major.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Jurusan</h1>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Jurusan
        </Button>
      </div>

      <DataTable
        data={majors}
        columns={columns}
        isLoading={isLoading}
        onEdit={setEditMajor}
        onDelete={handleDelete}
      />

      <MajorFormDialog
        major={editMajor}
        open={isCreateOpen || !!editMajor}
        onClose={() => {
          setIsCreateOpen(false);
          setEditMajor(null);
        }}
      />
    </div>
  );
}

function MajorFormDialog({
  major,
  open,
  onClose,
}: {
  major: Major | null;
  open: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const isEdit = !!major;
  const [formData, setFormData] = useState({
    nama: major?.nama || '',
    kode: major?.kode || '',
  });

  const createMutation = useMutation({
    mutationFn: () => adminMajorsApi.createMajor(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-majors'] });
      toast.success('Jurusan berhasil dibuat');
      onClose();
      setFormData({ nama: '', kode: '' });
    },
    onError: () => {
      toast.error('Gagal membuat jurusan');
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => adminMajorsApi.updateMajor(major!.id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-majors'] });
      toast.success('Jurusan berhasil diperbarui');
      onClose();
    },
    onError: () => {
      toast.error('Gagal memperbarui jurusan');
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
          <DialogTitle>{isEdit ? 'Edit Jurusan' : 'Tambah Jurusan'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="kode">Kode</Label>
            <Input
              id="kode"
              value={formData.kode}
              onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
              placeholder="Contoh: RPL"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nama">Nama Jurusan</Label>
            <Input
              id="nama"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              placeholder="Contoh: Rekayasa Perangkat Lunak"
              required
            />
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
