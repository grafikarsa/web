'use client';

import { useState } from 'react';
import { MessageSquarePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FeedbackForm } from './feedback-form';

export function FeedbackButton() {
  const [open, setOpen] = useState(false);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-lg"
            onClick={() => setOpen(true)}
          >
            <MessageSquarePlus className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Kirim Feedback</p>
        </TooltipContent>
      </Tooltip>

      <FeedbackForm open={open} onOpenChange={setOpen} />
    </TooltipProvider>
  );
}
