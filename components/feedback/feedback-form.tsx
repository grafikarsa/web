'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Bug, Lightbulb, MessageSquare, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { feedbackApi } from '@/lib/api';
import { FeedbackKategori } from '@/lib/types';
import { cn } from '@/lib/utils';

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

interface FeedbackFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeedbackForm({ open, onOpenChange }: FeedbackFormProps) {
  const [kategori, setKategori] = useState<FeedbackKategori | null>(null);
  const [pesan, setPesan] = useState('');

  const mutation = useMutation({
    mutationFn: () => feedbackApi.create({ kategori: kategori!, pesan }),
    onSuccess: () => {
      toast.success('Terima kasih! Feedback kamu sudah terkirim.');
      setKategori(null);
      setPesan('');
      onOpenChange(false);
    },
    onError: () => {
      toast.error('Gagal mengirim feedback. Coba lagi nanti.');
    },
  });

  const handleSubmit = () => {
    if (!kategori) {
      toast.error('Pilih kategori feedback');
      return;
    }
    if (pesan.length < 10) {
      toast.error('Pesan minimal 10 karakter');
      return;
    }
    mutation.mutate();
  };

  const selectedKategori = kategoriOptions.find((k) => k.value === kategori);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Kirim Feedback</DialogTitle>
          <DialogDescription>
            Bantu kami meningkatkan Grafikarsa dengan feedback kamu
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
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
                      isSelected
                        ? `${opt.borderColor} ${opt.bgColor}`
                        : 'border-transparent bg-muted hover:bg-muted/80'
                    )}
                  >
                    <opt.icon className={cn('h-5 w-5', isSelected ? opt.color : 'text-muted-foreground')} />
                    <span className={cn('text-xs font-medium', isSelected && opt.color)}>{opt.label}</span>
                  </button>
                );
              })}
            </div>
            {selectedKategori && (
              <p className="text-xs text-muted-foreground">{selectedKategori.description}</p>
            )}
          </div>

          {/* Pesan */}
          <div className="space-y-2">
            <Label htmlFor="pesan">Pesan</Label>
            <Textarea
              id="pesan"
              value={pesan}
              onChange={(e) => setPesan(e.target.value)}
              placeholder="Ceritakan feedback kamu..."
              rows={4}
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground text-right">{pesan.length}/2000</p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={mutation.isPending || !kategori || pesan.length < 10}>
            {mutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Kirim
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
