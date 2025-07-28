
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
            <div className="order-1 text-lg font-bold text-yellow-300 animate-pulse-gold-glow">
                CHAT SECRETO
            </div>
            <button
                onClick={onClick}
                aria-label={isChatOpen ? "Fechar Chat Secreto" : "Abrir Chat Secreto"}
                className={cn(
                    "relative h-16 w-16 transition-all duration-300 order-2 group animate-pulse-red-glow rounded-full"
                )}
            >
                {isChatOpen ? (
                    <div className="flex items-center justify-center h-full w-full bg-card rounded-full border-2 border-primary">
                        <X className="h-9 w-9 text-primary" />
                    </div>
                ) : (
                    <Image
                        src="https://firebasestorage.googleapis.com/v0/b/authkit-y9vjx.firebasestorage.app/o/Assunto%203.png?alt=media&token=1f653566-20cd-4934-a754-81548a3e7007"
                        alt="Chat Secreto"
                        width={64}
                        height={64}
                        className="object-contain transition-transform duration-300 group-hover:scale-110 rounded-full"
                    />
                )}
            </button>
       </div>
    );
}
