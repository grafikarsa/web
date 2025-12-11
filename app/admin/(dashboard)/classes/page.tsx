'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Loader2 } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable, Column } from '@/components/admin/data-table';
import { adminClassesApi, adminMajorsApi, Class } from '@/lib/api/admin';

export default function AdminClassesPage() {
  const queryClient = useQueryClient();
  const [editClass, setEditClass] = useState<Class | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-classes'],
    queryFn: () => adminClassesApi.getClasses(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminClassesApi.deleteClass(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-classes'] });
      toast.success('Kelas berhasil dihapus');
    },
    onError: () => {
      toast.error('Gagal menghapus kelas');
    },
  });

  const classes = data?.data || [];

  const columns: Column<Class>[] = [
    { key: 'nama', header: 'Nama Kelas' },
    {
      key: 'tingkat',
      header: 'Tingkat',
      render: (c) => <Badge variant="outline">Kelas {c.tingkat}</Badge>,
    },
    {
      key: 'jurusan',
      header: 'Jurusan',
      render: (c) => c.jurusan?.nama || '-',
    },
  ];

  const handleDelete = (kelas: Class) => {
    if (confirm(`Yakin ingin menghapus kelas "${kelas.nama}"?`)) {
      deleteMutation.mutate(kelas.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Kelas</h1>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Kelas
        </Button>
      </div>

      <DataTable
        data={classes}
        columns={columns}
        isLoading={isLoading}
        onEdit={setEditClass}
        onDelete={handleDelete}
      />

      <ClassFormDialog
        kelas={editClass}
        open={isCreateOpen || !!editClass}
        onClose={() => {
          setIsCreateOpen(false);
          setEditClass(null);
        }}
      />
    </div>
  );
}

function ClassFormDialog({
  kelas,
  open,
  onClose,
}: {
  kelas: Class | null;
  open: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const isEdit = !!kelas;
  const [formData, setFormData] = useState({
    nama: kelas?.nama || '',
    tingkat: kelas?.tingkat?.toString() || '10',
    jurusan_id: kelas?.jurusan_id || '',
  });

  const { data: majorsData } = useQuery({
    queryKey: ['admin-majors'],
    queryFn: () => adminMajorsApi.getMajors(),
  });

  const majors = majorsData?.data || [];

  const createMutation = useMutation({
    mutationFn: () =>
      adminClassesApi.createClass({
        nama: formData.nama,
        tingkat: parseInt(formData.tingkat),
        jurusan_id: formData.jurusan_id,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-classes'] });
      toast.success('Kelas berhasil dibuat');
      onClose();
      setFormData({ nama: '', tingkat: '10', jurusan_id: '' });
    },
    onError: () => {
      toast.error('Gagal membuat kelas');
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      adminClassesApi.updateClass(kelas!.id, {
        nama: formData.nama,
        tingkat: parseInt(formData.tingkat),
        jurusan_id: formData.jurusan_id,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-classes'] });
      toast.success('Kelas berhasil diperbarui');
      onClose();
    },
    onError: () => {
      toast.error('Gagal memperbarui kelas');
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
          <DialogTitle>{isEdit ? 'Edit Kelas' : 'Tambah Kelas'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nama">Nama Kelas</Label>
            <Input
              id="nama"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              placeholder="Contoh: X RPL 1"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tingkat">Tingkat</Label>
            <Select value={formData.tingkat} onValueChange={(v) => setFormData({ ...formData, tingkat: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">Kelas 10</SelectItem>
                <SelectItem value="11">Kelas 11</SelectItem>
                <SelectItem value="12">Kelas 12</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="jurusan">Jurusan</Label>
            <Select value={formData.jurusan_id} onValueChange={(v) => setFormData({ ...formData, jurusan_id: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih jurusan" />
              </SelectTrigger>
              <SelectContent>
                {majors.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending || !formData.jurusan_id}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? 'Simpan' : 'Buat'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
