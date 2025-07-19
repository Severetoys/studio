
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from 'next/image';
import type { Fetish } from '@/lib/fetish-data';

interface FetishModalProps {
  fetish: Fetish;
  isOpen: boolean;
  onClose: () => void;
}

export default function FetishModal({ fetish, isOpen, onClose }: FetishModalProps) {
  if (!fetish) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 bg-card border-primary shadow-neon-red-strong">
        <ScrollArea className="max-h-[90vh]">
          <div className="relative h-64 w-full">
            <Image
              src={fetish.imageUrl}
              alt={`Imagem representando ${fetish.title}`}
              fill
              objectFit="cover"
              className="opacity-80"
              data-ai-hint={fetish.aiHint}
            />
             <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
          </div>
          <div className="p-6 pt-0 -mt-8 relative z-10">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold mb-2 text-shadow-neon-red-light">{fetish.title}</DialogTitle>
              <DialogDescription asChild>
                <p className="text-base text-muted-foreground whitespace-pre-wrap">
                  {fetish.description}
                </p>
              </DialogDescription>
            </DialogHeader>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
