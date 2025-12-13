'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Bug, Lightbulb, MessageSquare, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { feedbackApi } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/auth-store';
import { FeedbackKategori } from '@/lib/types';
import { cn } from '@/lib/utils';

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const kategoriOptions = [
  {
    value: 'bug' as FeedbackKategori,
    label: 'Bug',
    description: 'Laporkan masalah atau error',
    icon: Bug,
    color: 'text-red-500',
    bgColor: 'bg-red-100 dark:bg-red-500/20',
    borderColor: 'border-red-500',
  },
  {
    value: 'saran' as FeedbackKategori,
    label: 'Saran',
    description: 'Ide fitur atau perbaikan',
    icon: Lightbulb,
    color: 'text-amber-500',
    bgColor: 'bg-amber-100 dark:bg-amber-500/20',
    borderColor: 'border-amber-500',
  },
  {
    value: 'lainnya' as FeedbackKategori,
    label: 'Lainnya',
    description: 'Feedback umum',
    icon: MessageSquare,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100 dark:bg-blue-500/20',
    borderColor: 'border-blue-500',
  },
];

export function FeedbackDialog({ open, onOpenChange }: FeedbackDialogProps) {
  const { isAuthenticated, user } = useAuthStore();
  const [kategori, setKategori] = useState<FeedbackKategori>('saran');
  const [pesan, setPesan] = useState('');
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');

  const submitMutation = useMutation({
    mutationFn: () =>
      feedbackApi.submit({
        kategori,
        pesan,
        ...(isAuthenticated ? {} : { nama, email }),
      }),
    onSuccess: () => {
      toast.success('Feedback berhasil dikirim. Terima kasih! 🎉');
      onOpenChange(false);
      // Reset form
      setKategori('saran');
      setPesan('');
      setNama('');
      setEmail('');
    },
    onError: () => {
      toast.error('Gagal mengirim feedback');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pesan.trim() || pesan.length < 10) {
      toast.error('Pesan minimal 10 karakter');
      return;
    }
    if (!isAuthenticated && (!nama.trim() || !email.trim())) {
      toast.error('Nama dan email wajib diisi');
      return;
    }
    submitMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Kirim Feedback</DialogTitle>
          <DialogDescription>
            Bantu kami meningkatkan Grafikarsa dengan saran dan masukanmu
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Kategori Selection */}
          <div className="space-y-2">
            <Label>Kategori</Label>
            <div className="grid grid-cols-3 gap-2">
              {kategoriOptions.map((opt) => {
                const isSelected = kategori === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setKategori(opt.value)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 transition-all',
                      isSelected ? opt.borderColor : 'border-transparent bg-muted/50 hover:bg-muted'
                    )}
                  >
                    <div className={cn('rounded-lg p-2', opt.bgColor)}>
                      <opt.icon className={cn('h-5 w-5', opt.color)} />
                    </div>
                    <span className="text-sm font-medium">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Guest User Fields */}
          {!isAuthenticated && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nama">Nama</Label>
                <Input
                  id="nama"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Nama kamu"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                />
              </div>
            </div>
          )}

          {/* Authenticated User Info */}
          {isAuthenticated && user && (
            <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm">
              Mengirim sebagai <span className="font-medium">{user.nama}</span>
            </div>
          )}

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="pesan">Pesan</Label>
            <Textarea
              id="pesan"
              value={pesan}
              onChange={(e) => setPesan(e.target.value)}
              placeholder={
                kategori === 'bug'
                  ? 'Jelaskan masalah yang kamu temukan...'
                  : kategori === 'saran'
                    ? 'Ceritakan ide atau saran kamu...'
                    : 'Tulis feedback kamu...'
              }
              rows={4}
              required
              minLength={10}
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground">{pesan.length}/2000 karakter</p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={submitMutation.isPending}>
              {submitMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Kirim Feedback
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
