"use client";

import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { X } from 'lucide-react';
import Image from 'next/image';


interface SecretChatButtonProps {
    onClick: () => void;
    isChatOpen: boolean;
}

export default function SecretChatButton({ onClick, isChatOpen }: SecretChatButtonProps) {
    return (
       <div
            className={cn(
                "fixed bottom-6 left-6 z-[1001] flex flex-col items-center gap-2"
            )}
       >
            <div className="bg-card border border-primary/50 text-foreground font-semibold px-4 py-2 rounded-full shadow-lg order-2">
                Chat Secreto
            </div>
            <Button
                onClick={onClick}
                aria-label={isChatOpen ? "Fechar Chat Secreto" : "Abrir Chat Secreto"}
                className={cn(
                    "flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg transition-all duration-300 order-1",
                    "bg-primary hover:bg-primary/90 animate-pulse-red-glow"
                )}
            >
                {isChatOpen ? <X className="h-9 w-9" /> : (
                    <Image
                        src="https://firebasestorage.googleapis.com/v0/b/authkit-y9vjx.appspot.com/o/e3e020e4-54c3-4d2c-a2b1-3e4b7b25e79c.png?alt=media"
                        alt="Chat Secreto"
                        width={40}
                        height={40}
                        className="object-contain"
                    />
                )}
            </Button>
       </div>
    );
}
