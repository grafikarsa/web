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
import { adminTagsApi } from '@/lib/api/admin';
import { Tag } from '@/lib/types';
import { useDebounce } from '@/lib/hooks/use-debounce';

export default function AdminTagsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [editTag, setEditTag] = useState<Tag | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-tags', debouncedSearch],
    queryFn: () => adminTagsApi.getTags({ search: debouncedSearch || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminTagsApi.deleteTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tags'] });
      toast.success('Tag berhasil dihapus');
    },
    onError: () => {
      toast.error('Gagal menghapus tag');
    },
  });

  const tags = data?.data || [];

  const columns: Column<Tag>[] = [
    { key: 'nama', header: 'Nama Tag' },
  ];

  const handleDelete = (tag: Tag) => {
    if (confirm(`Yakin ingin menghapus tag "${tag.nama}"?`)) {
      deleteMutation.mutate(tag.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tags</h1>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Tag
        </Button>
      </div>

      <DataTable
        data={tags}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Cari tag..."
        onSearch={setSearch}
        onEdit={setEditTag}
        onDelete={handleDelete}
      />

      <TagFormDialog
        tag={editTag}
        open={isCreateOpen || !!editTag}
        onClose={() => {
          setIsCreateOpen(false);
          setEditTag(null);
        }}
      />
    </div>
  );
}

function TagFormDialog({
  tag,
  open,
  onClose,
}: {
  tag: Tag | null;
  open: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const isEdit = !!tag;
  const [nama, setNama] = useState(tag?.nama || '');

  const createMutation = useMutation({
    mutationFn: () => adminTagsApi.createTag({ nama }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tags'] });
      toast.success('Tag berhasil dibuat');
      onClose();
      setNama('');
    },
    onError: () => {
      toast.error('Gagal membuat tag');
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => adminTagsApi.updateTag(tag!.id, { nama }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tags'] });
      toast.success('Tag berhasil diperbarui');
      onClose();
    },
    onError: () => {
      toast.error('Gagal memperbarui tag');
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
          <DialogTitle>{isEdit ? 'Edit Tag' : 'Tambah Tag'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nama">Nama Tag</Label>
            <Input
              id="nama"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Web Development"
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending || !nama.trim()}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? 'Simpan' : 'Buat'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
