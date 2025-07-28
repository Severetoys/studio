
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface GoogleScriptModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  url: string;
  title: string;
}

export default function GoogleScriptModal({ isOpen, onOpenChange, url, title }: GoogleScriptModalProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 relative">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}
            {url && (
                <iframe
                    src={url}
                    className="w-full h-full border-0"
                    onLoad={() => setIsLoading(false)}
                    title={title}
                />
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
