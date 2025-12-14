'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Plus,
  Loader2,
  Layers,
  GripVertical,
  Trash2,
  FileText,
  Image,
  Youtube,
  Table,
  Link,
  Code,
  Eye,
  ChevronDown,
} from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { adminSeriesApi, CreateSeriesBlockRequest } from '@/lib/api/admin';
import { Series, ContentBlockType } from '@/lib/types';
import { useDebounce } from '@/lib/hooks/use-debounce';

const BLOCK_TYPES: { value: ContentBlockType; label: string; icon: React.ReactNode; description: string }[] = [
  { value: 'text', label: 'Text', icon: <FileText className="h-4 w-4" />, description: 'Konten teks/paragraf' },
  { value: 'image', label: 'Image', icon: <Image className="h-4 w-4" />, description: 'Gambar/foto' },
  { value: 'youtube', label: 'YouTube', icon: <Youtube className="h-4 w-4" />, description: 'Video YouTube' },
  { value: 'table', label: 'Table', icon: <Table className="h-4 w-4" />, description: 'Tabel data' },
  { value: 'button', label: 'Button', icon: <Link className="h-4 w-4" />, description: 'Tombol link' },
  { value: 'embed', label: 'Embed', icon: <Code className="h-4 w-4" />, description: 'Embed HTML' },
];

function getBlockIcon(type: ContentBlockType) {
  const block = BLOCK_TYPES.find((b) => b.value === type);
  return block?.icon || <FileText className="h-4 w-4" />;
}

function getBlockLabel(type: ContentBlockType) {
  const block = BLOCK_TYPES.find((b) => b.value === type);
  return block?.label || type;
}

export default function AdminSeriesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [editSeriesId, setEditSeriesId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteSeries, setDeleteSeries] = useState<Series | null>(null);
  const [previewSeries, setPreviewSeries] = useState<Series | null>(null);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Series Template</h1>
          <p className="text-muted-foreground">
            Kelola template series untuk struktur portofolio
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Series
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Cari series..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : series.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Layers className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Belum ada series template</p>
            <Button variant="outline" className="mt-4" onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Buat Series Pertama
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {series.map((s) => (
            <Card key={s.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Layers className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{s.nama}</CardTitle>
                      {s.deskripsi && (
                        <CardDescription className="mt-1 line-clamp-2">
                          {s.deskripsi}
                        </CardDescription>
                      )}
                    </div>
                  </div>
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
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Layers className="h-4 w-4" />
                    {s.block_count || 0} blocks
                  </span>
                  <span>•</span>
                  <span>{s.portfolio_count || 0} portfolios</span>
                </div>

                {s.blocks && s.blocks.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {s.blocks.slice(0, 5).map((block, idx) => (
                      <Badge key={idx} variant="outline" className="gap-1">
                        {getBlockIcon(block.block_type)}
                        {getBlockLabel(block.block_type)}
                      </Badge>
                    ))}
                    {s.blocks.length > 5 && (
                      <Badge variant="outline">+{s.blocks.length - 5} more</Badge>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewSeries(s)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditSeriesId(s.id)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteSeries(s)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <SeriesFormDialog
        seriesId={editSeriesId}
        open={isCreateOpen || !!editSeriesId}
        onClose={() => {
          setIsCreateOpen(false);
          setEditSeriesId(null);
        }}
      />

      <SeriesPreviewDialog
        series={previewSeries}
        open={!!previewSeries}
        onClose={() => setPreviewSeries(null)}
      />

      <ConfirmDialog
        open={!!deleteSeries}
        onOpenChange={() => setDeleteSeries(null)}
        title="Hapus Series"
        description={
          <>
            Yakin ingin menghapus series <strong>&quot;{deleteSeries?.nama}&quot;</strong>?
            {(deleteSeries?.portfolio_count || 0) > 0 && (
              <span className="block mt-2 text-amber-600">
                ⚠️ {deleteSeries?.portfolio_count} portfolio menggunakan series ini.
                Portfolio tidak akan terhapus, hanya relasi series-nya yang dihapus.
              </span>
            )}
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


interface BlockItem {
  id: string;
  block_type: ContentBlockType;
  instruksi: string;
}

function SeriesFormDialog({
  seriesId,
  open,
  onClose,
}: {
  seriesId: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const isEdit = !!seriesId;
  const [nama, setNama] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [blocks, setBlocks] = useState<BlockItem[]>([]);

  // Fetch series detail for edit
  const { data: seriesData, isLoading: isLoadingDetail } = useQuery({
    queryKey: ['admin-series-detail', seriesId],
    queryFn: () => adminSeriesApi.getSeriesById(seriesId!),
    enabled: !!seriesId && open,
  });

  React.useEffect(() => {
    if (open) {
      if (seriesData?.data) {
        const s = seriesData.data;
        setNama(s.nama);
        setDeskripsi(s.deskripsi || '');
        setIsActive(s.is_active);
        setBlocks(
          s.blocks.map((b, idx) => ({
            id: `block-${idx}-${Date.now()}`,
            block_type: b.block_type,
            instruksi: b.instruksi,
          }))
        );
      } else if (!seriesId) {
        // Reset for create
        setNama('');
        setDeskripsi('');
        setIsActive(true);
        setBlocks([]);
      }
    }
  }, [seriesData, seriesId, open]);

  const createMutation = useMutation({
    mutationFn: () =>
      adminSeriesApi.createSeries({
        nama,
        deskripsi: deskripsi || undefined,
        is_active: isActive,
        blocks: blocks.map((b) => ({
          block_type: b.block_type,
          instruksi: b.instruksi,
        })),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-series'] });
      toast.success('Series berhasil dibuat');
      onClose();
    },
    onError: () => {
      toast.error('Gagal membuat series');
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      adminSeriesApi.updateSeries(seriesId!, {
        nama,
        deskripsi: deskripsi || undefined,
        is_active: isActive,
        blocks: blocks.map((b) => ({
          block_type: b.block_type,
          instruksi: b.instruksi,
        })),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-series'] });
      queryClient.invalidateQueries({ queryKey: ['admin-series-detail', seriesId] });
      toast.success('Series berhasil diperbarui');
      onClose();
    },
    onError: () => {
      toast.error('Gagal memperbarui series');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (blocks.length === 0) {
      toast.error('Series harus memiliki minimal 1 block');
      return;
    }
    if (blocks.some((b) => !b.instruksi.trim())) {
      toast.error('Semua block harus memiliki instruksi');
      return;
    }
    if (isEdit) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  const addBlock = () => {
    setBlocks([
      ...blocks,
      {
        id: `block-${blocks.length}-${Date.now()}`,
        block_type: 'text',
        instruksi: '',
      },
    ]);
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter((b) => b.id !== id));
  };

  const updateBlock = (id: string, updates: Partial<BlockItem>) => {
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    setBlocks(newBlocks);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <Layers className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>
                {isEdit ? 'Edit Series Template' : 'Buat Series Template Baru'}
              </DialogTitle>
              <DialogDescription>
                {isEdit
                  ? 'Ubah informasi dan template blocks series'
                  : 'Buat series baru dengan template blocks untuk portofolio'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isLoadingDetail && isEdit ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-6 pb-4">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nama">
                      Nama Series <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="nama"
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      placeholder="Contoh: PJBL Semester 1 2024"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deskripsi">Deskripsi</Label>
                    <Textarea
                      id="deskripsi"
                      value={deskripsi}
                      onChange={(e) => setDeskripsi(e.target.value)}
                      placeholder="Deskripsi singkat tentang series ini..."
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <Label>Status Aktif</Label>
                      <p className="text-xs text-muted-foreground">
                        Series aktif akan ditampilkan ke siswa
                      </p>
                    </div>
                    <Switch checked={isActive} onCheckedChange={setIsActive} />
                  </div>
                </div>

                <Separator />

                {/* Blocks Builder */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Template Blocks <span className="text-destructive">*</span></Label>
                      <p className="text-xs text-muted-foreground">
                        Tentukan struktur block konten untuk portofolio
                      </p>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={addBlock}>
                      <Plus className="mr-2 h-4 w-4" />
                      Tambah Block
                    </Button>
                  </div>

                  {blocks.length === 0 ? (
                    <Card className="border-dashed">
                      <CardContent className="flex flex-col items-center justify-center py-8">
                        <Layers className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Belum ada block. Klik &quot;Tambah Block&quot; untuk memulai.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {blocks.map((block, index) => (
                        <Card key={block.id} className="relative">
                          <CardContent className="pt-4 pb-4">
                            <div className="flex gap-3">
                              <div className="flex flex-col items-center gap-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  disabled={index === 0}
                                  onClick={() => moveBlock(index, 'up')}
                                >
                                  <ChevronDown className="h-4 w-4 rotate-180" />
                                </Button>
                                <div className="flex items-center justify-center h-6 w-6 rounded bg-muted text-xs font-medium">
                                  {index + 1}
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  disabled={index === blocks.length - 1}
                                  onClick={() => moveBlock(index, 'down')}
                                >
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </div>

                              <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-2">
                                  <Select
                                    value={block.block_type}
                                    onValueChange={(v) =>
                                      updateBlock(block.id, { block_type: v as ContentBlockType })
                                    }
                                  >
                                    <SelectTrigger className="w-[160px]">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {BLOCK_TYPES.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                          <div className="flex items-center gap-2">
                                            {type.icon}
                                            <span>{type.label}</span>
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>

                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive ml-auto"
                                    onClick={() => removeBlock(block.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>

                                <div className="space-y-1">
                                  <Label className="text-xs">Instruksi untuk siswa</Label>
                                  <Textarea
                                    value={block.instruksi}
                                    onChange={(e) =>
                                      updateBlock(block.id, { instruksi: e.target.value })
                                    }
                                    placeholder="Contoh: Masukkan judul dan deskripsi singkat proyek..."
                                    rows={2}
                                    className="text-sm"
                                  />
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>

            <DialogFooter className="pt-4 border-t mt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Batal
              </Button>
              <Button type="submit" disabled={isPending || !nama.trim() || blocks.length === 0}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? 'Simpan Perubahan' : 'Buat Series'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SeriesPreviewDialog({
  series,
  open,
  onClose,
}: {
  series: Series | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!series) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Preview: {series.nama}
          </DialogTitle>
          <DialogDescription>
            Tampilan template blocks yang akan dilihat siswa
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4 pr-4">
            {series.deskripsi && (
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm">{series.deskripsi}</p>
              </div>
            )}

            {series.blocks && series.blocks.length > 0 ? (
              <div className="space-y-3">
                {series.blocks.map((block, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary shrink-0">
                          {getBlockIcon(block.block_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-muted-foreground">
                              Block {index + 1}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {getBlockLabel(block.block_type)}
                            </Badge>
                          </div>
                          <p className="text-sm">{block.instruksi}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Series ini belum memiliki blocks
              </p>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
