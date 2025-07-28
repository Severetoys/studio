
"use client";

import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { X } from 'lucide-react';

const TelegramIcon = ({ className }: { className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        className={className}
    >
        <path d="M21.8,3.2c-0.4-0.3-0.9-0.4-1.4-0.1L3.9,8.6C3.4,8.8,3,9.3,3,9.8s0.4,1,0.9,1.2l4.9,1.6l1.6,4.9c0.2,0.5,0.7,0.9,1.2,0.9c0.1,0,0.2,0,0.3,0c0.5-0.1,0.9-0.4,1.1-0.8l5.5-16.5C22.2,4.1,22.1,3.5,21.8,3.2z M17.2,7.2L11,13.4l-3.3-1.1L17.2,7.2z M10.1,16.2l-1.1-3.3l6.2-6.2L10.1,16.2z" />
    </svg>
);


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
            <div className="bg-card/90 backdrop-blur-sm border border-primary/50 text-foreground font-semibold px-4 py-2 rounded-full shadow-lg order-1">
                Chat Secreto
            </div>
            <Button
                onClick={onClick}
                aria-label={isChatOpen ? "Fechar Chat Secreto" : "Abrir Chat Secreto"}
                className={cn(
                    "flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg transition-all duration-300 order-2",
                    "bg-primary hover:bg-primary/90 animate-pulse-red-glow"
                )}
            >
                {isChatOpen ? <X className="h-9 w-9" /> : <TelegramIcon className="h-9 w-9" />}
            </Button>
       </div>
    );
}
