
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
      <DialogContent className="sm:max-w-[600px] p-0">
        <ScrollArea className="max-h-[90vh]">
          <div className="relative h-64 w-full">
            <Image
              src={fetish.imageUrl}
              alt={`Imagem representando ${fetish.title}`}
              layout="fill"
              objectFit="cover"
              data-ai-hint={fetish.aiHint}
            />
          </div>
          <div className="p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold mb-2">{fetish.title}</DialogTitle>
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
