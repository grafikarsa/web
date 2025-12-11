'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Loader2, UserCheck, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { adminUsersApi } from '@/lib/api/admin';
import { User } from '@/lib/types';
import { useDebounce } from '@/lib/hooks/use-debounce';

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', debouncedSearch, page],
    queryFn: () => adminUsersApi.getUsers({ search: debouncedSearch || undefined, page, limit: 20 }),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (id: string) => adminUsersApi.toggleActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Status user berhasil diubah');
    },
    onError: () => {
      toast.error('Gagal mengubah status user');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminUsersApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User berhasil dihapus');
    },
    onError: () => {
      toast.error('Gagal menghapus user');
    },
  });

  const users = data?.data || [];
  const pagination = data?.pagination;

  const columns: Column<User>[] = [
    {
      key: 'avatar',
      header: '',
      render: (user) => (
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.avatar_url} />
          <AvatarFallback>{user.nama?.charAt(0)}</AvatarFallback>
        </Avatar>
      ),
    },
    { key: 'nama', header: 'Nama' },
    { key: 'username', header: 'Username', render: (user) => `@${user.username}` },
    { key: 'email', header: 'Email' },
    {
      key: 'role',
      header: 'Role',
      render: (user) => (
        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
          {user.role}
        </Badge>
      ),
    },
    {
      key: 'kelas',
      header: 'Kelas',
      render: (user) => user.kelas?.nama || '-',
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (user) => (
        <Badge variant={user.is_active ? 'default' : 'destructive'}>
          {user.is_active ? 'Aktif' : 'Nonaktif'}
        </Badge>
      ),
    },
  ];

  const handleDelete = (user: User) => {
    if (confirm(`Yakin ingin menghapus user ${user.nama}?`)) {
      deleteMutation.mutate(user.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Users</h1>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah User
        </Button>
      </div>

      <DataTable
        data={users}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Cari nama, username, email..."
        onSearch={setSearch}
        onEdit={setEditUser}
        onDelete={handleDelete}
        page={page}
        totalPages={pagination?.total_pages || 1}
        onPageChange={setPage}
        actions={(user) => (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleActiveMutation.mutate(user.id)}
            disabled={toggleActiveMutation.isPending}
            title={user.is_active ? 'Nonaktifkan' : 'Aktifkan'}
          >
            {user.is_active ? (
              <UserX className="h-4 w-4 text-destructive" />
            ) : (
              <UserCheck className="h-4 w-4 text-green-500" />
            )}
          </Button>
        )}
      />

      {/* Create/Edit Dialog */}
      <UserFormDialog
        user={editUser}
        open={isCreateOpen || !!editUser}
        onClose={() => {
          setIsCreateOpen(false);
          setEditUser(null);
        }}
      />
    </div>
  );
}

function UserFormDialog({
  user,
  open,
  onClose,
}: {
  user: User | null;
  open: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const isEdit = !!user;
  const [formData, setFormData] = useState({
    nama: user?.nama || '',
    username: user?.username || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'student',
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => adminUsersApi.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User berhasil dibuat');
      onClose();
    },
    onError: () => {
      toast.error('Gagal membuat user');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<typeof formData>) => adminUsersApi.updateUser(user!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User berhasil diperbarui');
      onClose();
    },
    onError: () => {
      toast.error('Gagal memperbarui user');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      const { password, ...rest } = formData;
      updateMutation.mutate(password ? formData : rest);
    } else {
      createMutation.mutate(formData);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit User' : 'Tambah User'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nama">Nama</Label>
            <Input
              id="nama"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password {isEdit && '(kosongkan jika tidak diubah)'}</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={!isEdit}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="alumni">Alumni</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
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
